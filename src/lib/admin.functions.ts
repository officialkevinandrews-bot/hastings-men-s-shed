import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DEFAULT_GALLERY_CATEGORIES,
  DEFAULT_GALLERY_ITEMS,
  mergeSiteContent,
  slugify,
  type RawCmsTables,
  type SiteContentBundle,
} from "@/lib/cms-defaults";

export interface AdminUserRecord {
  id: string;
  email: string;
  display_name: string;
  role: "owner" | "admin";
  is_active: boolean;
  added_by: string | null;
  created_at: string;
}

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  enquiry_type: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "archived";
  admin_notes: string;
  created_at: string;
}

export interface AdminDashboardPayload {
  currentAdmin: AdminUserRecord;
  siteContent: SiteContentBundle;
  enquiries: EnquiryRecord[];
  admins: AdminUserRecord[];
}

function extractEmailFromClaims(claims: unknown): string {
  if (!claims || typeof claims !== "object") return "";
  const raw = (claims as Record<string, unknown>)["email"];
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

async function resolveActiveAdmin(claims: unknown): Promise<AdminUserRecord | null> {
  const email = extractEmailFromClaims(claims);
  if (!email) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    display_name: data.display_name,
    role: data.role === "owner" ? "owner" : "admin",
    is_active: data.is_active,
    added_by: data.added_by,
    created_at: data.created_at,
  };
}

async function requireActiveAdmin(claims: unknown): Promise<AdminUserRecord> {
  const admin = await resolveActiveAdmin(claims);
  if (!admin) {
    throw new Error("Forbidden: This email address is not authorised to access the Shed admin panel.");
  }
  return admin;
}

async function requireOwner(claims: unknown): Promise<AdminUserRecord> {
  const admin = await requireActiveAdmin(claims);
  if (admin.role !== "owner") {
    throw new Error("Forbidden: Only the site owner can manage admin access.");
  }
  return admin;
}

// ---------- AUTH & ALLOWLIST ACCOUNT ACTIVATION ----------

const activateSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(8, "Please choose a password of at least 8 characters").max(128),
});

export const activateAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => activateSchema.parse(d))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: allowRow } = await supabaseAdmin
      .from("admin_users")
      .select("email, display_name, is_active")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (!allowRow) {
      return {
        ok: false as const,
        message:
          "That email address is not on the authorised Shed committee list. Please ask the site owner to add your email first.",
      };
    }

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: allowRow.display_name || email },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return {
          ok: false as const,
          message:
            "An account already exists for this email. Please sign in with Google or your password — or use 'Forgot password?' below.",
        };
      }
      console.error("[Admin activate] failed:", error);
      return { ok: false as const, message: "Could not set up your account right now. Please try again." };
    }

    return { ok: true as const, message: "Your admin password is set! Signing you in now..." };
  });

const resetSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  redirectTo: z.string().url().optional(),
});

export const requestAdminPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => resetSchema.parse(d))
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: allowRow } = await supabaseAdmin
      .from("admin_users")
      .select("email")
      .eq("email", email)
      .eq("is_active", true)
      .maybeSingle();

    // Always return a calm message so non-admins cannot probe emails,
    // and only actually trigger reset emails for allowlisted admins.
    if (allowRow) {
      await supabaseAdmin.auth.resetPasswordForEmail(
        email,
        data.redirectTo ? { redirectTo: data.redirectTo } : undefined,
      );
    }

    return {
      ok: true as const,
      message:
        "If that email is on the authorised Shed admin list, we've sent a password reset link. Please check your inbox (and junk folder).",
    };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = extractEmailFromClaims(context.claims);
    const admin = await resolveActiveAdmin(context.claims);
    if (!admin) {
      return { authorized: false as const, email, admin: null };
    }
    return { authorized: true as const, email, admin };
  });

export const getAdminDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminDashboardPayload> => {
    const currentAdmin = await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [
      settingsRes,
      hoursRes,
      annRes,
      imagesRes,
      catsRes,
      itemsRes,
      contentRes,
      trusteesRes,
      supportersRes,
      friendsRes,
      enquiriesRes,
      adminsRes,
    ] = await Promise.all([
      supabaseAdmin.from("site_settings").select("*").eq("id", "main").maybeSingle(),
      supabaseAdmin.from("opening_hours").select("*").order("day_order", { ascending: true }),
      supabaseAdmin.from("announcements").select("*").eq("id", "main").maybeSingle(),
      supabaseAdmin.from("site_images").select("*"),
      supabaseAdmin.from("gallery_categories").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("gallery_items").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("page_content").select("content_key,value_text"),
      supabaseAdmin.from("trustees").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("supporters").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("friends_of_shed").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("commission_enquiries").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("admin_users").select("*").order("created_at", { ascending: true }),
    ]);

    const raw: RawCmsTables = {
      settings: settingsRes.data ?? null,
      openingHours: hoursRes.data ?? [],
      announcement: annRes.data ?? null,
      siteImages: imagesRes.data ?? [],
      galleryCategories: catsRes.data ?? [],
      galleryItems: itemsRes.data ?? [],
      pageContent: contentRes.data ?? [],
      trustees: trusteesRes.data ?? [],
      supporters: supportersRes.data ?? [],
      friends: friendsRes.data ?? [],
    };

    const enquiries: EnquiryRecord[] = (enquiriesRes.data ?? []).map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      enquiry_type: e.enquiry_type,
      message: e.message,
      status:
        e.status === "in_progress" || e.status === "replied" || e.status === "archived"
          ? e.status
          : "new",
      admin_notes: e.admin_notes ?? "",
      created_at: e.created_at,
    }));

    const admins: AdminUserRecord[] = (adminsRes.data ?? []).map((a) => ({
      id: a.id,
      email: a.email,
      display_name: a.display_name,
      role: a.role === "owner" ? "owner" : "admin",
      is_active: a.is_active,
      added_by: a.added_by,
      created_at: a.created_at,
    }));

    return {
      currentAdmin,
      siteContent: mergeSiteContent(raw),
      enquiries,
      admins,
    };
  });

// ---------- IMAGE UPLOAD (AUTO-CREATES shed-media BUCKET IF NEEDED) ----------

const uploadMediaSchema = z.object({
  base64Data: z.string().min(10),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  fileName: z.string().trim().min(1).max(160),
  folder: z.enum(["gallery", "site", "supporters"]),
});

export const uploadAdminMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadMediaSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const fileBuffer = Buffer.from(data.base64Data, "base64");
    if (fileBuffer.byteLength > 10 * 1024 * 1024) {
      throw new Error("Image is larger than 10 MB after compression. Please pick a smaller image.");
    }

    let bucketIsPublic = true;
    const { data: existingBucket, error: bucketCheckErr } = await supabaseAdmin.storage.getBucket("shed-media");
    if (bucketCheckErr || !existingBucket) {
      const { error: pubErr } = await supabaseAdmin.storage.createBucket("shed-media", {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      });
      if (pubErr) {
        const { error: privErr } = await supabaseAdmin.storage.createBucket("shed-media", {
          public: false,
          fileSizeLimit: 10 * 1024 * 1024,
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        });
        if (privErr && !privErr.message.toLowerCase().includes("already")) {
          console.error("[Admin media] createBucket failed:", pubErr, privErr);
          throw new Error("Could not prepare image storage bucket. Please try again.");
        }
        bucketIsPublic = false;
      }
    } else {
      bucketIsPublic = Boolean(existingBucket.public);
    }

    const safeFile = data.fileName.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    const objectPath = `${data.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeFile}`;

    const { error: uploadErr } = await supabaseAdmin.storage.from("shed-media").upload(objectPath, fileBuffer, {
      contentType: data.contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadErr) {
      console.error("[Admin media] upload failed:", uploadErr);
      throw new Error(`Upload failed: ${uploadErr.message}`);
    }

    const url = bucketIsPublic
      ? supabaseAdmin.storage.from("shed-media").getPublicUrl(objectPath).data.publicUrl
      : `/api/media/${objectPath}`;

    return { ok: true as const, url, path: objectPath };
  });

// ---------- SITE SETTINGS ----------

const siteSettingsSchema = z.object({
  joining_fee: z.string().trim().min(1).max(40),
  session_fee: z.string().trim().min(1).max(40),
  session_fee_short: z.string().trim().min(1).max(60),
  session_fee_note: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(3).max(40),
  email: z.string().trim().email().max(120),
  sales_email: z.string().trim().email().max(120),
  facebook_url: z.string().trim().url().max(300),
  donate_url: z.string().trim().url().max(300),
  address_lines: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => siteSettingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        id: "main",
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- OPENING HOURS ----------

const openingHoursSchema = z.array(
  z.object({
    day_order: z.number().int().min(1).max(7),
    day_name: z.string().trim().min(2).max(20),
    is_open: z.boolean(),
    open_time: z.string().trim().max(20),
    close_time: z.string().trim().max(20),
    hours_display: z.string().trim().max(60),
    note: z.string().trim().max(120),
  }),
).length(7);

export const saveOpeningHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => openingHoursSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const rows = data.map((row) => ({
      day_order: row.day_order,
      day_name: row.day_name,
      is_open: row.is_open,
      open_time: row.open_time || "10:00am",
      close_time: row.close_time || "4:00pm",
      hours_display: row.is_open ? row.hours_display || `${row.open_time} – ${row.close_time}` : "Closed",
      note: row.note,
      updated_at: now,
    }));
    const { error } = await supabaseAdmin.from("opening_hours").upsert(rows, { onConflict: "day_order" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- ANNOUNCEMENTS ----------

const announcementSchema = z.object({
  enabled: z.boolean(),
  variant: z.enum(["info", "event", "closure"]),
  message: z.string().trim().max(400),
  link_label: z.string().trim().max(80),
  link_url: z.string().trim().max(300),
  expires_at: z.string().nullable(),
});

export const saveAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => announcementSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("announcements").upsert(
      {
        id: "main",
        enabled: data.enabled,
        variant: data.variant,
        message: data.message,
        link_label: data.link_label,
        link_url: data.link_url,
        expires_at: data.expires_at || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- SITE IMAGES ----------

const upsertSiteImageSchema = z.object({
  slot_key: z.string().trim().min(1).max(80),
  page_group: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  image_url: z.string().trim().min(1).max(1000),
  alt_text: z.string().trim().max(300),
  caption: z.string().trim().max(500),
  focal_point: z.enum(["center", "top", "bottom", "left", "right"]),
});

export const upsertSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertSiteImageSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_images").upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slot_key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const resetSlotSchema = z.object({ slot_key: z.string().trim().min(1).max(80) });

export const resetSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetSlotSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_images").delete().eq("slot_key", data.slot_key);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- GALLERY CATEGORIES & ITEMS ("MADE IN THE SHED") ----------

async function ensureGallerySeededInDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existingCats } = await supabaseAdmin.from("gallery_categories").select("id, slug");
  if (existingCats && existingCats.length > 0) return;

  const insertedCats: Array<{ id: string; slug: string }> = [];
  for (const cat of DEFAULT_GALLERY_CATEGORIES) {
    const { data, error } = await supabaseAdmin
      .from("gallery_categories")
      .insert({ slug: cat.slug, name: cat.name, sort_order: cat.sort_order })
      .select("id, slug")
      .single();
    if (error) throw new Error(error.message);
    insertedCats.push(data);
  }

  const idByDefaultCat = new Map<string, string>();
  DEFAULT_GALLERY_CATEGORIES.forEach((c, idx) => {
    const real = insertedCats[idx];
    if (real) idByDefaultCat.set(c.id, real.id);
  });

  const rows = DEFAULT_GALLERY_ITEMS.map((item) => ({
    slug: item.slug,
    title: item.title,
    category_id: idByDefaultCat.get(item.category_id) ?? insertedCats[0]!.id,
    image_url: item.image_url,
    sort_order: item.sort_order,
    is_visible: item.is_visible,
    is_featured: item.is_featured,
    for_sale: item.for_sale,
    price_label: item.price_label,
  }));

  const { error: itemsErr } = await supabaseAdmin.from("gallery_items").insert(rows);
  if (itemsErr) throw new Error(itemsErr.message);
}

export const seedDefaultGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireActiveAdmin(context.claims);
    await ensureGallerySeededInDb();
    return { ok: true as const };
  });

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Please enter a group name").max(80),
  sort_order: z.number().int().min(0).max(999).optional(),
});

export const upsertGalleryCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    await ensureGallerySeededInDb();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("gallery_categories")
        .update({
          name: data.name,
          slug: slugify(data.name),
          ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    }

    const { data: maxRow } = await supabaseAdmin
      .from("gallery_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = data.sort_order ?? ((maxRow?.sort_order ?? -1) + 1);
    const baseSlug = slugify(data.name);
    const { error } = await supabaseAdmin.from("gallery_categories").insert({
      name: data.name,
      slug: `${baseSlug}-${Math.random().toString(36).slice(2, 5)}`,
      sort_order: nextOrder,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const deleteCategorySchema = z.object({
  id: z.string().uuid(),
  reassignToId: z.string().uuid().optional(),
});

export const deleteGalleryCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteCategorySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.reassignToId && data.reassignToId !== data.id) {
      const { error: moveErr } = await supabaseAdmin
        .from("gallery_items")
        .update({ category_id: data.reassignToId })
        .eq("category_id", data.id);
      if (moveErr) throw new Error(moveErr.message);
    }

    const { count } = await supabaseAdmin
      .from("gallery_items")
      .select("id", { count: "exact", head: true })
      .eq("category_id", data.id);

    if ((count ?? 0) > 0) {
      throw new Error(
        `There are still ${count} photo(s) in this group. Please move them to another group first before deleting it.`,
      );
    }

    const { error } = await supabaseAdmin.from("gallery_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Please give this photo a name").max(140),
  category_id: z.string().uuid("Please choose a group"),
  image_url: z.string().trim().min(1, "Please upload a photo").max(1000),
  sort_order: z.number().int().min(0).max(9999).optional(),
  is_visible: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  for_sale: z.boolean().default(false),
  price_label: z.string().trim().max(80).default(""),
});

export const upsertGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => galleryItemSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    await ensureGallerySeededInDb();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("gallery_items")
        .update({
          title: data.title,
          category_id: data.category_id,
          image_url: data.image_url,
          ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {}),
          is_visible: data.is_visible,
          is_featured: data.is_featured,
          for_sale: data.for_sale,
          price_label: data.price_label,
          updated_at: now,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true as const };
    }

    const { data: minRow } = await supabaseAdmin
      .from("gallery_items")
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    // Put brand new photos at the front or shift gracefully
    const nextOrder = data.sort_order ?? Math.max(0, (minRow?.sort_order ?? 1) - 1);
    const uniqueSlug = `${slugify(data.title)}-${Date.now().toString(36)}`;
    const { error } = await supabaseAdmin.from("gallery_items").insert({
      slug: uniqueSlug,
      title: data.title,
      category_id: data.category_id,
      image_url: data.image_url,
      sort_order: nextOrder,
      is_visible: data.is_visible,
      is_featured: data.is_featured,
      for_sale: data.for_sale,
      price_label: data.price_label,
      updated_at: now,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const deleteGalleryItemSchema = z.object({ id: z.string().uuid() });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteGalleryItemSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("gallery_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export const reorderGalleryItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => reorderSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      data.orderedIds.map((id, idx) =>
        supabaseAdmin.from("gallery_items").update({ sort_order: idx }).eq("id", id),
      ),
    );
    return { ok: true as const };
  });

// ---------- PAGE TEXT CONTENT ----------

const upsertContentSchema = z.object({
  content_key: z.string().trim().min(1).max(100),
  page_group: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(140),
  value_text: z.string().trim().min(1, "Text cannot be empty").max(4000),
});

export const upsertPageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => upsertContentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("page_content").upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "content_key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const resetContentSchema = z.object({ content_key: z.string().trim().min(1).max(100) });

export const resetPageContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetContentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("page_content").delete().eq("content_key", data.content_key);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- TRUSTEES, SUPPORTERS & FRIENDS ----------

const trusteesListSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(120),
    role: z.string().trim().min(1).max(120),
  }),
);

export const saveTrustees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => trusteesListSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("trustees").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (data.length > 0) {
      const { error } = await supabaseAdmin
        .from("trustees")
        .insert(data.map((t, i) => ({ name: t.name, role: t.role, sort_order: i })));
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

const supportersListSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(140),
    logo_url: z.string().trim().min(1).max(1000),
    description: z.string().trim().max(1000),
    show_in_footer: z.boolean(),
    show_on_about: z.boolean(),
  }),
);

export const saveSupporters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => supportersListSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("supporters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (data.length > 0) {
      const { error } = await supabaseAdmin
        .from("supporters")
        .insert(data.map((s, i) => ({ ...s, sort_order: i })));
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

const friendsListSchema = z.array(
  z.object({
    name: z.string().trim().min(1).max(140),
    description: z.string().trim().max(800),
  }),
);

export const saveFriends = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => friendsListSchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("friends_of_shed").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (data.length > 0) {
      const { error } = await supabaseAdmin
        .from("friends_of_shed")
        .insert(data.map((f, i) => ({ name: f.name, description: f.description, sort_order: i })));
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

// ---------- ENQUIRIES INBOX ----------

const updateEnquirySchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "in_progress", "replied", "archived"]),
  admin_notes: z.string().max(2000),
});

export const updateEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateEnquirySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("commission_enquiries")
      .update({ status: data.status, admin_notes: data.admin_notes })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const deleteEnquirySchema = z.object({ id: z.string().uuid() });

export const deleteEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteEnquirySchema.parse(d))
  .handler(async ({ data, context }) => {
    await requireActiveAdmin(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("commission_enquiries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- ADMIN TEAM MANAGEMENT (OWNER ONLY) ----------

const addAdminSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  display_name: z.string().trim().min(1, "Please enter their name").max(120),
});

export const addAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => addAdminSchema.parse(d))
  .handler(async ({ data, context }) => {
    const owner = await requireOwner(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedEmail = data.email.trim().toLowerCase();

    const { error } = await supabaseAdmin.from("admin_users").insert({
      email: normalizedEmail,
      display_name: data.display_name,
      role: "admin",
      is_active: true,
      added_by: owner.email,
    });
    if (error) {
      if (error.message.toLowerCase().includes("duplicate") || error.code === "23505") {
        throw new Error("That email address is already on the admin list.");
      }
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

const updateAdminSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().trim().min(1).max(120),
  is_active: z.boolean(),
});

export const updateAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateAdminSchema.parse(d))
  .handler(async ({ data, context }) => {
    const owner = await requireOwner(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target } = await supabaseAdmin.from("admin_users").select("*").eq("id", data.id).maybeSingle();
    if (!target) throw new Error("Admin user not found.");
    if (target.email === owner.email && !data.is_active) {
      throw new Error("You cannot pause your own Owner access.");
    }

    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ display_name: data.display_name, is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const removeAdminSchema = z.object({ id: z.string().uuid() });

export const removeAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => removeAdminSchema.parse(d))
  .handler(async ({ data, context }) => {
    const owner = await requireOwner(context.claims);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: target } = await supabaseAdmin.from("admin_users").select("*").eq("id", data.id).maybeSingle();
    if (!target) throw new Error("Admin user not found.");
    if (target.email === owner.email || target.role === "owner") {
      throw new Error("The site owner account cannot be removed.");
    }

    const { error } = await supabaseAdmin.from("admin_users").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

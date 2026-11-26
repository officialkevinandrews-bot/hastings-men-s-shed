import { createServerFn } from "@tanstack/react-start";
import { buildDefaultSiteContent, mergeSiteContent, type RawCmsTables, type SiteContentBundle } from "@/lib/cms-defaults";

export const getPublicSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContentBundle> => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
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
      ] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", "main").maybeSingle(),
        supabase.from("opening_hours").select("*").order("day_order", { ascending: true }),
        supabase.from("announcements").select("*").eq("id", "main").maybeSingle(),
        supabase.from("site_images").select("*"),
        supabase.from("gallery_categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("gallery_items").select("*").order("sort_order", { ascending: true }),
        supabase.from("page_content").select("content_key,value_text").neq("page_group", "flyer_studio"),
        supabase.from("trustees").select("*").order("sort_order", { ascending: true }),
        supabase.from("supporters").select("*").order("sort_order", { ascending: true }),
        supabase.from("friends_of_shed").select("*").order("sort_order", { ascending: true }),
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
      return mergeSiteContent(raw);
    } catch (err) {
      console.warn("[CMS] Falling back to built-in default site content:", err);
      return buildDefaultSiteContent();
    }
  },
);

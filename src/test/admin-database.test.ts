// @vitest-environment node
// Evaluate installed grants and RLS expressions against real JWT claims.
// The sandbox database account cannot SET ROLE authenticated/anon, so these
// are policy-expression checks, not HTTP/session impersonation tests.
// All fixture writes are rolled back; no test records persist.
import postgres, { type TransactionSql } from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const rollback = new Error("rollback test transaction");
let database: ReturnType<typeof postgres> | undefined;
beforeAll(() => {
  const url = process.env["SUPABASE_DB_URL"];
  if (!url) throw new Error("SUPABASE_DB_URL is required for database access tests");
  database = postgres(url, { max: 1, onnotice: () => {} });
});
afterAll(async () => { await database?.end(); });
async function transaction(check: (tx: TransactionSql) => Promise<void>) {
  if (!database) throw new Error("Database tests are not configured");
  try { await database.begin(async (tx) => { await check(tx); throw rollback; }); }
  catch (error) { if (error !== rollback) throw error; }
}
async function identity(tx: TransactionSql, email: string, role = "authenticated") {
  await tx`SELECT set_config('request.jwt.claims', ${JSON.stringify({ email, role })}, true)`;
}
async function adminFixture(tx: TransactionSql, active = true) {
  await tx`INSERT INTO public.admin_users (email, role, is_active) VALUES ('rls-admin@example.invalid', 'admin', ${active})`;
}
async function permitted(tx: TransactionSql, table: string, action: string, role: string, bucket = "shed-media") {
  const schema = table === "objects" ? "storage" : "public";
  const access = await tx`SELECT has_table_privilege(${role}, ${`${schema}.${table}`}, ${action}) AS granted,
    (SELECT relrowsecurity FROM pg_class WHERE oid = ${`${schema}.${table}`}::regclass) AS rls`;
  expect(access[0]?.["rls"]).toBe(true);
  if (!access[0]?.["granted"]) return false;
  const policies = await tx`SELECT qual, with_check FROM pg_policies
    WHERE schemaname=${schema} AND tablename=${table} AND (cmd=${action} OR cmd='ALL')
    AND (${role}=ANY(roles::text[]) OR 'public'=ANY(roles::text[]))`;
  for (const policy of policies) {
    const using = policy["qual"] as string | null;
    const check = policy["with_check"] as string | null;
    const expression = action === "INSERT" ? check : action === "UPDATE" ? `(${using ?? "true"}) AND (${check ?? using ?? "true"})` : using;
    // Expressions come only from installed database policies, not user content.
    const rows = await tx.unsafe(`SELECT (${expression ?? "true"}) AS allowed FROM (SELECT $1::text AS bucket_id) candidate`, [bucket]);
    if (rows[0]?.["allowed"] === true) return true;
  }
  return false;
}

describe.sequential("Shed installed database rules", () => {
  it("seeds only Kevin Andrews as the active owner", async () => {
    if (!database) throw new Error("Database tests are not configured");
    const rows = await database`SELECT email,display_name,role,is_active,added_by FROM public.admin_users`;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: "officialkevinandrews@gmail.com", display_name: "Kevin Andrews", role: "owner", is_active: true, added_by: "system" });
  });
  it("recognises the owner case-insensitively", async () => {
    await transaction(async (tx) => {
      await identity(tx, "OFFICIALKEVINANDREWS@GMAIL.COM");
      expect((await tx`SELECT public.is_shed_admin() AS admin, public.is_shed_owner() AS owner`)[0]).toMatchObject({ admin: true, owner: true });
    });
  });
  it("rejects inactive admins", async () => {
    await transaction(async (tx) => {
      await adminFixture(tx, false); await identity(tx, "rls-admin@example.invalid");
      expect((await tx`SELECT public.is_shed_admin() AS admin, public.is_shed_owner() AS owner`)[0]).toMatchObject({ admin: false, owner: false });
    });
  });
  it("rejects unlisted accounts and missing email claims", async () => {
    await transaction(async (tx) => {
      await identity(tx, "unlisted@example.invalid");
      expect((await tx`SELECT public.is_shed_admin() AS admin`)[0]?.["admin"]).toBe(false);
      await tx`SELECT set_config('request.jwt.claims', '{}', true)`;
      expect((await tx`SELECT public.is_shed_admin() AS admin`)[0]?.["admin"]).toBe(false);
    });
  });
  for (const action of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
    it(`admin allowlist ${action}: owner-only changes and admin-only reads`, async () => {
      await transaction(async (tx) => {
        await adminFixture(tx);
        await identity(tx, "", "anon");
        expect(await permitted(tx, "admin_users", action, "anon")).toBe(false);
        await identity(tx, "unlisted@example.invalid");
        expect(await permitted(tx, "admin_users", action, "authenticated")).toBe(false);
        await identity(tx, "rls-admin@example.invalid");
        expect(await permitted(tx, "admin_users", action, "authenticated")).toBe(action === "SELECT");
        await identity(tx, "officialkevinandrews@gmail.com");
        expect(await permitted(tx, "admin_users", action, "authenticated")).toBe(true);
      });
    });
    it(`enquiries ${action}: private admin access, no direct client inserts`, async () => {
      await transaction(async (tx) => {
        await adminFixture(tx);
        await identity(tx, "", "anon");
        expect(await permitted(tx, "commission_enquiries", action, "anon")).toBe(false);
        await identity(tx, "unlisted@example.invalid");
        expect(await permitted(tx, "commission_enquiries", action, "authenticated")).toBe(false);
        await identity(tx, "rls-admin@example.invalid");
        expect(await permitted(tx, "commission_enquiries", action, "authenticated")).toBe(action !== "INSERT");
      });
    });
  }
  const cms = ["site_settings", "opening_hours", "announcements", "site_images", "gallery_categories", "gallery_items", "page_content", "trustees", "supporters", "friends_of_shed"];
  for (const table of [...cms, "objects"]) {
    for (const action of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
      it(`${table} ${action}: public reads, active-admin-only writes`, async () => {
        await transaction(async (tx) => {
          await adminFixture(tx);
          await identity(tx, "", "anon");
          expect(await permitted(tx, table, action, "anon")).toBe(action === "SELECT");
          await identity(tx, "unlisted@example.invalid");
          expect(await permitted(tx, table, action, "authenticated")).toBe(action === "SELECT");
          await identity(tx, "rls-admin@example.invalid");
          expect(await permitted(tx, table, action, "authenticated")).toBe(true);
          if (table === "objects") expect(await permitted(tx, table, action, "authenticated", "other-bucket")).toBe(false);
        });
      });
    }
  }
  it("defaults joining/session fees to £10.00/£3.00", async () => {
    await transaction(async (tx) => {
      const rows = await tx`INSERT INTO public.site_settings DEFAULT VALUES RETURNING joining_fee,session_fee,session_fee_short,session_fee_note`;
      expect(rows[0]).toMatchObject({ joining_fee: "£10.00", session_fee: "£3.00", session_fee_short: "£3 a session", session_fee_note: "Tea, coffee & biscuits included · £10 one-off joining fee" });
    });
  });
  it("defaults enquiries to new with empty admin notes", async () => {
    await transaction(async (tx) => {
      const rows = await tx`INSERT INTO public.commission_enquiries(name,email,enquiry_type,message) VALUES ('Test','test@example.invalid','Something else','Temporary test enquiry') RETURNING status,admin_notes`;
      expect(rows[0]).toMatchObject({ status: "new", admin_notes: "" });
    });
  });
  for (const status of ["new", "in_progress", "replied", "archived"]) {
    it(`accepts enquiry status ${status}`, async () => {
      await transaction(async (tx) => {
        const rows = await tx`INSERT INTO public.commission_enquiries(name,email,enquiry_type,message,status) VALUES ('Test','test@example.invalid','Something else','Temporary test enquiry',${status}) RETURNING status`;
        expect(rows[0]?.["status"]).toBe(status);
      });
    });
  }
  it("rejects other enquiry statuses", async () => {
    await expect(transaction(async (tx) => {
      await tx`INSERT INTO public.commission_enquiries(name,email,enquiry_type,message,status) VALUES ('Test','test@example.invalid','Something else','Temporary test enquiry','unknown')`;
    })).rejects.toMatchObject({ code: "23514" });
  });
  it("requires normalised allowlist emails and owner/admin roles", async () => {
    for (const [email, role] of [["UPPER@example.invalid", "admin"], [" padded@example.invalid ", "admin"], ["test@example.invalid", "superuser"]]) {
      await expect(transaction(async (tx) => { await tx`INSERT INTO public.admin_users(email,role) VALUES (${email ?? ""},${role ?? ""})`; })).rejects.toMatchObject({ code: "23514" });
    }
  });
  it("restricts opening day order to 1–7", async () => {
    for (const day of [1,7]) await transaction(async (tx) => {
      expect((await tx`INSERT INTO public.opening_hours(day_order,day_name) VALUES (${day},'Test') RETURNING day_order`)[0]?.["day_order"]).toBe(day);
    });
    for (const day of [0,8]) await expect(transaction(async (tx) => { await tx`INSERT INTO public.opening_hours(day_order,day_name) VALUES (${day},'Test')`; })).rejects.toMatchObject({ code: "23514" });
  });
  it("restricts announcement variants to info/event/closure", async () => {
    for (const variant of ["info","event","closure"]) await transaction(async (tx) => {
      expect((await tx`INSERT INTO public.announcements(variant) VALUES (${variant}) RETURNING variant`)[0]?.["variant"]).toBe(variant);
    });
    await expect(transaction(async (tx) => { await tx`INSERT INTO public.announcements(variant) VALUES ('unknown')`; })).rejects.toMatchObject({ code: "23514" });
  });
  it("restricts focal points to center/top/bottom/left/right", async () => {
    for (const point of ["center","top","bottom","left","right"]) await transaction(async (tx) => {
      expect((await tx`INSERT INTO public.site_images(slot_key,page_group,label,image_url,focal_point) VALUES ('test','test','Test','https://example.invalid/test.jpg',${point}) RETURNING focal_point`)[0]?.["focal_point"]).toBe(point);
    });
    await expect(transaction(async (tx) => { await tx`INSERT INTO public.site_images(slot_key,page_group,label,image_url,focal_point) VALUES ('test','test','Test','https://example.invalid/test.jpg','unknown')`; })).rejects.toMatchObject({ code: "23514" });
  });
});

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const ENQUIRY_TYPES = ["Custom woodwork / commission", "Furniture repair", "Bench or garden item", "Community project", "Something else"] as const;

// Notification recipient for testing only. Do not switch to sales@hastingsmenshed.org.uk until instructed.
export const ENQUIRY_NOTIFY_TO = "officialkevinandrews@gmail.com";

export const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  enquiry_type: z.enum(ENQUIRY_TYPES),
  message: z.string().trim().min(10, "A few more details would help").max(2000),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => enquirySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("commission_enquiries").insert({
      name: data.name, email: data.email, phone: data.phone || null, enquiry_type: data.enquiry_type, message: data.message,
    });
    if (error) { console.error("enquiry insert failed", error); return { ok: false as const }; }
    return { ok: true as const };
  });

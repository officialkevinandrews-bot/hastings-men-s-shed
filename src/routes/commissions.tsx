import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Mail, Phone, ShoppingBag, Wrench, Hammer } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { submitEnquiry, enquirySchema, ENQUIRY_TYPES } from "@/lib/enquiries.functions";
import { focalPointClass } from "@/lib/cms-defaults";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/commissions")({
  head: () => ({
    meta: [
      { title: "Commissions, Repairs & Sales | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "We undertake custom woodwork commissions and repair work, and sell handcrafted items in support of our charity (Registered Charity No. 1175075)." },
      { property: "og:title", content: "Commissions, Repairs & Item Sales — Hastings Men's Shed" },
      { property: "og:description", content: "Custom woodwork, furniture repairs, community commissions and handcrafted items for sale." },
    ],
  }),
  component: Commissions,
});

const field = "mt-1 w-full rounded-lg border-2 border-input bg-card px-4 py-3 text-lg focus:border-aqua focus:outline-none";

function Commissions() {
  const { settings, images, pageContent } = useSiteContent();
  const send = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mainPhoto = images["commissions.main"]!;
  const sub1 = images["commissions.sub1"]!;
  const sub2 = images["commissions.sub2"]!;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await send({ data: parsed.data });
      if (res.ok) setDone(true);
      else toast.error(`Sorry, we couldn't send that. Please try again or email us at ${settings.email}.`);
    } catch {
      toast.error(`Sorry, we couldn't send that. Please try again or email us at ${settings.email}.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Commissions, Repairs & Handcrafted Sales" title={pageContent["commissions.heroTitle"] ?? "Something made, mended, restored or bought"}>
        {pageContent["commissions.heroIntro"]}
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Hammer,
              title: "Custom Commissions",
              desc: "Bespoke bird tables, dovecotes, planters, shelving, animal hutches, and projects built to order for local residents, schools, and charities.",
            },
            {
              icon: Wrench,
              title: "Furniture & Item Repairs",
              desc: "Got a cherished wooden chair, garden bench, or household item that needs repairing or restoring? Our members love breathing new life into old items.",
            },
            {
              icon: ShoppingBag,
              title: "Handcrafted Items for Sale",
              desc: "Our members craft bowls, carvings, bird boxes, bug hotels, and gifts from recycled timber — often displayed outside the Shed on sunny days and available to purchase.",
            },
          ].map(({ icon: I, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <I className="h-7 w-7 text-primary" />
              <h2 className="mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <img
            src={mainPhoto.image_url}
            alt={mainPhoto.alt_text}
            className={`w-full rounded-3xl object-cover shadow-soft ${focalPointClass(mainPhoto.focal_point)}`}
          />
          <div className="grid grid-cols-2 gap-4">
            <img
              src={sub1.image_url}
              alt={sub1.alt_text}
              className={`aspect-square w-full rounded-2xl object-cover ${focalPointClass(sub1.focal_point)}`}
            />
            <img
              src={sub2.image_url}
              alt={sub2.alt_text}
              className={`aspect-square w-full rounded-2xl object-cover ${focalPointClass(sub2.focal_point)}`}
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-bold">Direct Contact for Enquiries</h3>
            <p className="mt-2 text-sm text-muted-foreground">{pageContent["commissions.directContactNote"]}</p>
            <div className="mt-4 space-y-2 text-base font-bold">
              <a href={settings.emailHref} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-5 w-5" /> {settings.email}
              </a>
              <a href={settings.salesEmailHref} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-5 w-5" /> {settings.sales_email}
              </a>
              <a href={settings.phoneHref} className="flex items-center gap-2 text-primary hover:underline">
                <Phone className="h-5 w-5" /> {settings.phone} (during opening hours)
              </a>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-soft md:p-10">
          {done ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-4 text-3xl font-extrabold">Thank you — we've got your enquiry</h2>
              <p className="mt-3 text-lg text-muted-foreground">
                One of our volunteer members will be in touch soon. You can also email photos or details directly to{" "}
                <a href={settings.emailHref} className="font-bold text-primary underline">
                  {settings.email}
                </a>
                .
              </p>
              <button onClick={() => setDone(false)} className="mt-6 font-bold text-primary underline">
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <h2 className="text-3xl font-extrabold">Send an enquiry</h2>
              <p className="text-sm text-muted-foreground">
                Fill in the form below or email us directly at{" "}
                <a href={settings.emailHref} className="font-bold text-primary underline">
                  {settings.email}
                </a>
                .
              </p>
              <label className="block font-bold">
                Your name
                <input name="name" className={field} autoComplete="name" />
                {errors["name"] && <span className="text-sm text-destructive">{errors["name"]}</span>}
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block font-bold">
                  Email
                  <input name="email" type="email" className={field} autoComplete="email" />
                  {errors["email"] && <span className="text-sm text-destructive">{errors["email"]}</span>}
                </label>
                <label className="block font-bold">
                  Phone <span className="font-normal text-muted-foreground">(optional)</span>
                  <input name="phone" type="tel" className={field} autoComplete="tel" />
                </label>
              </div>
              <label className="block font-bold">
                What's it about?
                <select name="enquiry_type" className={field} defaultValue={ENQUIRY_TYPES[0]}>
                  {ENQUIRY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block font-bold">
                Tell us more
                <textarea
                  name="message"
                  rows={6}
                  className={field}
                  placeholder="What would you like made, repaired or purchased? Rough sizes, timescales, or any helpful details."
                />
                {errors["message"] && <span className="text-sm text-destructive">{errors["message"]}</span>}
              </label>
              <button
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy && <Loader2 className="h-5 w-5 animate-spin" />} Send enquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

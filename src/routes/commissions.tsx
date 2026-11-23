import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/PageHero";
import { submitEnquiry, enquirySchema, ENQUIRY_TYPES } from "@/lib/enquiries.functions";
import { photo } from "@/lib/gallery";

export const Route = createFileRoute("/commissions")({
  head: () => ({
    meta: [
      { title: "Commissions & Repairs | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Ask the Hastings Men's Shed about custom woodwork, furniture repairs, bench refurbishments and community commissions." },
      { property: "og:title", content: "Commissions & Repairs — Hastings Men's Shed" },
      { property: "og:description", content: "Custom woodwork, furniture repairs and community commissions from our members." },
    ],
  }),
  component: Commissions,
});

const field = "mt-1 w-full rounded-lg border-2 border-input bg-card px-4 py-3 text-lg focus:border-aqua focus:outline-none";

function Commissions() {
  const send = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      else toast.error("Sorry, we couldn't send that. Please try again or give us a ring.");
    } catch {
      toast.error("Sorry, we couldn't send that. Please try again or give us a ring.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero eyebrow="Commissions & repairs" title="Something made, mended or restored">
        Our members take on custom woodwork, furniture repairs and projects for community groups. Tell us what you have in mind and we'll get back to you.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <img src={photo("bench-refurb").url} alt="A bench refurbished by Shed members" className="rounded-3xl shadow-soft" />
          <div className="grid grid-cols-2 gap-4">
            <img src={photo("pigeon-holes-for-hva").url} alt="Pigeon holes made for Hastings Voluntary Action" className="aspect-square w-full rounded-2xl object-cover" />
            <img src={photo("art-deco-style").url} alt="Art Deco style clock" className="aspect-square w-full rounded-2xl object-cover" />
          </div>
          <p className="text-muted-foreground">Commissions help fund the Shed. Prices depend on the job and materials — we'll talk it through with you first.</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-7 md:p-10">
          {done ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
              <h2 className="mt-4 text-3xl font-extrabold">Thank you — we've got it</h2>
              <p className="mt-3 text-lg text-muted-foreground">One of our members will be in touch. If it's urgent, call us during opening hours.</p>
              <button onClick={() => setDone(false)} className="mt-6 font-bold text-primary underline">Send another enquiry</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <h2 className="text-3xl font-extrabold">Send an enquiry</h2>
              <label className="block font-bold">Your name<input name="name" className={field} autoComplete="name" />{errors["name"] && <span className="text-sm text-destructive">{errors["name"]}</span>}</label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block font-bold">Email<input name="email" type="email" className={field} autoComplete="email" />{errors["email"] && <span className="text-sm text-destructive">{errors["email"]}</span>}</label>
                <label className="block font-bold">Phone <span className="font-normal text-muted-foreground">(optional)</span><input name="phone" type="tel" className={field} autoComplete="tel" /></label>
              </div>
              <label className="block font-bold">What's it about?
                <select name="enquiry_type" className={field} defaultValue={ENQUIRY_TYPES[0]}>{ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="block font-bold">Tell us more<textarea name="message" rows={6} className={field} placeholder="What would you like made or repaired? Rough sizes, timescales, anything helpful." />{errors["message"] && <span className="text-sm text-destructive">{errors["message"]}</span>}</label>
              <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-bold text-primary-foreground disabled:opacity-60">
                {busy && <Loader2 className="h-5 w-5 animate-spin" />} Send enquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

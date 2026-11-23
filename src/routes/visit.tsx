import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Coffee, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { OPENING, SITE } from "@/lib/site";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit & Join | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Opening times, fees and directions to the Godfrey Bevan Workshops, 20 Manhattan Gardens, Hastings TN35 5DQ. Drop in anytime during open hours." },
      { property: "og:title", content: "Visit & Join the Hastings Men's Shed" },
      { property: "og:description", content: "Drop in anytime during open hours. £10 joining fee, £3 a session including tea and coffee." },
    ],
  }),
  component: Visit,
});

function Visit() {
  return (
    <>
      <PageHero eyebrow="Visit & Join" title="Just turn up — the kettle's on">
        No booking, no forms on the doorstep, no pressure. Pop in during any open session, have a cuppa and a look around.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-3xl font-extrabold">Opening times</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
            {OPENING.map((o) => (
              <div key={o.day} className={`flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4 last:border-0 ${o.hours === "Closed" ? "text-muted-foreground" : ""}`}>
                <span className="text-lg font-bold">{o.day}</span>
                <span className="text-right">
                  <span className="text-lg font-semibold">{o.hours}</span>
                  {o.note && <span className="block text-sm text-primary">{o.note}</span>}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-14 text-3xl font-extrabold">What to expect</h2>
          <ul className="mt-5 space-y-4 text-lg">
            {[
              "Someone will say hello and show you round — the workshops, the tea point and the projects on the go.",
              "Have a chat, watch, or have a go. Nobody expects you to know anything.",
              "Safety comes first: members will show you how tools are used before you use them.",
              "Come back as often as you like. When you're ready, join as a member.",
            ].map((t) => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />{t}</li>)}
          </ul>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl bg-accent p-7 text-accent-foreground">
            <Coffee className="h-8 w-8" />
            <h2 className="mt-3 text-2xl font-extrabold">Fees, kept simple</h2>
            <p className="mt-4 text-4xl font-extrabold">£10</p><p className="font-semibold">one-off joining fee</p>
            <p className="mt-4 text-4xl font-extrabold">£3</p><p className="font-semibold">minimum per session, tea & coffee included</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7">
            <h2 className="text-2xl font-extrabold">Who can come?</h2>
            <p className="mt-2">Everyone aged 18 and over. Despite the name, women are just as welcome as men.</p>
          </div>
        </aside>
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h2 className="text-3xl font-extrabold">How to find us</h2>
            <p className="mt-4 flex gap-3 text-lg"><MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" /><span>{SITE.address.map((l) => <span key={l} className="block">{l}</span>)}</span></p>
            <a href={SITE.phoneHref} className="mt-4 flex items-center gap-3 text-lg font-bold text-primary"><Phone className="h-6 w-6" />{SITE.phone}</a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Get directions</a>
            <p className="mt-6 text-muted-foreground">Questions before you come? Give us a ring during opening hours, or <Link to="/commissions" className="font-semibold text-primary underline">send us a message</Link>.</p>
          </div>
          <iframe title="Map to the Godfrey Bevan Workshops" src={SITE.mapEmbed} className="h-80 w-full md:h-full" loading="lazy" />
        </div>
      </section>
    </>
  );
}

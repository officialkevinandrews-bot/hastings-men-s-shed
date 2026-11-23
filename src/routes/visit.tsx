import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Coffee, CheckCircle2, Car, AlertTriangle } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { OPENING, SITE, WORKSHOP_PHOTOS } from "@/lib/site";

export const Route = createFileRoute("/visit")({
  head: () => ({
    meta: [
      { title: "Visit & Join | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Opening times, fees, parking info and directions to the Godfrey Bevan Workshops, 20 Manhattan Gardens, Hastings TN35 5DQ. Drop in anytime during open hours." },
      { property: "og:title", content: "Visit & Join the Hastings & St Leonards Men's Shed" },
      { property: "og:description", content: "Drop in anytime during open hours. £10 joining fee, £3 a session including tea and coffee." },
    ],
  }),
  component: Visit,
});

function Visit() {
  return (
    <>
      <PageHero eyebrow="Visit & Join • Men & Women 18+ Welcome" title="Just turn up — the kettle's on">
        No booking, no forms on the doorstep, no pressure. Pop in during any open session, have a look around our wood and metal workshops, and grab a cuppa and a chat.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-3xl font-extrabold">Weekly session opening times</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
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

          <h2 className="mt-12 text-3xl font-extrabold">What to expect on your first visit</h2>
          <ul className="mt-5 space-y-4 text-lg">
            {[
              "Sign in at our reception area when you arrive — a member or volunteer will welcome you, put the kettle on, and show you around the social area and workshops.",
              "Have a chat, watch projects on the go, or talk about your own hobbies. Nobody expects you to know anything before you start.",
              "When you join, you'll receive a friendly Induction Briefing covering our facilities, fire safety procedures, and workshop equipment.",
              "Safety comes first: before using any machinery or power tools, experienced members will guide and train you at your own pace.",
            ].map((t) => <li key={t} className="flex gap-3"><CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" />{t}</li>)}
          </ul>

          <div className="mt-10 rounded-2xl border-2 border-accent bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2.5 text-xl font-extrabold text-foreground">
              <Car className="h-6 w-6 text-primary" /> Free Parking &amp; Important Car Registration Note
            </div>
            <p className="mt-3 text-muted-foreground">
              We are located right next door to <strong>Ore Community Centre and the Sunflower Community Café</strong>. Free parking is available in the Community Centre Car Park ( invaluable for our less mobile members), and there is also street parking at the east end of Manhattan Gardens near <em>The Old King John</em> public house.
            </p>
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-accent/25 p-3.5 text-sm font-bold text-foreground">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                Please note: If you park in the Community Centre car park, you MUST enter your vehicle registration into the touch-screen tablet inside the main community centre building within 10 minutes of arriving to avoid an automatic parking fine.
              </span>
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-accent p-7 text-accent-foreground shadow-soft">
            <Coffee className="h-8 w-8" />
            <h2 className="mt-3 text-2xl font-extrabold">Fees, kept simple &amp; affordable</h2>
            <p className="mt-4 text-4xl font-extrabold">£10.00</p>
            <p className="font-semibold">one-off joining fee when you become a member</p>
            <p className="mt-4 text-4xl font-extrabold">£3.00</p>
            <p className="font-semibold">minimum contribution per session attended — includes your tea &amp; coffee and helps fund daily workshop utilities</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
            <h2 className="text-2xl font-extrabold">Who can join?</h2>
            <p className="mt-2 text-muted-foreground">
              Everyone aged 18 and over. Despite the traditional "Men's Shed" name, <strong>women are just as welcome as men</strong>, and we have regular women members taking part in sessions.
            </p>
          </div>

          <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <img src={WORKSHOP_PHOTOS.buildingExterior} alt="The entrance to Hastings & St Leonards Men's Shed at 20 Manhattan Gardens" className="aspect-[16/10] w-full object-cover" />
            <figcaption className="p-4 text-sm text-muted-foreground">
              <strong>What to look for:</strong> Our building at 20 Manhattan Gardens features our large yellow and red <em>"MEN'S SHED ENTRANCE"</em> mural and green double doors.
            </figcaption>
          </figure>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h2 className="text-3xl font-extrabold">How to find &amp; contact us</h2>
            <p className="mt-4 flex gap-3 text-lg">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <span>{SITE.address.map((l) => <span key={l} className="block">{l}</span>)}</span>
            </p>
            <a href={SITE.phoneHref} className="mt-4 flex items-center gap-3 text-lg font-bold text-primary hover:underline">
              <Phone className="h-6 w-6" />{SITE.phone}
            </a>
            <a href={SITE.emailHref} className="mt-2.5 flex items-center gap-3 text-lg font-bold text-primary hover:underline">
              <Mail className="h-6 w-6" />{SITE.email}
            </a>
            <a href={SITE.mapsUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
              Get directions on Google Maps
            </a>
            <p className="mt-6 text-muted-foreground">
              Questions before you visit, or enquiring on behalf of a family member or client? Give us a ring during opening hours, email us at <a href={SITE.emailHref} className="font-semibold text-primary underline">{SITE.email}</a>, or <Link to="/commissions" className="font-semibold text-primary underline">send us an online enquiry</Link>.
            </p>
          </div>
          <iframe title="Map to the Godfrey Bevan Workshops" src={SITE.mapEmbed} className="h-80 w-full md:h-full" loading="lazy" />
        </div>
      </section>
    </>
  );
}

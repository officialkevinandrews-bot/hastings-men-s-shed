import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, Hammer, Users, HeartHandshake, ArrowRight, Clock } from "lucide-react";
import { WELCOME_PHOTO, photo } from "@/lib/gallery";
import { ShedVideo } from "@/components/site/ShedVideo";
import { Gallery } from "@/components/site/Gallery";
import { OPENING, SUPPORTERS } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hastings & St Leonards Men's Shed | Craft, company & a cuppa" },
      { name: "description", content: "Drop in to our community wood and metal workshop in Hastings. Open to everyone 18+, men and women welcome. £3 a session including tea and coffee." },
      { property: "og:title", content: "Hastings & St Leonards Men's Shed" },
      { property: "og:description", content: "Community workshop in Hastings tackling loneliness through practical craft. Everyone 18+ welcome." },
    ],
  }),
  component: Index,
});

function Index() {
  const hero = photo("misc-on-table");
  return (
    <>
      <section className="grain relative overflow-hidden bg-wood/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground"><Coffee className="h-4 w-4" /> The kettle's on — drop in any open session</p>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] md:text-7xl">Make things.<br /><span className="text-primary">Make friends.</span></h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground">A friendly community workshop in Hastings where people share skills, work on projects in wood and metal, and look out for each other. Everyone aged 18+ is welcome — men and women.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/visit" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-soft hover:brightness-110">Plan your first visit <ArrowRight className="h-5 w-5" /></Link>
              <a href="#inside" className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-lg font-bold text-primary hover:bg-secondary">Watch the tour</a>
            </div>
          </div>
          <div className="relative">
            <img src={hero.url} alt="A table of wooden items made at the Shed" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-soft" />
            <div className="absolute -bottom-6 -left-4 rounded-2xl bg-accent p-5 text-accent-foreground shadow-soft md:-left-10">
              <p className="text-3xl font-extrabold">£3</p>
              <p className="text-sm font-bold">a session, tea & coffee included</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Hammer, t: "Practical projects", d: "Wood and metal workshops, woodcarving and hobby projects — bring your own or join one of ours." },
            { icon: Users, t: "Skills shared safely", d: "Experienced members are happy to show you the ropes. No experience needed, just curiosity." },
            { icon: HeartHandshake, t: "Less lonely, together", d: "Shoulder to shoulder at a workbench, conversation comes easily. That's how we tackle isolation." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-7">
              <span className="inline-flex rounded-xl bg-secondary p-3 text-primary"><I className="h-7 w-7" /></span>
              <h2 className="mt-4 text-2xl font-bold">{t}</h2>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <img src={WELCOME_PHOTO.url} alt="Hessian sign reading Welcome to the Shed, where great projects start" className="mx-auto max-h-[560px] rounded-3xl shadow-soft" />
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Your first visit</p>
            <h2 className="mt-2 text-4xl font-extrabold">Welcome to the Shed — where great projects start</h2>
            <p className="mt-4 text-lg">There's no need to book and no pressure to make anything. Just turn up during opening hours, say hello, and we'll put the kettle on. Have a look round, chat with members, and see if it's for you.</p>
            <ul className="mt-6 space-y-3 text-lg">
              <li className="flex gap-3"><span className="font-extrabold text-primary">£10</span> one-off joining fee when you decide to become a member</li>
              <li className="flex gap-3"><span className="font-extrabold text-primary">£3</span> minimum contribution per session — includes tea and coffee</li>
            </ul>
            <div className="mt-6 rounded-2xl bg-card p-5">
              <p className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5 text-primary" /> This week at the Shed</p>
              <p className="mt-2 text-muted-foreground">{OPENING.filter((o) => o.hours !== "Closed").map((o) => o.day.slice(0, 3)).join(" · ")} — <Link to="/visit" className="font-bold text-primary underline">see full times</Link></p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <p className="font-bold uppercase tracking-widest text-primary">Our impact</p>
            <h2 className="mt-2 text-4xl font-extrabold">More than a workshop</h2>
          </div>
          <div className="space-y-4 text-lg md:col-span-2">
            <p>Loneliness and social isolation can affect anyone — after retirement, bereavement, a move or a change in health. The Shed gives people a reason to get out of the house, a purpose, and a place where they belong.</p>
            <p>Our members build bird boxes for local gardens, refurbish benches, make commissions for community groups like Hastings Voluntary Action, and created a Sensory Trail for the neighbourhood. Every project puts something back into Hastings & St Leonards.</p>
            <Link to="/about" className="inline-flex items-center gap-2 font-bold text-primary underline">Read about our impact and supporters <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <ShedVideo />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Made in the Shed</p>
            <h2 className="mt-2 text-4xl font-extrabold">Look what we've been making</h2>
          </div>
          <Link to="/made-in-the-shed" className="font-bold text-primary underline">See all projects</Link>
        </div>
        <div className="mt-8"><Gallery limit={8} /></div>
      </section>

      <section className="border-y border-border bg-card py-14">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center font-bold uppercase tracking-widest text-muted-foreground">With thanks to our supporters</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {SUPPORTERS.map((s) => <li key={s} className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold">{s}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground">
            <h2 className="text-3xl font-extrabold">Need something made or mended?</h2>
            <p className="mt-3 text-primary-foreground/85">Custom woodwork, furniture repairs and community commissions — every job helps keep the Shed running.</p>
            <Link to="/commissions" className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 font-bold text-accent-foreground">Send an enquiry</Link>
          </div>
          <div className="rounded-3xl bg-accent p-10 text-accent-foreground">
            <h2 className="text-3xl font-extrabold">Help keep the kettle on</h2>
            <p className="mt-3">A small donation pays for timber, tools and tea — and keeps the door open for the next person who needs it.</p>
            <Link to="/donate" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Donate</Link>
          </div>
        </div>
      </section>
    </>
  );
}

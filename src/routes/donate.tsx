import { createFileRoute } from "@tanstack/react-router";
import { Heart, Hammer, Coffee, Users } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Support the Hastings & St Leonards Men's Shed. Donate securely online to help us tackle loneliness through craft and community." },
      { property: "og:title", content: "Donate to the Hastings Men's Shed" },
      { property: "og:description", content: "Every donation helps keep our workshop doors open." },
    ],
  }),
  component: Donate,
});

function Donate() {
  return (
    <>
      <PageHero eyebrow="Support us" title="Help keep the door open">
        We're a small local charity. Your donation pays for timber, tools, safety kit, rent and the all-important tea — so that anyone feeling alone has somewhere to go.
      </PageHero>
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground shadow-soft md:p-14">
          <Heart className="mx-auto h-12 w-12 text-accent" />
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">Donate securely online</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">Donations are taken securely through SumUp. Choose any amount you like.</p>
          <a href={SITE.donateUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-xl font-extrabold text-accent-foreground hover:brightness-95">
            <Heart className="h-5 w-5" /> Donate now
          </a>
        </div>
        <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
          {[
            { icon: Coffee, t: "Tea and a welcome", d: "Keeping the kettle on for every visitor." },
            { icon: Hammer, t: "Tools and timber", d: "Materials and safe, well-maintained equipment." },
            { icon: Users, t: "Open doors", d: "Rent and running costs so sessions can continue." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6"><I className="h-7 w-7 text-primary" /><h3 className="mt-3 text-xl font-bold">{t}</h3><p className="text-muted-foreground">{d}</p></div>
          ))}
        </div>
        <p className="mt-10 text-muted-foreground">Prefer to give another way? Call us on <a href={SITE.phoneHref} className="font-bold text-primary">{SITE.phone}</a> or drop in during opening hours.</p>
      </section>
    </>
  );
}

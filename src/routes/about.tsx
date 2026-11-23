import { createFileRoute } from "@tanstack/react-router";
import { Award, Mail, Landmark } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SUPPORTERS } from "@/lib/site";
import { photo } from "@/lib/gallery";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Impact | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Our mission, our impact on loneliness in Hastings, letters of support and the funders and partners who make the Shed possible." },
      { property: "og:title", content: "About the Hastings & St Leonards Men's Shed" },
      { property: "og:description", content: "Tackling social isolation through practical craft and community in Hastings & St Leonards." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero eyebrow="Who we are" title="A workshop that's really about people">
        Hastings & St Leonards Men's Shed is a UK registered charity (CIO). We run wood and metal workshops where people work on hobby projects, share skills safely — and, just as importantly, find company.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
        <div className="space-y-4 text-lg">
          <h2 className="text-3xl font-extrabold">Our mission</h2>
          <p>We exist to reduce loneliness and social isolation. Men's Sheds began from a simple idea: people often talk best side by side, working on something with their hands. A shared project gives a reason to show up, a sense of purpose, and friendships that grow naturally.</p>
          <p>Our members come from every walk of life. Some are skilled craftspeople, many have never held a chisel. Everyone has something to teach and something to learn.</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Wood and metal workshops and woodcarving</li>
            <li>Hobby projects and community commissions</li>
            <li>Safe skill-sharing between members</li>
            <li>Open to everyone 18+, men and women</li>
          </ul>
        </div>
        <img src={photo("sensory-trail-1").url} alt="The Sensory Trail made by Shed members" className="rounded-3xl shadow-soft" />
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-extrabold">Recognised across Sussex</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { icon: Mail, who: "Lucinda Fraser", role: "High Sheriff of East Sussex", t: "Wrote a letter of support for the Shed's work bringing people together." },
              { icon: Mail, who: "Sally-Ann Hart", role: "Former MP for Hastings & Rye", t: "Wrote a letter of support recognising the Shed's contribution to the community." },
              { icon: Landmark, who: "Andrew Blackman", role: "Lord-Lieutenant of East Sussex", t: "Visited the workshops to meet members and see their projects." },
            ].map(({ icon: I, who, role, t }) => (
              <figure key={who} className="rounded-2xl bg-card p-7">
                <I className="h-7 w-7 text-primary" />
                <blockquote className="mt-4 text-lg">{t}</blockquote>
                <figcaption className="mt-4"><span className="block font-bold">{who}</span><span className="text-sm text-muted-foreground">{role}</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-center gap-3"><Award className="h-8 w-8 text-primary" /><h2 className="text-3xl font-extrabold">Our supporters & partners</h2></div>
        <p className="mt-3 max-w-2xl text-muted-foreground">The Shed is possible thanks to grants, partnerships and local friends. Thank you.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORTERS.map((s) => (
            <li key={s} className="rounded-2xl border border-border bg-card p-5 text-lg font-bold">
              <span className="mb-3 block h-1.5 w-12 stripe-bar rounded-full" />{s}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

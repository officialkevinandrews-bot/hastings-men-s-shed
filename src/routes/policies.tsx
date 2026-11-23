import { createFileRoute } from "@tanstack/react-router";
import { FileText, ShieldCheck, Scale } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Constitution & Policies | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Our CIO constitution, charitable objects and the policies that keep members safe at the Hastings & St Leonards Men's Shed." },
      { property: "og:title", content: "Constitution & Policies — Hastings Men's Shed" },
      { property: "og:description", content: "Charitable objects, constitution and policies of our charitable incorporated organisation." },
    ],
  }),
  component: Policies,
});

const POLICIES = ["Health & Safety", "Safeguarding", "Equality, Diversity & Inclusion", "Data Protection & Privacy", "Complaints", "Volunteer & Membership"];

function Policies() {
  return (
    <>
      <PageHero eyebrow="Governance" title="Constitution & policies">
        Hastings & St Leonards Men's Shed is a Charitable Incorporated Organisation (CIO) registered with the Charity Commission for England and Wales, run by a board of volunteer trustees.
      </PageHero>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <Scale className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-2xl font-extrabold">Our charitable objects</h2>
          <p className="mt-3">In summary, our purpose is to advance health and wellbeing and relieve social isolation and loneliness — particularly among adults in Hastings, St Leonards and the surrounding area — by providing a safe, welcoming workshop space where people can meet, share and learn practical skills, and take part in projects that benefit the wider community.</p>
          <p className="mt-3 text-sm text-muted-foreground">The full wording of our objects is set out in our constitution.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8">
          <FileText className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-2xl font-extrabold">CIO constitution</h2>
          <p className="mt-3">Our constitution sets out how the charity is governed, the role of trustees and members, and how decisions are made. A copy is available to anyone who asks.</p>
          <a href={SITE.phoneHref} className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">Request a copy: {SITE.phone}</a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-primary" /><h2 className="text-3xl font-extrabold">Our policies</h2></div>
        <p className="mt-3 max-w-2xl text-muted-foreground">These policies keep everyone safe and the Shed well run. Copies can be viewed at the workshop or requested by phone.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POLICIES.map((p) => <li key={p} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 font-bold"><FileText className="h-5 w-5 text-aqua" />{p} Policy</li>)}
        </ul>
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { FileText, ShieldCheck, Scale, Users, HardHat, BookOpen, Mail, Phone, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE, TRUSTEES } from "@/lib/site";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Constitution, Handbook & Policies | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Our CIO constitution (Charity No. 1175075), charitable objects, Member Handbook (Nov 2024) and Health & Safety Policy (Oct 2024)." },
      { property: "og:title", content: "Constitution & Policies — Hastings & St Leonards Men's Shed CIO" },
      { property: "og:description", content: "Charitable objects, CIO constitution, member handbook and safety policies of our registered charity." },
    ],
  }),
  component: Policies,
});

const POLICY_DETAILS = [
  {
    title: "Health & Safety Policy (Updated Oct 2024)",
    summary:
      "Applies whenever the Shed is open with a duty officer present or when members volunteer on community projects. All machinery is maintained and annually PAT-tested, dust extraction is used, high-risk tools are plug-locked for trained users only, and power tools are never operated unless at least two people are present in the Shed.",
  },
  {
    title: "Member Handbook & Induction Briefing (Nov 2024)",
    summary:
      "Every new member receives a structured Induction Briefing covering workshop layout, fire escape doors, signing in and out at Reception, muster point procedures (Ore Community Centre Car Park), first aid & eye-wash stations, and competency sign-off before operating machinery.",
  },
  {
    title: "Code of Conduct & Zero-Tolerance Policy",
    summary:
      "Members conduct themselves courteously and respect one another's space, tools, and abilities. The committee operates a strict zero-tolerance policy toward abuse, anti-social behaviour, smoking/vaping indoors, or the consumption of alcohol or drugs on site.",
  },
  {
    title: "Equality, Diversity & Inclusion Policy",
    summary:
      "Promotes social inclusion for adults aged 18+ across the Borough of Hastings regardless of sex, age, disability, physical or mental health, ethnic origin, religion, sexual orientation, or financial hardship — welcoming both men and women in a supportive environment.",
  },
  {
    title: "Safeguarding & Vulnerable Adults Policy",
    summary:
      "Protects the welfare of all members and visitors, including adults at risk or living with disabilities or health conditions, ensuring activities take place safely within the limits of each individual's ability.",
  },
  {
    title: "Data Protection & Privacy Policy",
    summary:
      "Member records—including emergency next-of-kin details, relevant medical information, and safety competency logs—are stored securely and accessed only by authorised committee officers or the Workshop Manager when required for safety or emergencies.",
  },
] as const;

function Policies() {
  return (
    <>
      <PageHero eyebrow={`Governance • Registered Charity No. ${SITE.charityNumber}`} title="Constitution, handbook & policies">
        {SITE.legalName} is a Charitable Incorporated Organisation (CIO) registered with the Charity Commission for England and Wales (Charity No. {SITE.charityNumber}), governed by an elected board of unpaid volunteer Trustees.
      </PageHero>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <Scale className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-2xl font-extrabold">Official Charitable Objects (Clause 3)</h2>
          <p className="mt-3 text-muted-foreground">
            From our CIO Constitution (last amended 13 September 2020), the objects of <strong>HASTINGS &amp; ST LEONARDS MEN’S SHED CIO</strong> are:
          </p>
          <blockquote className="mt-4 rounded-2xl border-l-4 border-primary bg-background p-5 text-sm leading-relaxed">
            "To promote social inclusion for the public benefit by preventing people aged 18 or over within the Borough of Hastings and the surrounding area from becoming socially excluded, relieving the needs of those people who are socially excluded and assisting them to integrate into society through the provision of facilities in which they can meet to undertake creative, physical or recreational activities, learn or pass on skills and knowledge and support each other socially."
          </blockquote>
          <p className="mt-3 text-xs text-muted-foreground">
            Under Clause 3, 'socially excluded' includes exclusion arising from unemployment, financial hardship, old age, physical or mental ill-health, disability, discrimination, poor skills attainment, or family breakdown.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <Users className="h-8 w-8 text-primary" />
          <h2 className="mt-3 text-2xl font-extrabold">CIO Governance &amp; Trustees</h2>
          <p className="mt-3 text-muted-foreground">
            The income and property of the CIO are applied solely towards the promotion of its charitable objects. Our unpaid Charity Trustees are elected at the Annual General Meeting (AGM):
          </p>
          <ul className="mt-5 space-y-2.5">
            {TRUSTEES.map((t) => (
              <li key={t.name} className="flex items-center justify-between rounded-xl bg-background px-4 py-2.5 text-sm">
                <span className="font-bold">{t.name}</span>
                <span className="font-semibold text-primary">{t.role}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SITE.emailHref} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
              <Mail className="h-4 w-4" /> Request full Constitution by email
            </a>
            <a href={SITE.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold">
              <Phone className="h-4 w-4 text-primary" /> {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-extrabold">Our Policies &amp; Member Handbook</h2>
        </div>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          These policies keep every member and visitor safe and ensure the Shed is well run. Full printed copies are kept on display at the Godfrey Bevan Workshops and can be requested at any time.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {POLICY_DETAILS.map((p) => (
            <div key={p.title} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div>
                <div className="flex items-center gap-2.5 text-primary">
                  <FileText className="h-6 w-6 shrink-0" />
                  <h3 className="text-lg font-extrabold text-foreground">{p.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-border bg-secondary/60 p-8 md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-2.5">
                <HardHat className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-extrabold">Golden Rules of Workshop Safety</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                From our Health &amp; Safety Policy — <em>"Look and check… If in doubt ask… If advice is offered, listen."</em>
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  "Sign in at Reception on arrival and sign out when leaving.",
                  "Never operate power tools when alone in the Shed (minimum of 2 people present).",
                  "Do not use any machine or tool until you have received induction training and demonstrated competence.",
                  "Always use machine guards, dust extraction, and required PPE (eye, ear, and dust protection).",
                  "Report any hazard, incident, or accident immediately to the Duty Officer and record it in the Accident Book.",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-extrabold">Team Projects &amp; Personal Projects</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                From our Member Handbook (November 2024):
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  "Workshop Tasks: Listed on the workshop noticeboard — all members are encouraged to lend a hand.",
                  "Team & Community Projects: Members can sign up to plan materials, tools, and timescales with an appointed Team Leader.",
                  "Personal Projects: Members are welcome to bring personal hobbies and projects, consulting the Workshop Manager on safe storage.",
                  "Management Committee Roles: Chairman, Treasurer, Secretary, Operations/Training Manager, Grants & Fundraising Manager, Health & Safety Manager, and Sales Manager.",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

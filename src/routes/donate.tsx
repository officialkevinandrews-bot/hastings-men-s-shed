import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Hammer, Coffee, Users, ShieldCheck, Wrench, Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Support Our Charity & Donate | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Support the Hastings & St Leonards Men's Shed (Registered Charity No. 1175075). Donate securely online or donate tools and timber to help us tackle loneliness." },
      { property: "og:title", content: "Donate to Hastings & St Leonards Men's Shed (Charity No. 1175075)" },
      { property: "og:description", content: "100% volunteer-run charity. Every donation helps keep our workshop doors open." },
    ],
  }),
  component: Donate,
});

function Donate() {
  const { settings, pageContent } = useSiteContent();

  return (
    <>
      <PageHero eyebrow={`Support Registered UK Charity No. ${SITE.charityNumber}`} title={pageContent["donate.heroTitle"] ?? "Help keep our workshop doors open"}>
        {pageContent["donate.heroIntro"]}
      </PageHero>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl bg-primary p-10 text-center text-primary-foreground shadow-soft md:p-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-4 w-4" /> 100% Volunteer-Run Local Charity · No. {SITE.charityNumber}
          </span>
          <Heart className="mx-auto mt-4 h-12 w-12 text-accent" />
          <h2 className="mt-4 text-3xl font-extrabold md:text-4xl">{pageContent["donate.boxHeading"]}</h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-primary-foreground/85">{pageContent["donate.boxBody"]}</p>
          <a href={settings.donate_url} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-xl font-extrabold text-accent-foreground hover:brightness-95">
            <Heart className="h-5 w-5" /> Donate securely via SumUp
          </a>
        </div>

        <h2 className="mt-16 text-center text-3xl font-extrabold">What your donation makes possible</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              amount: "£10",
              icon: Coffee,
              t: "Tea, biscuits & a warm welcome",
              d: "Stocks the breakroom with tea, coffee, milk and biscuits so every new visitor and member can sit down for a cuppa and a friendly chat.",
            },
            {
              amount: "£25",
              icon: Hammer,
              t: "Timber, fixings & safety kit",
              d: "Provides sandpaper, screws, finishes, dust masks, and ear protection for community wildlife builds and member projects.",
            },
            {
              amount: "£50+",
              icon: Users,
              t: "Keeping the workshops running",
              d: "Helps cover daily electricity, heating, machine maintenance, annual PAT testing, and insurance at The Godfrey Bevan Workshops.",
            },
          ].map(({ amount, icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="inline-flex rounded-xl bg-secondary p-3 text-primary"><I className="h-7 w-7" /></span>
                <span className="rounded-full bg-accent px-3.5 py-1 text-lg font-extrabold text-accent-foreground">{amount}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <Wrench className="h-8 w-8 text-primary" />
            <h3 className="mt-3 text-2xl font-extrabold">Donating tools or timber</h3>
            <p className="mt-2 text-muted-foreground">{pageContent["donate.toolsBody"]}</p>
            <p className="mt-4 text-sm font-semibold">
              Please contact us before dropping off large equipment so we can make sure a duty officer is ready to receive it.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
            <Heart className="h-8 w-8 text-primary" />
            <h3 className="mt-3 text-2xl font-extrabold">Other ways to support us</h3>
            <p className="mt-2 text-muted-foreground">
              You can also support our charity by commissioning a custom build, bringing an item in for repair, purchasing Shed-made items, or volunteering your time and skills.
            </p>
            <div className="mt-5 space-y-2 text-sm font-bold">
              <a href={settings.emailHref} className="flex items-center gap-2 text-primary hover:underline"><Mail className="h-4 w-4" /> {settings.email}</a>
              <a href={settings.phoneHref} className="flex items-center gap-2 text-primary hover:underline"><Phone className="h-4 w-4" /> {settings.phone}</a>
            </div>
            <Link to="/commissions" className="mt-5 inline-flex rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-primary hover:brightness-95">
              Enquire about a commission or repair →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, Hammer, Users, HeartHandshake, ArrowRight, Clock, ShieldCheck, Sparkles, Mail, Phone } from "lucide-react";
import { ShedVideo } from "@/components/site/ShedVideo";
import { Gallery } from "@/components/site/Gallery";
import { SITE } from "@/lib/site";
import { focalPointClass, formatOpeningSummaryLine } from "@/lib/cms-defaults";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hastings & St Leonards Men's Shed | Community Workshop & Registered Charity" },
      { name: "description", content: "A friendly, volunteer-run community wood and metal workshop in Hastings tackling loneliness and social isolation (Registered Charity No. 1175075). Open to men and women 18+." },
      { property: "og:title", content: "Hastings & St Leonards Men's (and Women's) Shed — Charity No. 1175075" },
      { property: "og:description", content: "Community workshop in Hastings tackling loneliness through practical craft, skill-sharing and friendship. Everyone 18+ welcome." },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, openingHours, images, pageContent, galleryItems } = useSiteContent();

  const heroMain = images["home.hero.mainHall"]!;
  const heroBench = images["home.hero.woodworkingBench"]!;
  const heroExt = images["home.hero.buildingExterior"]!;
  const welcomeSign = images["home.welcomeSign"]!;
  const lordLt = images["civic.lordLieutenant"]!;

  const workshopCards = [1, 2, 3, 4, 5, 6].map((n) => images[`home.workshop.${n}`]!);
  const openingSummary = formatOpeningSummaryLine(openingHours);
  const visibleGalleryCount = galleryItems.filter((g) => g.is_visible).length;

  return (
    <>
      <section className="grain relative overflow-hidden bg-wood/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
                <ShieldCheck className="h-4 w-4" /> Registered UK Charity No. {SITE.charityNumber}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-secondary-foreground">
                <Coffee className="h-4 w-4" /> {pageContent["home.heroPill"]}
              </span>
            </div>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.03] md:text-7xl">
              {pageContent["home.heroHeadingLine1"]}
              <br />
              <span className="text-primary">{pageContent["home.heroHeadingLine2"]}</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground">{pageContent["home.heroIntro"]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/visit" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-soft hover:brightness-110">
                Plan your first visit <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-lg font-bold text-primary hover:bg-secondary">
                Our Charitable Mission
              </Link>
              <a href="#inside" className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-base font-bold text-foreground shadow-soft hover:bg-secondary">
                Watch 3-min tour
              </a>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <img
              src={heroMain.image_url}
              alt={heroMain.alt_text}
              className={`aspect-[16/10] w-full rounded-3xl object-cover shadow-soft ${focalPointClass(heroMain.focal_point)}`}
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <img
                src={heroBench.image_url}
                alt={heroBench.alt_text}
                className={`aspect-[16/10] w-full rounded-2xl object-cover shadow-soft ${focalPointClass(heroBench.focal_point)}`}
              />
              <img
                src={heroExt.image_url}
                alt={heroExt.alt_text}
                className={`aspect-[16/10] w-full rounded-2xl object-cover shadow-soft ${focalPointClass(heroExt.focal_point)}`}
              />
            </div>
            <div className="flex items-center gap-3.5 rounded-2xl bg-accent px-5 py-4 text-accent-foreground shadow-soft">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-foreground/10">
                <Coffee className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-tight sm:text-2xl">{settings.session_fee_short}</p>
                <p className="mt-0.5 text-xs font-bold leading-snug sm:text-sm">{settings.session_fee_note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-bold uppercase tracking-widest text-primary">Our Charitable Purpose</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">{pageContent["home.missionHeading"]}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{pageContent["home.missionIntro"]}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: HeartHandshake,
              t: "Tackling loneliness & isolation",
              d: "Retirement, bereavement, illness or life changes can leave anyone feeling isolated. Shoulder to shoulder at a workbench—or over a mug of tea—conversation and friendship come naturally.",
            },
            {
              icon: Users,
              t: "Inclusive & welcoming to all (18+)",
              d: "Despite the traditional 'Men's Shed' name, we proudly welcome both men and women, complete beginners and retired tradespeople, in a safe, supportive space within the limits of each person's ability.",
            },
            {
              icon: Hammer,
              t: "Confidence through community craft",
              d: "Operating shared wood and metal workshops where members learn new skills, work on personal hobbies, or volunteer on community projects and repairs that build self-worth and civic pride.",
            },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <span className="inline-flex rounded-xl bg-secondary p-3 text-primary"><I className="h-7 w-7" /></span>
              <h3 className="mt-4 text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-bold uppercase tracking-widest text-primary">The Godfrey Bevan Workshops</p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">{pageContent["home.workshopsHeading"]}</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{pageContent["home.workshopsIntro"]}</p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 font-bold text-primary underline">
              Explore our full story &amp; impact <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workshopCards.map((card) => (
              <figure key={card.slot_key} className="overflow-hidden rounded-2xl border border-border bg-background shadow-soft">
                <img
                  src={card.image_url}
                  alt={card.alt_text}
                  className={`aspect-[16/10] w-full object-cover ${focalPointClass(card.focal_point)}`}
                  loading="lazy"
                />
                <figcaption className="p-5">
                  <h3 className="text-xl font-bold">{card.alt_text}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{card.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <img
            src={welcomeSign.image_url}
            alt={welcomeSign.alt_text}
            className="mx-auto max-h-[560px] rounded-3xl shadow-soft"
          />
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Your first visit</p>
            <h2 className="mt-2 text-4xl font-extrabold">{pageContent["home.firstVisitHeading"]}</h2>
            <p className="mt-4 text-lg">{pageContent["home.firstVisitBody"]}</p>
            <ul className="mt-6 space-y-3 text-lg">
              <li className="flex gap-3">
                <span className="font-extrabold text-primary">{settings.joining_fee}</span> one-off joining fee when you
                decide to become a member
              </li>
              <li className="flex gap-3">
                <span className="font-extrabold text-primary">{settings.session_fee}</span> minimum contribution per
                session — includes tea, coffee &amp; biscuits and helps cover daily workshop utilities
              </li>
            </ul>
            <div className="mt-6 rounded-2xl bg-card p-5 shadow-soft">
              <p className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5 text-primary" /> Weekly Sessions at the Shed</p>
              <p className="mt-2 text-muted-foreground">
                {openingSummary} —{" "}
                <Link to="/visit" className="font-bold text-primary underline">see full visitor &amp; parking guide</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-primary">
              <Sparkles className="h-4 w-4" /> Recognized across East Sussex
            </p>
            <h2 className="mt-2 text-4xl font-extrabold">{pageContent["home.civicHeading"]}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{pageContent["home.civicBody1"]}</p>
            <p className="mt-4 text-lg text-muted-foreground">{pageContent["home.civicBody2"]}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
                Read our full impact &amp; letters of support <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:col-span-2">
              <img
                src={lordLt.image_url}
                alt={lordLt.alt_text}
                className={`aspect-[16/9] w-full object-cover ${focalPointClass(lordLt.focal_point)}`}
                loading="lazy"
              />
              <figcaption className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                {lordLt.caption}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <ShedVideo />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Made in the Shed</p>
            <h2 className="mt-2 text-4xl font-extrabold">{pageContent["home.galleryHeading"]}</h2>
            <p className="mt-2 text-muted-foreground">{pageContent["home.gallerySubtitle"]}</p>
          </div>
          <Link to="/made-in-the-shed" className="font-bold text-primary underline">
            See all {visibleGalleryCount}+ projects
          </Link>
        </div>
        <div className="mt-8"><Gallery limit={8} /></div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground">
            <h2 className="text-3xl font-extrabold">{pageContent["home.commissionsCtaHeading"]}</h2>
            <p className="mt-3 text-primary-foreground/85">{pageContent["home.commissionsCtaBody"]}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/commissions" className="inline-flex rounded-full bg-accent px-6 py-3 font-bold text-accent-foreground">Send an enquiry</Link>
              <a href={settings.emailHref} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-foreground underline">
                <Mail className="h-4 w-4" /> {settings.email}
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-accent p-10 text-accent-foreground">
            <h2 className="text-3xl font-extrabold">{pageContent["home.donateCtaHeading"]}</h2>
            <p className="mt-3">{pageContent["home.donateCtaBody"]}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link to="/donate" className="inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Donate or give tools</Link>
              <a href={settings.phoneHref} className="inline-flex items-center gap-1.5 text-sm font-bold underline">
                <Phone className="h-4 w-4" /> {settings.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

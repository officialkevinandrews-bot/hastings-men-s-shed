import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Mail,
  Landmark,
  HeartHandshake,
  Users,
  Recycle,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Quote,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE } from "@/lib/site";
import { focalPointClass } from "@/lib/cms-defaults";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Our Charitable Impact | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Discover the charitable mission of Hastings & St Leonards Men's Shed (Registered Charity No. 1175075): tackling loneliness, improving mental wellbeing, and serving our community." },
      { property: "og:title", content: "About & Impact — Hastings & St Leonards Men's Shed (Charity No. 1175075)" },
      { property: "og:description", content: "Tackling social isolation and improving mental and physical health through practical craft and camaraderie in Hastings & St Leonards." },
    ],
  }),
  component: About,
});

function About() {
  const { settings, images, pageContent, trustees, supporters, friends } = useSiteContent();

  const aboutHall = images["about.mainHall"]!;
  const sawSign = images["about.sawSign"]!;
  const lunarProbe = images["about.lunarProbe"]!;
  const toolsImg = images["about.toolsAndClamps"]!;
  const metalImg = images["about.metalWorkshop"]!;
  const sensoryImg = images["about.sensoryTrail"]!;
  const highSheriff = images["civic.highSheriff"]!;
  const highSheriffLetter = images["civic.highSheriffLetter"]!;
  const lordLt = images["civic.lordLieutenant"]!;
  const mpPhoto = images["civic.mpSallyAnn"]!;
  const mpLetter = images["civic.mpSallyAnnLetter"]!;

  const aboutSupporters = supporters.filter((s) => s.show_on_about);

  return (
    <>
      <PageHero eyebrow={`Registered UK Charity No. ${SITE.charityNumber} (CIO)`} title={pageContent["about.heroTitle"] ?? "A workshop that's really about people"}>
        {pageContent["about.heroIntro"]}
      </PageHero>

      {/* OFFICIAL MISSION STATEMENT & THE STORY OF THE SHED */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-start gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-lg">
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-extrabold text-primary">
              <ShieldCheck className="h-4 w-4" /> Our Official Charitable Mission
            </p>
            <h2 className="text-3xl font-extrabold md:text-4xl">What Hastings &amp; St Leonards Men's Shed is all about</h2>
            <blockquote className="rounded-2xl border-l-4 border-primary bg-card p-6 text-foreground shadow-soft">
              <p className="font-semibold leading-relaxed">{pageContent["about.missionQuote"]}</p>
            </blockquote>

            <h3 className="pt-2 text-2xl font-extrabold">From a global movement to a local lifeline in Hastings</h3>
            <p>{pageContent["about.storyParagraph1"]}</p>
            <p>{pageContent["about.storyParagraph2"]}</p>
            <p>{pageContent["about.storyParagraph3"]}</p>
          </div>

          <div className="space-y-6">
            <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img
                src={aboutHall.image_url}
                alt={aboutHall.alt_text}
                className={`w-full object-cover ${focalPointClass(aboutHall.focal_point)}`}
              />
              <figcaption className="p-5 text-sm text-muted-foreground">{aboutHall.caption}</figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-4">
              <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img
                  src={sawSign.image_url}
                  alt={sawSign.alt_text}
                  className={`aspect-[4/3] w-full object-cover ${focalPointClass(sawSign.focal_point)}`}
                />
                <figcaption className="p-3 text-xs font-semibold text-muted-foreground">{sawSign.caption}</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img
                  src={lunarProbe.image_url}
                  alt={lunarProbe.alt_text}
                  className={`aspect-[4/3] w-full object-cover ${focalPointClass(lunarProbe.focal_point)}`}
                />
                <figcaption className="p-3 text-xs font-semibold text-muted-foreground">{lunarProbe.caption}</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR PILLARS OF OUR CHARITABLE IMPACT */}
      <section className="border-y border-border bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-3xl">
            <p className="font-bold uppercase tracking-widest text-primary">How we make a difference</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Four pillars of our charitable work</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Under our Charitable Incorporated Organisation (CIO) constitution, every session, project, and cup of tea serves our public-benefit objects:
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                icon: HeartHandshake,
                title: "1. Relieving Loneliness & Social Exclusion",
                text: "Life transitions—such as retirement, losing a partner, redundancy, moving to a new town, financial hardship, or physical/mental ill-health—can sever daily social ties. The Shed gives members a regular place to go, a warm welcome, and a supportive peer group that looks out for one another.",
              },
              {
                icon: Stethoscope,
                title: "2. Advancing Physical & Mental Wellbeing",
                text: "Our philosophy is to bring tangible health benefits by encouraging gentle physical and mental activity. Designing a project, turning a bowl on the lathe, or carving timber keeps hands and minds active, restores self-worth, and provides an enjoyable way to stay socially integrated.",
              },
              {
                icon: Users,
                title: "3. Safe Skill-Sharing & Inclusive Participation",
                text: "We operate and maintain both wood and metal workshops with shared machinery and tools. Retired tradespeople and lifelong makers pass on their accumulated expertise to beginners safely, within the limits of each member's ability—with full safety inductions and supervision.",
              },
              {
                icon: Recycle,
                title: "4. Community Service & Circular Sustainability",
                text: "We turn donated and recycled timber into items that benefit local charities, schools, parks, and wildlife—from the neighbourhood Sensory Trail and pigeonholes for Hastings Voluntary Action to park bench restorations, planters for Ore in Bloom, and owl/hedgehog boxes.",
              },
            ].map(({ icon: I, title, text }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <span className="inline-flex rounded-xl bg-secondary p-3 text-primary"><I className="h-7 w-7" /></span>
                <h3 className="mt-4 text-2xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDE OUR WORKSHOPS & COMMUNITY PROJECTS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <img
              src={toolsImg.image_url}
              alt={toolsImg.alt_text}
              className={`aspect-square w-full rounded-2xl object-cover shadow-soft ${focalPointClass(toolsImg.focal_point)}`}
            />
            <img
              src={metalImg.image_url}
              alt={metalImg.alt_text}
              className={`aspect-square w-full rounded-2xl object-cover shadow-soft ${focalPointClass(metalImg.focal_point)}`}
            />
            <img
              src={sensoryImg.image_url}
              alt={sensoryImg.alt_text}
              className={`col-span-2 aspect-[16/9] w-full rounded-2xl object-cover shadow-soft ${focalPointClass(sensoryImg.focal_point)}`}
            />
          </div>
          <div className="space-y-4 text-lg">
            <p className="font-bold uppercase tracking-widest text-primary">Facilities &amp; Referrals</p>
            <h2 className="text-3xl font-extrabold">Who we support — and how to refer someone</h2>
            <p>{pageContent["about.referralsBody"]}</p>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-xl font-bold text-primary">Social Prescribers, Support Workers &amp; Families</h3>
              <p className="mt-2 text-base text-muted-foreground">{pageContent["about.socialPrescribingBody"]}</p>
              <p className="mt-3 text-base text-muted-foreground">
                Call us on{" "}
                <a href={settings.phoneHref} className="font-bold text-primary underline">
                  {settings.phone}
                </a>{" "}
                or email{" "}
                <a href={settings.emailHref} className="font-bold text-primary underline">
                  {settings.email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIVIC RECOGNITION & ACTUAL LETTERS OF SUPPORT */}
      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-bold uppercase tracking-widest text-primary">Testimonials &amp; Civic Endorsements</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Recognised across East Sussex</h2>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            Our charity's work in the local community has been visited and commended by civic leaders across East Sussex:
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {/* High Sheriff */}
            <figure className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div>
                <img
                  src={highSheriff.image_url}
                  alt={highSheriff.alt_text}
                  className={`h-56 w-full object-cover ${focalPointClass(highSheriff.focal_point)}`}
                />
                <div className="p-7">
                  <Quote className="h-8 w-8 text-primary" />
                  <blockquote className="mt-3 text-base italic leading-relaxed">
                    "The work that you do in a deprived area of the Hastings community is truly inspirational. The range of activities, the craftsmanship and the support that you are giving is clearly a lifeline to many of your members."
                  </blockquote>
                </div>
              </div>
              <figcaption className="border-t border-border bg-muted/40 px-7 py-4">
                <span className="block font-extrabold">Lucinda Fraser DL</span>
                <span className="text-sm text-muted-foreground">High Sheriff of East Sussex (April 2024 Visit)</span>
                <a href={highSheriffLetter.image_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline">
                  <Mail className="h-3.5 w-3.5" /> View handwritten letter of support
                </a>
              </figcaption>
            </figure>

            {/* Lord Lieutenant */}
            <figure className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div>
                <img
                  src={lordLt.image_url}
                  alt={lordLt.alt_text}
                  className={`h-56 w-full object-cover ${focalPointClass(lordLt.focal_point)}`}
                />
                <div className="p-7">
                  <Landmark className="h-8 w-8 text-primary" />
                  <blockquote className="mt-3 text-base leading-relaxed">
                    Visited the Godfrey Bevan Workshops in April 2024 to tour the wood and metal shops, meet our volunteer Trustees and members, and see first-hand how the Shed brings local residents together through practical craft.
                  </blockquote>
                </div>
              </div>
              <figcaption className="border-t border-border bg-muted/40 px-7 py-4">
                <span className="block font-extrabold">Andrew Blackman</span>
                <span className="text-sm text-muted-foreground">HM Lord-Lieutenant of East Sussex (April 2024 Visit)</span>
              </figcaption>
            </figure>

            {/* Local MP */}
            <figure className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div>
                <img
                  src={mpPhoto.image_url}
                  alt={mpPhoto.alt_text}
                  className={`h-56 w-full object-cover ${focalPointClass(mpPhoto.focal_point)}`}
                />
                <div className="p-7">
                  <Quote className="h-8 w-8 text-primary" />
                  <blockquote className="mt-3 text-base italic leading-relaxed">
                    "The Shed is located in one of the most deprived areas of the town. The charity provides a wonderful opportunity for people to socialise as well as being creative and doing something for the benefit of the community. This mitigates the effects of social isolation and improves mental and physical health."
                  </blockquote>
                </div>
              </div>
              <figcaption className="border-t border-border bg-muted/40 px-7 py-4">
                <span className="block font-extrabold">Sally-Ann Hart</span>
                <span className="text-sm text-muted-foreground">Former MP for Hastings &amp; Rye</span>
                <a href={mpLetter.image_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline">
                  <Mail className="h-3.5 w-3.5" /> View signed letter extract
                </a>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* FRIENDS OF THE SHED & COLLABORATIONS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-3xl">
          <p className="font-bold uppercase tracking-widest text-primary">Collaborating across Hastings</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">'Friends' of the Shed</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            One of our core charitable aims is collaborating with other like-minded local charities and community organisations—sharing ideas, tools, and practical support in our joint missions:
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {friends.map((f) => (
            <div key={f.id || f.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="mb-3 block h-1.5 w-12 stripe-bar rounded-full" />
              <h3 className="text-xl font-bold">{f.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GRANT PROVIDERS & TRUSTEES */}
      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-extrabold md:text-4xl">Our grant providers &amp; supporters</h2>
          </div>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
            We are incredibly grateful to all our grant providers and supporters who have funded and backed our charitable work in Hastings &amp; St Leonards:
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {aboutSupporters.map((s) => (
              <div key={s.id || s.name} className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-soft">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2">
                      <img src={s.logo_url} alt={s.name} className="max-h-12 w-auto max-w-full object-contain" loading="lazy" />
                    </div>
                    <h3 className="text-xl font-extrabold">{s.name}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-background p-8 shadow-soft">
            <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="font-bold uppercase tracking-widest text-primary">100% Volunteer-Led Governance</p>
                <h3 className="mt-2 text-2xl font-extrabold">Our Charity Trustees</h3>
                <p className="mt-3 text-muted-foreground">
                  {SITE.legalName} (Registered Charity No. {SITE.charityNumber}) is run purely by volunteers. The management, objectives, and operation of the Shed are overseen by unpaid Trustees elected annually and supported by co-opted volunteers.
                </p>
                <div className="mt-5">
                  <Link to="/policies" className="inline-flex items-center gap-1.5 font-bold text-primary underline">
                    Read our CIO Constitution &amp; Policies <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <ul className="space-y-3 rounded-2xl border border-border bg-card p-6">
                {trustees.map((t) => (
                  <li key={t.id || t.name} className="flex items-center justify-between border-b border-border pb-2.5 last:border-0 last:pb-0">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-sm font-semibold text-primary">{t.role}</span>
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

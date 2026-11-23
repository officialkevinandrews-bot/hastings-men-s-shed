import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Mail,
  Landmark,
  HeartHandshake,
  Users,
  Hammer,
  Recycle,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  Quote,
} from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SITE, GRANT_SUPPORTERS, FRIENDS_OF_SHED, TRUSTEES, WORKSHOP_PHOTOS } from "@/lib/site";
import { photo } from "@/lib/gallery";

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
  return (
    <>
      <PageHero eyebrow={`Registered UK Charity No. ${SITE.charityNumber} (CIO)`} title="A workshop that's really about people">
        The Hastings &amp; St Leonards Men's (and Women's) Shed is a volunteer-run UK charity dedicated to relieving loneliness, preventing social exclusion, and improving mental and physical wellbeing across Hastings, St Leonards, and the surrounding area.
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
              <p className="font-semibold leading-relaxed">
                "The Hastings &amp; St Leonards Men’s Shed aims to provide an environment where anyone at risk of social isolation can meet to socialise and pursue a hobby or project for their own benefit, or that of the Shed’s, or for the wider community. Through volunteering, skill-sharing and community service, we aim to increase confidence and self-worth at the same time as mitigating the effects of isolation, loneliness and exclusion."
              </p>
            </blockquote>

            <h3 className="pt-2 text-2xl font-extrabold">From a global movement to a local lifeline in Hastings</h3>
            <p>
              The Men’s Shed concept began in Australia around 1999 from a simple observation: people—and particularly older or retired men—often find it much easier to talk and form friendships <strong>shoulder to shoulder</strong> while making or mending something together than sitting face to face. The movement spread across the UK, Ireland, New Zealand, Canada, and Europe, with hundreds of Sheds now transforming lives nationwide.
            </p>
            <p>
              We started our Shed in <strong>2016</strong> after identifying an urgent need right here in Hastings &amp; St Leonards. Located in one of the town's most deprived wards at <strong>The Godfrey Bevan Workshops (20 Manhattan Gardens)</strong>, our charity is run purely by unpaid volunteer Trustees and members.
            </p>
            <p>
              You might assume from the traditional name that Men’s Sheds are only for men—<strong>however, we proudly welcome women too</strong>, and have regular women members who are an integral part of our workshop community. Whether you want to work on a complex woodworking or metalworking project, try woodcarving on a Monday morning, make items from our stock of recycled timber, or simply sit and chat with like-minded friends over a cup of tea and a biscuit, there is a place for you here.
            </p>
          </div>

          <div className="space-y-6">
            <figure className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img
                src={WORKSHOP_PHOTOS.mainHall}
                alt="Inside the main woodworking hall at the Godfrey Bevan Workshops"
                className="w-full object-cover"
              />
              <figcaption className="p-5 text-sm text-muted-foreground">
                <strong>The Godfrey Bevan Workshops:</strong> Members chatting and working side by side in our main hall in Ore, Hastings.
              </figcaption>
            </figure>

            <div className="grid grid-cols-2 gap-4">
              <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img src={WORKSHOP_PHOTOS.manshedSawSign} alt="Hand-painted vintage MANSHED handsaw sign" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-3 text-xs font-semibold text-muted-foreground">Our hand-painted vintage saw sign inside the Shed</figcaption>
              </figure>
              <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img src={WORKSHOP_PHOTOS.lunarProbeCartoon} alt="Hastings Lunar Probe cartoon from the Shed" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="p-3 text-xs font-semibold text-muted-foreground">"Most importantly, we're having fun whilst doing it!"</figcaption>
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
            <img src={WORKSHOP_PHOTOS.toolsAndClamps} alt="Member working with power tools and clamps in the woodshop" className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
            <img src={WORKSHOP_PHOTOS.metalWorkshop} alt="The Shed's metalworking room and engineering lathe" className="aspect-square w-full rounded-2xl object-cover shadow-soft" />
            <img src={photo("sensory-trail-1").url} alt="The Sensory Trail created by Shed members" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover shadow-soft" />
          </div>
          <div className="space-y-4 text-lg">
            <p className="font-bold uppercase tracking-widest text-primary">Facilities &amp; Referrals</p>
            <h2 className="text-3xl font-extrabold">Who we support — and how to refer someone</h2>
            <p>
              Our constitution defines social exclusion broadly: whether someone is experiencing loneliness in older age, living with a physical or learning disability, recovering from illness or bereavement, facing unemployment or financial hardship, or simply missing the camaraderie of a workplace, the Shed is here for them.
            </p>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-xl font-bold text-primary">Social Prescribers, Support Workers &amp; Families</h3>
              <p className="mt-2 text-base text-muted-foreground">
                We regularly welcome enquiries from <strong>GP social prescribing link workers, local health &amp; wellbeing teams, charities, and family members</strong> supporting a relative or friend who could benefit from company and purposeful activity.
              </p>
              <p className="mt-3 text-base text-muted-foreground">
                You are very welcome to accompany someone on their first visit so they can look around the workshops and have a cup of tea at their own pace. Call us on <a href={SITE.phoneHref} className="font-bold text-primary underline">{SITE.phone}</a> or email <a href={SITE.emailHref} className="font-bold text-primary underline">{SITE.email}</a>.
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
            <figure className="flex flex-col justify-between rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
              <div>
                <img src={WORKSHOP_PHOTOS.visitHighSheriff} alt="Lucinda Fraser DL, High Sheriff of East Sussex" className="h-56 w-full object-cover object-top" />
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
                <a href={WORKSHOP_PHOTOS.letterHighSheriff} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline">
                  <Mail className="h-3.5 w-3.5" /> View handwritten letter of support
                </a>
              </figcaption>
            </figure>

            {/* Lord Lieutenant */}
            <figure className="flex flex-col justify-between rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
              <div>
                <img src={WORKSHOP_PHOTOS.visitLordLieutenant} alt="Andrew Blackman, HM Lord-Lieutenant of East Sussex, visiting the Shed" className="h-56 w-full object-cover" />
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
            <figure className="flex flex-col justify-between rounded-3xl border border-border bg-card overflow-hidden shadow-soft">
              <div>
                <img src={WORKSHOP_PHOTOS.visitMpSallyAnn} alt="Sally-Ann Hart visiting Shed members in the workshop" className="h-56 w-full object-cover" />
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
                <a href={WORKSHOP_PHOTOS.letterMpSallyAnn} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary underline">
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
          {FRIENDS_OF_SHED.map((f) => (
            <div key={f.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="mb-3 block h-1.5 w-12 stripe-bar rounded-full" />
              <h3 className="text-xl font-bold">{f.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
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
            {GRANT_SUPPORTERS.map((s) => (
              <div key={s.name} className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-soft">
                <div>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2">
                      <img src={s.logo} alt={s.name} className="max-h-12 w-auto max-w-full object-contain" loading="lazy" />
                    </div>
                    <h3 className="text-xl font-extrabold">{s.name}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
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
                {TRUSTEES.map((t) => (
                  <li key={t.name} className="flex items-center justify-between border-b border-border pb-2.5 last:border-0 last:pb-0">
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

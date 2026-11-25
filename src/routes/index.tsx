import { createFileRoute, Link } from "@tanstack/react-router";
import { Coffee, Hammer, Users, HeartHandshake, ArrowRight, Clock, ShieldCheck, Sparkles, Mail, Phone } from "lucide-react";
import { WELCOME_PHOTO } from "@/lib/gallery";
import { ShedVideo } from "@/components/site/ShedVideo";
import { Gallery } from "@/components/site/Gallery";
import { OPENING, SITE, WORKSHOP_PHOTOS } from "@/lib/site";

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
                <Coffee className="h-4 w-4" /> The kettle's on — drop in any open session
              </span>
            </div>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.03] md:text-7xl">
              Make things.<br />
              <span className="text-primary">Make friends.</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl text-muted-foreground">
              Welcome to the <strong>Hastings &amp; St Leonards Men's (and Women's) Shed</strong> — a volunteer-run community charity where anyone at risk of loneliness or social isolation can socialise, share skills in our wood and metal workshops, and regain confidence and purpose. Everyone aged 18+ is welcome.
            </p>
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
              src={WORKSHOP_PHOTOS.mainHall}
              alt="Members chatting inside the Godfrey Bevan Workshops at Hastings & St Leonards Men's Shed"
              className="aspect-[16/10] w-full rounded-3xl object-cover shadow-soft"
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <img
                src={WORKSHOP_PHOTOS.woodworkingBench}
                alt="Member restoring a wooden chair at the workshop bench"
                className="aspect-[16/10] w-full rounded-2xl object-cover object-[78%_center] shadow-soft"
              />
              <img
                src={WORKSHOP_PHOTOS.buildingExterior}
                alt="Exterior of the Hastings Men's Shed showing the yellow and red entrance mural"
                className="aspect-[16/10] w-full rounded-2xl object-cover object-[58%_center] shadow-soft"
              />
            </div>
            <div className="flex items-center gap-3.5 rounded-2xl bg-accent px-5 py-4 text-accent-foreground shadow-soft">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-foreground/10">
                <Coffee className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-tight sm:text-2xl">£3 a session</p>
                <p className="mt-0.5 text-xs font-bold leading-snug sm:text-sm">
                  Tea, coffee &amp; biscuits included · £10 one-off joining fee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-bold uppercase tracking-widest text-primary">Our Charitable Purpose</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Why our charity exists</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Founded in 2016 after identifying a vital need in our local community, our charity aims to prevent social exclusion and improve mental and physical wellbeing across Hastings &amp; St Leonards.
          </p>
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
              <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">Step inside our actual workshops</h2>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                Located at 20 Manhattan Gardens in Ore, Hastings (right next door to Ore Community Centre and the Sunflower Café), our characterful building houses fully equipped woodworking, woodcarving, and metalworking spaces.
              </p>
            </div>
            <Link to="/about" className="inline-flex items-center gap-2 font-bold text-primary underline">
              Explore our full story &amp; impact <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                img: WORKSHOP_PHOTOS.mainHall,
                title: "The Main Workshop Hall",
                desc: "Our spacious main woodworking hall — housed in a historic former theatre space — with plenty of benches, natural light and room to collaborate.",
              },
              {
                img: WORKSHOP_PHOTOS.entranceView,
                title: "Safe, Shared Machinery",
                desc: "Equipped with bandsaws, table saws, pillar drills, sanders, and overhead air filtration. Every member receives a full safety induction before using tools.",
              },
              {
                img: WORKSHOP_PHOTOS.metalWorkshop,
                title: "Dedicated Metalwork Room",
                desc: "Alongside timber craft, we maintain a dedicated metalworking workshop equipped with an engineering lathe, grinders, and hand tools.",
              },
              {
                img: WORKSHOP_PHOTOS.woodworkingBench,
                title: "Make, Mend & Restore",
                desc: "Members bring in personal projects, restore furniture, or build items from our stock of recycled timber for the community and charity sales.",
              },
              {
                img: WORKSHOP_PHOTOS.teamAtWork,
                title: "Working Side by Side",
                desc: "Experienced craftspeople and first-time makers working together at the benches — sharing knowledge, laughs, and peer support.",
              },
              {
                img: WORKSHOP_PHOTOS.buildingExterior,
                title: "Easy to Find in Manhattan Gardens",
                desc: "Look for our hand-painted 'MEN'S SHED ENTRANCE' sign! On sunny days we also display handcrafted items for sale outside our green doors.",
              },
            ].map((card) => (
              <figure key={card.title} className="overflow-hidden rounded-2xl border border-border bg-background shadow-soft">
                <img src={card.img} alt={card.title} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                <figcaption className="p-5">
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{card.desc}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
          <img src={WELCOME_PHOTO.url} alt="Hessian sign reading Welcome to the Shed, where great projects start" className="mx-auto max-h-[560px] rounded-3xl shadow-soft" />
          <div>
            <p className="font-bold uppercase tracking-widest text-primary">Your first visit</p>
            <h2 className="mt-2 text-4xl font-extrabold">Welcome to the Shed — where great projects start</h2>
            <p className="mt-4 text-lg">
              There's no need to book and no pressure to pick up a tool on day one. Just turn up during opening hours, say hello, and we'll put the kettle on. Have a look round, chat with members, and see if it feels right for you.
            </p>
            <ul className="mt-6 space-y-3 text-lg">
              <li className="flex gap-3"><span className="font-extrabold text-primary">£10</span> one-off joining fee when you decide to become a member</li>
              <li className="flex gap-3"><span className="font-extrabold text-primary">£3</span> minimum contribution per session — includes tea, coffee &amp; biscuits and helps cover daily workshop utilities</li>
            </ul>
            <div className="mt-6 rounded-2xl bg-card p-5 shadow-soft">
              <p className="flex items-center gap-2 font-bold"><Clock className="h-5 w-5 text-primary" /> Weekly Sessions at the Shed</p>
              <p className="mt-2 text-muted-foreground">
                Mon 10am–1pm (Woodcarving) · Tue, Wed &amp; Fri 10am–4pm (General) · 2nd &amp; 4th Sat 10am–1pm —{" "}
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
            <h2 className="mt-2 text-4xl font-extrabold">"Clearly a lifeline to many of your members"</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Situated in one of the most deprived wards of Hastings, our volunteer-run charity provides a vital space for social connection, physical and mental activity, and community service.
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              Our members build wildlife habitats, refurbish benches, craft bespoke cabinetry for local charities like <strong>Hastings Voluntary Action</strong>, built a neighbourhood <strong>Sensory Trail</strong>, and partner with <strong>Ore in Bloom</strong>, <strong>Alexandra Park Greenhouse</strong>, and <strong>Tools With A Mission</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
                Read our full impact &amp; letters of support <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft sm:col-span-2">
              <img src={WORKSHOP_PHOTOS.visitLordLieutenant} alt="Shed members with Andrew Blackman, HM Lord-Lieutenant of East Sussex" className="aspect-[16/9] w-full object-cover" loading="lazy" />
              <figcaption className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                Shed members and Trustees welcoming Andrew Blackman, HM Lord-Lieutenant of East Sussex, to the Godfrey Bevan Workshops.
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
            <h2 className="mt-2 text-4xl font-extrabold">Look what our members have been making</h2>
            <p className="mt-2 text-muted-foreground">We undertake custom commissions and repair work, and sell handcrafted items to help fund the charity.</p>
          </div>
          <Link to="/made-in-the-shed" className="font-bold text-primary underline">See all 31+ projects</Link>
        </div>
        <div className="mt-8"><Gallery limit={8} /></div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-10 text-primary-foreground">
            <h2 className="text-3xl font-extrabold">Commissions, repairs &amp; item sales</h2>
            <p className="mt-3 text-primary-foreground/85">
              We undertake custom woodwork, furniture repairs, bench restorations, and community commissions, as well as selling handcrafted items. Every job directly supports our charity.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/commissions" className="inline-flex rounded-full bg-accent px-6 py-3 font-bold text-accent-foreground">Send an enquiry</Link>
              <a href={SITE.emailHref} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-foreground underline">
                <Mail className="h-4 w-4" /> {SITE.email}
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-accent p-10 text-accent-foreground">
            <h2 className="text-3xl font-extrabold">Help keep our charity's doors open</h2>
            <p className="mt-3">
              We are run purely by unpaid volunteer Trustees and members. Every donation pays for timber, tools, safety equipment, utilities, and tea — keeping the Shed open for anyone facing isolation.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link to="/donate" className="inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">Donate or give tools</Link>
              <a href={SITE.phoneHref} className="inline-flex items-center gap-1.5 text-sm font-bold underline">
                <Phone className="h-4 w-4" /> {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

import logoAsset from "@/assets/logo.jpg.asset.json";
import { CATEGORIES, PHOTOS, WELCOME_PHOTO, photo as staticPhoto } from "@/lib/gallery";
import {
  FRIENDS_OF_SHED,
  GRANT_SUPPORTERS,
  OPENING,
  SITE,
  SUPPORTER_LOGOS,
  TRUSTEES,
  WORKSHOP_PHOTOS,
} from "@/lib/site";

export type FocalPoint = "center" | "top" | "bottom" | "left" | "right";
export type AnnouncementVariant = "info" | "event" | "closure";
export type EnquiryStatus = "new" | "in_progress" | "replied" | "archived";

export interface SiteSettingsData {
  id: string;
  joining_fee: string;
  session_fee: string;
  session_fee_short: string;
  session_fee_note: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  sales_email: string;
  salesEmailHref: string;
  facebook_url: string;
  donate_url: string;
  address_lines: string[];
}

export interface OpeningHourRow {
  id?: string;
  day_order: number;
  day_name: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  hours_display: string;
  note: string;
}

export interface AnnouncementData {
  id: string;
  enabled: boolean;
  variant: AnnouncementVariant;
  message: string;
  link_label: string;
  link_url: string;
  expires_at: string | null;
}

export interface SiteImageSlotDef {
  slot_key: string;
  page_group: string;
  label: string;
  helper: string;
  default_url: string;
  default_alt: string;
  default_caption: string;
  default_focal_point: FocalPoint;
  is_logo?: boolean;
}

export interface ResolvedSiteImage {
  slot_key: string;
  page_group: string;
  label: string;
  image_url: string;
  alt_text: string;
  caption: string;
  focal_point: FocalPoint;
  is_custom: boolean;
}

export interface GalleryCategoryData {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
}

export interface GalleryItemData {
  id: string;
  slug: string;
  title: string;
  category_id: string;
  category_name: string;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
  is_featured: boolean;
  for_sale: boolean;
  price_label: string;
}

export interface PageContentFieldDef {
  content_key: string;
  page_group: string;
  label: string;
  helper: string;
  default_value: string;
  multiline?: boolean;
}

export interface TrusteeData {
  id: string;
  name: string;
  role: string;
  sort_order: number;
}

export interface SupporterData {
  id: string;
  name: string;
  logo_url: string;
  description: string;
  show_in_footer: boolean;
  show_on_about: boolean;
  sort_order: number;
}

export interface FriendData {
  id: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface SiteContentBundle {
  settings: SiteSettingsData;
  openingHours: OpeningHourRow[];
  announcement: AnnouncementData;
  images: Record<string, ResolvedSiteImage>;
  galleryCategories: GalleryCategoryData[];
  galleryItems: GalleryItemData[];
  galleryFromDb: boolean;
  pageContent: Record<string, string>;
  customTextKeys: string[];
  trustees: TrusteeData[];
  supporters: SupporterData[];
  friends: FriendData[];
}

export function normalizePhoneHref(phone: string): string {
  const digits = phone.replace(/[^+\d]/g, "");
  if (digits.startsWith("0")) return `tel:+44${digits.slice(1)}`;
  return `tel:${digits || "+441424444246"}`;
}

export function focalPointClass(fp: string | undefined): string {
  switch (fp) {
    case "top":
      return "object-top";
    case "bottom":
      return "object-bottom";
    case "left":
      return "object-left";
    case "right":
      return "object-right";
    default:
      return "object-center";
  }
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`
  );
}

export const TIME_OPTIONS = [
  "8:00am",
  "8:30am",
  "9:00am",
  "9:30am",
  "10:00am",
  "10:30am",
  "11:00am",
  "11:30am",
  "12:00pm",
  "12:30pm",
  "1:00pm",
  "1:30pm",
  "2:00pm",
  "2:30pm",
  "3:00pm",
  "3:30pm",
  "4:00pm",
  "4:30pm",
  "5:00pm",
  "5:30pm",
  "6:00pm",
  "6:30pm",
  "7:00pm",
  "7:30pm",
  "8:00pm",
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  id: "main",
  joining_fee: "£10.00",
  session_fee: "£3.00",
  session_fee_short: "£3 a session",
  session_fee_note: "Tea, coffee & biscuits included · £10 one-off joining fee",
  phone: SITE.phone,
  phoneHref: SITE.phoneHref,
  email: SITE.email,
  emailHref: SITE.emailHref,
  sales_email: SITE.salesEmail,
  salesEmailHref: SITE.salesEmailHref,
  facebook_url: SITE.facebookUrl,
  donate_url: SITE.donateUrl,
  address_lines: [...SITE.address],
};

export const DEFAULT_OPENING_HOURS: OpeningHourRow[] = OPENING.map((o, idx) => {
  const isOpen = o.hours !== "Closed";
  const parts = isOpen ? o.hours.split(/\s*[–-]\s*/) : [];
  return {
    day_order: idx + 1,
    day_name: o.day,
    is_open: isOpen,
    open_time: parts[0] || "10:00am",
    close_time: parts[1] || "4:00pm",
    hours_display: o.hours,
    note: o.note,
  };
});

export const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  id: "main",
  enabled: false,
  variant: "info",
  message: "",
  link_label: "",
  link_url: "",
  expires_at: null,
};

export const DEFAULT_SITE_IMAGES: SiteImageSlotDef[] = [
  {
    slot_key: "site.logo",
    page_group: "Logo & Video",
    label: "Main Shed Logo",
    helper: "Shown in the top-left navigation bar on every page.",
    default_url: logoAsset.url,
    default_alt: SITE.name,
    default_caption: "",
    default_focal_point: "center",
    is_logo: true,
  },
  {
    slot_key: "video.poster",
    page_group: "Logo & Video",
    label: "Slideshow Video Cover Image",
    helper: "The picture shown on the video player before someone clicks Play.",
    default_url: "/videos/shed-poster.jpg",
    default_alt: "Hastings & St Leonards Men's Shed workshop video preview",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "home.hero.mainHall",
    page_group: "Home Page",
    label: "Hero Top Main Photo",
    helper: "The large main workshop photo at the top right of the Home page.",
    default_url: WORKSHOP_PHOTOS.mainHall,
    default_alt: "Members chatting inside the Godfrey Bevan Workshops at Hastings & St Leonards Men's Shed",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "home.hero.woodworkingBench",
    page_group: "Home Page",
    label: "Hero Bottom-Left Photo",
    helper: "Smaller left-hand photo underneath the main hero image on the Home page.",
    default_url: WORKSHOP_PHOTOS.woodworkingBench,
    default_alt: "Member restoring a wooden chair at the workshop bench",
    default_caption: "",
    default_focal_point: "right",
  },
  {
    slot_key: "home.hero.buildingExterior",
    page_group: "Home Page",
    label: "Hero Bottom-Right Photo",
    helper: "Smaller right-hand photo underneath the main hero image (currently the entrance mural).",
    default_url: WORKSHOP_PHOTOS.buildingExterior,
    default_alt: "Exterior of the Hastings Men's Shed showing the yellow and red entrance mural",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "home.workshop.1",
    page_group: "Home Page",
    label: "Workshop Card 1 — Main Workshop Hall",
    helper: "First card in the 'Step inside our actual workshops' gallery on the Home page.",
    default_url: WORKSHOP_PHOTOS.mainHall,
    default_alt: "The Main Workshop Hall",
    default_caption:
      "Our spacious main woodworking hall — housed in a historic former theatre space — with plenty of benches, natural light and room to collaborate.",
    default_focal_point: "center",
  },
  {
    slot_key: "home.workshop.2",
    page_group: "Home Page",
    label: "Workshop Card 2 — Safe, Shared Machinery",
    helper: "Second card in the 'Step inside our actual workshops' gallery on the Home page.",
    default_url: WORKSHOP_PHOTOS.entranceView,
    default_alt: "Safe, Shared Machinery",
    default_caption:
      "Equipped with bandsaws, table saws, pillar drills, sanders, and overhead air filtration. Every member receives a full safety induction before using tools.",
    default_focal_point: "center",
  },
  {
    slot_key: "home.workshop.3",
    page_group: "Home Page",
    label: "Workshop Card 3 — Dedicated Metalwork Room",
    helper: "Third card in the 'Step inside our actual workshops' gallery on the Home page.",
    default_url: WORKSHOP_PHOTOS.metalWorkshop,
    default_alt: "Dedicated Metalwork Room",
    default_caption:
      "Alongside timber craft, we maintain a dedicated metalworking workshop equipped with an engineering lathe, grinders, and hand tools.",
    default_focal_point: "center",
  },
  {
    slot_key: "home.workshop.4",
    page_group: "Home Page",
    label: "Workshop Card 4 — Make, Mend & Restore",
    helper: "Fourth card in the 'Step inside our actual workshops' gallery on the Home page.",
    default_url: WORKSHOP_PHOTOS.woodworkingBench,
    default_alt: "Make, Mend & Restore",
    default_caption:
      "Members bring in personal projects, restore furniture, or build items from our stock of recycled timber for the community and charity sales.",
    default_focal_point: "right",
  },
  {
    slot_key: "home.workshop.5",
    page_group: "Home Page",
    label: "Workshop Card 5 — Working Side by Side",
    helper: "Fifth card in the 'Step inside our actual workshops' gallery on the Home page.",
    default_url: WORKSHOP_PHOTOS.teamAtWork,
    default_alt: "Working Side by Side",
    default_caption:
      "Experienced craftspeople and first-time makers working together at the benches — sharing knowledge, laughs, and peer support.",
    default_focal_point: "center",
  },
  {
    slot_key: "home.workshop.6",
    page_group: "Home Page",
    label: "Workshop Card 6 — Easy to Find in Manhattan Gardens",
    helper: "Sixth card in the 'Step inside our actual workshops' gallery on the Home page (also used on the Visit & Join page).",
    default_url: WORKSHOP_PHOTOS.buildingExterior,
    default_alt: "Easy to Find in Manhattan Gardens",
    default_caption:
      "Look for our hand-painted 'MEN'S SHED ENTRANCE' sign! On sunny days we also display handcrafted items for sale outside our green doors.",
    default_focal_point: "center",
  },
  {
    slot_key: "home.welcomeSign",
    page_group: "Home Page",
    label: "'Welcome to the Shed' Sign Photo",
    helper: "Shown next to the 'Your first visit' section on the Home page.",
    default_url: WELCOME_PHOTO.url,
    default_alt: "Hessian sign reading Welcome to the Shed, where great projects start",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "about.mainHall",
    page_group: "About Page",
    label: "About Page — Top Workshop Photo",
    helper: "Large workshop photo next to the Charitable Mission statement on the About page.",
    default_url: WORKSHOP_PHOTOS.mainHall,
    default_alt: "Inside the main woodworking hall at the Godfrey Bevan Workshops",
    default_caption:
      "The Godfrey Bevan Workshops: Members chatting and working side by side in our main hall in Ore, Hastings.",
    default_focal_point: "center",
  },
  {
    slot_key: "about.sawSign",
    page_group: "About Page",
    label: "About Page — Vintage Saw Sign",
    helper: "Left small card under the main workshop photo on the About page.",
    default_url: WORKSHOP_PHOTOS.manshedSawSign,
    default_alt: "Hand-painted vintage MANSHED handsaw sign",
    default_caption: "Our hand-painted vintage saw sign inside the Shed",
    default_focal_point: "center",
  },
  {
    slot_key: "about.lunarProbe",
    page_group: "About Page",
    label: "About Page — Fun Shed Cartoon / Photo",
    helper: "Right small card under the main workshop photo on the About page.",
    default_url: WORKSHOP_PHOTOS.lunarProbeCartoon,
    default_alt: "Hastings Lunar Probe cartoon from the Shed",
    default_caption: '"Most importantly, we\'re having fun whilst doing it!"',
    default_focal_point: "center",
  },
  {
    slot_key: "about.toolsAndClamps",
    page_group: "About Page",
    label: "About Page — Woodshop Tools Photo",
    helper: "Top-left square photo in the 'Facilities & Referrals' collage on the About page.",
    default_url: WORKSHOP_PHOTOS.toolsAndClamps,
    default_alt: "Member working with power tools and clamps in the woodshop",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "about.metalWorkshop",
    page_group: "About Page",
    label: "About Page — Metalwork Room Photo",
    helper: "Top-right square photo in the 'Facilities & Referrals' collage on the About page.",
    default_url: WORKSHOP_PHOTOS.metalWorkshop,
    default_alt: "The Shed's metalworking room and engineering lathe",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "about.sensoryTrail",
    page_group: "About Page",
    label: "About Page — Community Project Feature Photo",
    helper: "Wide bottom photo in the 'Facilities & Referrals' collage on the About page.",
    default_url: staticPhoto("sensory-trail-1").url,
    default_alt: "The Sensory Trail created by Shed members",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "civic.lordLieutenant",
    page_group: "Civic Visits & Letters",
    label: "Lord-Lieutenant Visit Photo",
    helper: "Shown on both the Home page and the About & Impact page.",
    default_url: WORKSHOP_PHOTOS.visitLordLieutenant,
    default_alt: "Shed members with Andrew Blackman, HM Lord-Lieutenant of East Sussex",
    default_caption:
      "Shed members and Trustees welcoming Andrew Blackman, HM Lord-Lieutenant of East Sussex, to the Godfrey Bevan Workshops.",
    default_focal_point: "center",
  },
  {
    slot_key: "civic.highSheriff",
    page_group: "Civic Visits & Letters",
    label: "High Sheriff Visit Photo",
    helper: "Shown on the About & Impact page civic endorsements section.",
    default_url: WORKSHOP_PHOTOS.visitHighSheriff,
    default_alt: "Lucinda Fraser DL, High Sheriff of East Sussex",
    default_caption: "",
    default_focal_point: "top",
  },
  {
    slot_key: "civic.highSheriffLetter",
    page_group: "Civic Visits & Letters",
    label: "High Sheriff Scanned Letter",
    helper: "Opens when visitors click 'View handwritten letter of support' on the About page.",
    default_url: WORKSHOP_PHOTOS.letterHighSheriff,
    default_alt: "Handwritten letter of support from the High Sheriff of East Sussex",
    default_caption: "",
    default_focal_point: "top",
  },
  {
    slot_key: "civic.mpSallyAnn",
    page_group: "Civic Visits & Letters",
    label: "Local MP Visit Photo",
    helper: "Shown on the About & Impact page civic endorsements section.",
    default_url: WORKSHOP_PHOTOS.visitMpSallyAnn,
    default_alt: "Sally-Ann Hart visiting Shed members in the workshop",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "civic.mpSallyAnnLetter",
    page_group: "Civic Visits & Letters",
    label: "Local MP Scanned Letter Extract",
    helper: "Opens when visitors click 'View signed letter extract' on the About page.",
    default_url: WORKSHOP_PHOTOS.letterMpSallyAnn,
    default_alt: "Signed letter extract from former MP Sally-Ann Hart",
    default_caption: "",
    default_focal_point: "top",
  },
  {
    slot_key: "commissions.main",
    page_group: "Commissions Page",
    label: "Commissions — Main Feature Photo",
    helper: "Large showcase photo next to the enquiry form on the Commissions & Repairs page.",
    default_url: staticPhoto("bench-refurb").url,
    default_alt: "A bench refurbished by Shed members",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "commissions.sub1",
    page_group: "Commissions Page",
    label: "Commissions — Small Left Photo",
    helper: "Left square photo under the main Commissions photo.",
    default_url: staticPhoto("pigeon-holes-for-hva").url,
    default_alt: "Pigeon holes made for Hastings Voluntary Action",
    default_caption: "",
    default_focal_point: "center",
  },
  {
    slot_key: "commissions.sub2",
    page_group: "Commissions Page",
    label: "Commissions — Small Right Photo",
    helper: "Right square photo under the main Commissions photo.",
    default_url: staticPhoto("art-deco-style").url,
    default_alt: "Art Deco style clock",
    default_caption: "",
    default_focal_point: "center",
  },
];

export const DEFAULT_PAGE_CONTENT: PageContentFieldDef[] = [
  // HOME PAGE
  {
    content_key: "home.heroPill",
    page_group: "Home Page",
    label: "Top Welcome Badge",
    helper: "Small badge next to the charity number at the very top of the Home page.",
    default_value: "The kettle's on — drop in any open session",
  },
  {
    content_key: "home.heroHeadingLine1",
    page_group: "Home Page",
    label: "Main Headline — Line 1",
    helper: "First line of the large headline on the Home page.",
    default_value: "Make things.",
  },
  {
    content_key: "home.heroHeadingLine2",
    page_group: "Home Page",
    label: "Main Headline — Line 2 (Highlighted)",
    helper: "Second line of the large headline in Shed teal.",
    default_value: "Make friends.",
  },
  {
    content_key: "home.heroIntro",
    page_group: "Home Page",
    label: "Main Welcome Paragraph",
    helper: "Introductory paragraph right below the main headline on the Home page.",
    multiline: true,
    default_value:
      "Welcome to the Hastings & St Leonards Men's (and Women's) Shed — a volunteer-run community charity where anyone at risk of loneliness or social isolation can socialise, share skills in our wood and metal workshops, and regain confidence and purpose. Everyone aged 18+ is welcome.",
  },
  {
    content_key: "home.missionHeading",
    page_group: "Home Page",
    label: "Charity Purpose Heading",
    helper: "Heading above the three charity pillars on the Home page.",
    default_value: "Why our charity exists",
  },
  {
    content_key: "home.missionIntro",
    page_group: "Home Page",
    label: "Charity Purpose Intro",
    helper: "Short summary below 'Why our charity exists'.",
    multiline: true,
    default_value:
      "Founded in 2016 after identifying a vital need in our local community, our charity aims to prevent social exclusion and improve mental and physical wellbeing across Hastings & St Leonards.",
  },
  {
    content_key: "home.workshopsHeading",
    page_group: "Home Page",
    label: "Workshops Section Heading",
    helper: "Heading above the 6 workshop photo cards on the Home page.",
    default_value: "Step inside our actual workshops",
  },
  {
    content_key: "home.workshopsIntro",
    page_group: "Home Page",
    label: "Workshops Section Description",
    helper: "Paragraph explaining the Godfrey Bevan Workshops.",
    multiline: true,
    default_value:
      "Located at 20 Manhattan Gardens in Ore, Hastings (right next door to Ore Community Centre and the Sunflower Café), our characterful building houses fully equipped woodworking, woodcarving, and metalworking spaces.",
  },
  {
    content_key: "home.firstVisitHeading",
    page_group: "Home Page",
    label: "First Visit Heading",
    helper: "Heading next to the 'Welcome to the Shed' hessian sign on the Home page.",
    default_value: "Welcome to the Shed — where great projects start",
  },
  {
    content_key: "home.firstVisitBody",
    page_group: "Home Page",
    label: "First Visit Intro",
    helper: "Friendly reassuring paragraph for first-time visitors.",
    multiline: true,
    default_value:
      "There's no need to book and no pressure to pick up a tool on day one. Just turn up during opening hours, say hello, and we'll put the kettle on. Have a look round, chat with members, and see if it feels right for you.",
  },
  {
    content_key: "home.civicHeading",
    page_group: "Home Page",
    label: "East Sussex Recognition Quote Heading",
    helper: "Quote headline next to the Lord-Lieutenant visit photo on the Home page.",
    default_value: '"Clearly a lifeline to many of your members"',
  },
  {
    content_key: "home.civicBody1",
    page_group: "Home Page",
    label: "East Sussex Recognition — Paragraph 1",
    helper: "First paragraph under the quote headline.",
    multiline: true,
    default_value:
      "Situated in one of the most deprived wards of Hastings, our volunteer-run charity provides a vital space for social connection, physical and mental activity, and community service.",
  },
  {
    content_key: "home.civicBody2",
    page_group: "Home Page",
    label: "East Sussex Recognition — Paragraph 2",
    helper: "Second paragraph highlighting local community projects & partners.",
    multiline: true,
    default_value:
      "Our members build wildlife habitats, refurbish benches, craft bespoke cabinetry for local charities like Hastings Voluntary Action, built a neighbourhood Sensory Trail, and partner with Ore in Bloom, Alexandra Park Greenhouse, and Tools With A Mission.",
  },
  {
    content_key: "home.galleryHeading",
    page_group: "Home Page",
    label: "Made in the Shed Preview Heading",
    helper: "Heading above the gallery preview on the Home page.",
    default_value: "Look what our members have been making",
  },
  {
    content_key: "home.gallerySubtitle",
    page_group: "Home Page",
    label: "Made in the Shed Preview Subtitle",
    helper: "Short line beneath the Home page gallery heading.",
    default_value: "We undertake custom commissions and repair work, and sell handcrafted items to help fund the charity.",
  },
  {
    content_key: "home.commissionsCtaHeading",
    page_group: "Home Page",
    label: "Bottom Teal Box Heading (Commissions)",
    helper: "Left call-to-action card near the bottom of the Home page.",
    default_value: "Commissions, repairs & item sales",
  },
  {
    content_key: "home.commissionsCtaBody",
    page_group: "Home Page",
    label: "Bottom Teal Box Text",
    helper: "Description inside the left call-to-action card on the Home page.",
    multiline: true,
    default_value:
      "We undertake custom woodwork, furniture repairs, bench restorations, and community commissions, as well as selling handcrafted items. Every job directly supports our charity.",
  },
  {
    content_key: "home.donateCtaHeading",
    page_group: "Home Page",
    label: "Bottom Gold Box Heading (Donate)",
    helper: "Right call-to-action card near the bottom of the Home page.",
    default_value: "Help keep our charity's doors open",
  },
  {
    content_key: "home.donateCtaBody",
    page_group: "Home Page",
    label: "Bottom Gold Box Text",
    helper: "Description inside the right call-to-action card on the Home page.",
    multiline: true,
    default_value:
      "We are run purely by unpaid volunteer Trustees and members. Every donation pays for timber, tools, safety equipment, utilities, and tea — keeping the Shed open for anyone facing isolation.",
  },

  // ABOUT PAGE
  {
    content_key: "about.heroTitle",
    page_group: "About Page",
    label: "Page Heading",
    helper: "Top banner heading on the About & Our Impact page.",
    default_value: "A workshop that's really about people",
  },
  {
    content_key: "about.heroIntro",
    page_group: "About Page",
    label: "Page Banner Intro",
    helper: "Intro text under the About page heading.",
    multiline: true,
    default_value:
      "The Hastings & St Leonards Men's (and Women's) Shed is a volunteer-run UK charity dedicated to relieving loneliness, preventing social exclusion, and improving mental and physical wellbeing across Hastings, St Leonards, and the surrounding area.",
  },
  {
    content_key: "about.missionQuote",
    page_group: "About Page",
    label: "Official Mission Statement Quote",
    helper: "Highlighted quote box at the top of the About page.",
    multiline: true,
    default_value:
      '"The Hastings & St Leonards Men’s Shed aims to provide an environment where anyone at risk of social isolation can meet to socialise and pursue a hobby or project for their own benefit, or that of the Shed’s, or for the wider community. Through volunteering, skill-sharing and community service, we aim to increase confidence and self-worth at the same time as mitigating the effects of isolation, loneliness and exclusion."',
  },
  {
    content_key: "about.storyParagraph1",
    page_group: "About Page",
    label: "Our Story — Paragraph 1 (Origins)",
    helper: "Explains the Men's Shed 'shoulder to shoulder' movement.",
    multiline: true,
    default_value:
      "The Men’s Shed concept began in Australia around 1999 from a simple observation: people—and particularly older or retired men—often find it much easier to talk and form friendships shoulder to shoulder while making or mending something together than sitting face to face. The movement spread across the UK, Ireland, New Zealand, Canada, and Europe, with hundreds of Sheds now transforming lives nationwide.",
  },
  {
    content_key: "about.storyParagraph2",
    page_group: "About Page",
    label: "Our Story — Paragraph 2 (Hastings Shed)",
    helper: "Explains when and where the Hastings Shed started.",
    multiline: true,
    default_value:
      "We started our Shed in 2016 after identifying an urgent need right here in Hastings & St Leonards. Located in one of the town's most deprived wards at The Godfrey Bevan Workshops (20 Manhattan Gardens), our charity is run purely by unpaid volunteer Trustees and members.",
  },
  {
    content_key: "about.storyParagraph3",
    page_group: "About Page",
    label: "Our Story — Paragraph 3 (Men & Women Welcome)",
    helper: "Explains that women are warmly welcomed too.",
    multiline: true,
    default_value:
      "You might assume from the traditional name that Men’s Sheds are only for men—however, we proudly welcome women too, and have regular women members who are an integral part of our workshop community. Whether you want to work on a complex woodworking or metalworking project, try woodcarving on a Monday morning, make items from our stock of recycled timber, or simply sit and chat with like-minded friends over a cup of tea and a biscuit, there is a place for you here.",
  },
  {
    content_key: "about.referralsBody",
    page_group: "About Page",
    label: "Who We Support Paragraph",
    helper: "Explains how the Shed helps people experiencing isolation.",
    multiline: true,
    default_value:
      "Our constitution defines social exclusion broadly: whether someone is experiencing loneliness in older age, living with a physical or learning disability, recovering from illness or bereavement, facing unemployment or financial hardship, or simply missing the camaraderie of a workplace, the Shed is here for them.",
  },
  {
    content_key: "about.socialPrescribingBody",
    page_group: "About Page",
    label: "Social Prescribers & Families Box",
    helper: "Information for NHS social prescribers, GPs, support workers, and family members.",
    multiline: true,
    default_value:
      "We regularly welcome enquiries from GP social prescribing link workers, local health & wellbeing teams, charities, and family members supporting a relative or friend who could benefit from company and purposeful activity. You are very welcome to accompany someone on their first visit so they can look around the workshops and have a cup of tea at their own pace.",
  },

  // VISIT & JOIN PAGE
  {
    content_key: "visit.heroTitle",
    page_group: "Visit & Join Page",
    label: "Page Heading",
    helper: "Top banner heading on the Visit & Join page.",
    default_value: "Just turn up — the kettle's on",
  },
  {
    content_key: "visit.heroIntro",
    page_group: "Visit & Join Page",
    label: "Page Banner Intro",
    helper: "Friendly welcome line below the Visit & Join heading.",
    multiline: true,
    default_value:
      "No booking, no forms on the doorstep, no pressure. Pop in during any open session, have a look around our wood and metal workshops, and grab a cuppa and a chat.",
  },
  {
    content_key: "visit.parkingInfo",
    page_group: "Visit & Join Page",
    label: "Parking Directions",
    helper: "Explains free parking at Ore Community Centre and Manhattan Gardens.",
    multiline: true,
    default_value:
      "We are located right next door to Ore Community Centre and the Sunflower Community Café. Free parking is available in the Community Centre Car Park (invaluable for our less mobile members), and there is also street parking at the east end of Manhattan Gardens near The Old King John public house.",
  },
  {
    content_key: "visit.parkingWarning",
    page_group: "Visit & Join Page",
    label: "Important Parking Warning",
    helper: "Highlighted amber warning box about entering car registration inside the Community Centre.",
    multiline: true,
    default_value:
      "Please note: If you park in the Community Centre car park, you MUST enter your vehicle registration into the touch-screen tablet inside the main community centre building within 10 minutes of arriving to avoid an automatic parking fine.",
  },
  {
    content_key: "visit.whoCanJoin",
    page_group: "Visit & Join Page",
    label: "'Who Can Join?' Card Text",
    helper: "Sidebar card explaining that men and women aged 18+ are welcome.",
    multiline: true,
    default_value:
      'Everyone aged 18 and over. Despite the traditional "Men\'s Shed" name, women are just as welcome as men, and we have regular women members taking part in sessions.',
  },

  // MADE IN THE SHED PAGE
  {
    content_key: "made.heroTitle",
    page_group: "Made in the Shed Page",
    label: "Page Heading",
    helper: "Top banner heading on the Made in the Shed gallery page.",
    default_value: "Projects, big and small",
  },
  {
    content_key: "made.heroIntro",
    page_group: "Made in the Shed Page",
    label: "Page Banner Intro",
    helper: "Short description above the gallery filters.",
    multiline: true,
    default_value:
      "From owl boxes and hedgehog houses to turned bowls and community commissions. Tap any photo to see it larger.",
  },

  // COMMISSIONS PAGE
  {
    content_key: "commissions.heroTitle",
    page_group: "Commissions Page",
    label: "Page Heading",
    helper: "Top banner heading on the Commissions & Repairs page.",
    default_value: "Something made, mended, restored or bought",
  },
  {
    content_key: "commissions.heroIntro",
    page_group: "Commissions Page",
    label: "Page Banner Intro",
    helper: "Intro text explaining commissions, repairs, and handcrafted sales.",
    multiline: true,
    default_value:
      "We undertake commission and repair work as well as selling handcrafted items made by our members. Every sale, repair, or custom build helps fund our charity (Registered Charity No. 1175075).",
  },
  {
    content_key: "commissions.directContactNote",
    page_group: "Commissions Page",
    label: "Pricing & Direct Contact Note",
    helper: "Note shown inside the 'Direct Contact for Enquiries' box.",
    multiline: true,
    default_value:
      "Every commission, repair, and purchase goes straight towards keeping the Shed running. Prices depend on the job and materials — we will always talk it through with you first.",
  },

  // DONATE PAGE
  {
    content_key: "donate.heroTitle",
    page_group: "Donate Page",
    label: "Page Heading",
    helper: "Top banner heading on the Donate / Support Our Charity page.",
    default_value: "Help keep our workshop doors open",
  },
  {
    content_key: "donate.heroIntro",
    page_group: "Donate Page",
    label: "Page Banner Intro",
    helper: "Intro text explaining where donations go.",
    multiline: true,
    default_value:
      "Hastings & St Leonards Men's Shed CIO is run purely by unpaid volunteers. Every pound donated goes directly towards timber, tools, safety equipment, rent, utilities, and the all-important tea — ensuring anyone facing loneliness in Hastings & St Leonards has a welcoming place to belong.",
  },
  {
    content_key: "donate.boxHeading",
    page_group: "Donate Page",
    label: "Main SumUp Donation Box Heading",
    helper: "Heading inside the dark teal donation box.",
    default_value: "Donations Gratefully Received",
  },
  {
    content_key: "donate.boxBody",
    page_group: "Donate Page",
    label: "Main SumUp Donation Box Text",
    helper: "Short message above the 'Donate securely via SumUp' button.",
    multiline: true,
    default_value:
      "Online donations are processed securely through SumUp. You can choose any amount that suits you — every contribution makes a direct difference in our community.",
  },
  {
    content_key: "donate.toolsBody",
    page_group: "Donate Page",
    label: "Donating Tools or Timber Text",
    helper: "Explains how the Shed handles donated tools and partners with TWAM.",
    multiline: true,
    default_value:
      "Have quality hand tools, power tools, or surplus timber looking for a good home? We inspect and PAT-test donated equipment for use in our workshops, and we partner with Tools With A Mission (TWAM) so that any excess tools are passed on to empower other makers rather than ending up in landfill.",
  },

  // POLICIES, VIDEO & FOOTER
  {
    content_key: "policies.heroTitle",
    page_group: "Policies, Video & Footer",
    label: "Policies Page Heading",
    helper: "Top banner heading on the Policies page.",
    default_value: "Constitution, handbook & policies",
  },
  {
    content_key: "policies.heroIntro",
    page_group: "Policies, Video & Footer",
    label: "Policies Page Intro",
    helper: "Intro text explaining CIO governance.",
    multiline: true,
    default_value:
      "Hastings & St Leonards Men's Shed CIO is a Charitable Incorporated Organisation (CIO) registered with the Charity Commission for England and Wales (Charity No. 1175075), governed by an elected board of unpaid volunteer Trustees.",
  },
  {
    content_key: "video.heading",
    page_group: "Policies, Video & Footer",
    label: "Video Section Heading",
    helper: "Heading above the embedded Shed slideshow video.",
    default_value: "Take a look inside the Shed",
  },
  {
    content_key: "video.description",
    page_group: "Policies, Video & Footer",
    label: "Video Section Description",
    helper: "Short paragraph above the embedded Shed slideshow video.",
    multiline: true,
    default_value:
      "The same relaxing slideshow that plays on a loop in our waiting area: our charitable mission, the Godfrey Bevan Workshops, our members, woodcarving and joinery projects, community restorations, wildlife builds, and our supporters — accompanied by calm soft piano and warm strings.",
  },
  {
    content_key: "footer.aboutSummary",
    page_group: "Policies, Video & Footer",
    label: "Footer Charity Summary",
    helper: "Paragraph in the bottom-left column of the footer on every page.",
    multiline: true,
    default_value:
      "A volunteer-run Charitable Incorporated Organisation (CIO) advancing physical and mental wellbeing and relieving loneliness and social isolation across Hastings & St Leonards through practical craft, skill-sharing, community service, and good company over a cuppa.",
  },
];

export const DEFAULT_TRUSTEES: TrusteeData[] = TRUSTEES.map((t, i) => ({
  id: `default-trustee-${i}`,
  name: t.name,
  role: t.role,
  sort_order: i,
}));

export const DEFAULT_SUPPORTERS: SupporterData[] = (() => {
  const byLogo = new Map<string, { name: string; desc: string }>(
    GRANT_SUPPORTERS.map((g) => [g.logo, { name: g.name, desc: g.desc }]),
  );
  return SUPPORTER_LOGOS.map((s, i) => {
    const grant = byLogo.get(s.logo);
    return {
      id: `default-supporter-${i}`,
      name: grant?.name ?? s.name,
      logo_url: s.logo,
      description: grant?.desc ?? "",
      show_in_footer: true,
      show_on_about: Boolean(grant),
      sort_order: i,
    };
  });
})();

export const DEFAULT_FRIENDS: FriendData[] = FRIENDS_OF_SHED.map((f, i) => ({
  id: `default-friend-${i}`,
  name: f.name,
  description: f.desc,
  sort_order: i,
}));

export const DEFAULT_GALLERY_CATEGORIES: GalleryCategoryData[] = CATEGORIES.map((name, i) => ({
  id: `default-cat-${i}`,
  slug: slugify(name),
  name,
  sort_order: i,
}));

export const DEFAULT_GALLERY_ITEMS: GalleryItemData[] = PHOTOS.map((p, i) => {
  const catIdx = Math.max(0, CATEGORIES.indexOf(p.category));
  return {
    id: `default-photo-${p.slug}`,
    slug: p.slug,
    title: p.title || p.slug,
    category_id: `default-cat-${catIdx}`,
    category_name: p.category,
    image_url: p.url,
    sort_order: i,
    is_visible: true,
    is_featured: i < 8,
    for_sale: false,
    price_label: "",
  };
});

export function buildDefaultSiteContent(): SiteContentBundle {
  const images: Record<string, ResolvedSiteImage> = {};
  for (const def of DEFAULT_SITE_IMAGES) {
    images[def.slot_key] = {
      slot_key: def.slot_key,
      page_group: def.page_group,
      label: def.label,
      image_url: def.default_url,
      alt_text: def.default_alt,
      caption: def.default_caption,
      focal_point: def.default_focal_point,
      is_custom: false,
    };
  }
  const pageContent: Record<string, string> = {};
  for (const f of DEFAULT_PAGE_CONTENT) {
    pageContent[f.content_key] = f.default_value;
  }
  return {
    settings: { ...DEFAULT_SITE_SETTINGS },
    openingHours: DEFAULT_OPENING_HOURS.map((o) => ({ ...o })),
    announcement: { ...DEFAULT_ANNOUNCEMENT },
    images,
    galleryCategories: DEFAULT_GALLERY_CATEGORIES.map((c) => ({ ...c })),
    galleryItems: DEFAULT_GALLERY_ITEMS.map((g) => ({ ...g })),
    galleryFromDb: false,
    pageContent,
    customTextKeys: [],
    trustees: DEFAULT_TRUSTEES.map((t) => ({ ...t })),
    supporters: DEFAULT_SUPPORTERS.map((s) => ({ ...s })),
    friends: DEFAULT_FRIENDS.map((f) => ({ ...f })),
  };
}

export interface RawCmsTables {
  settings: {
    id: string;
    joining_fee: string;
    session_fee: string;
    session_fee_short: string;
    session_fee_note: string;
    phone: string;
    email: string;
    sales_email: string;
    facebook_url: string;
    donate_url: string;
    address_lines: unknown;
  } | null;
  openingHours: Array<{
    id: string;
    day_order: number;
    day_name: string;
    is_open: boolean;
    open_time: string;
    close_time: string;
    hours_display: string;
    note: string;
  }>;
  announcement: {
    id: string;
    enabled: boolean;
    variant: string;
    message: string;
    link_label: string;
    link_url: string;
    expires_at: string | null;
  } | null;
  siteImages: Array<{
    slot_key: string;
    page_group: string;
    label: string;
    image_url: string;
    alt_text: string;
    caption: string;
    focal_point: string;
  }>;
  galleryCategories: Array<{
    id: string;
    slug: string;
    name: string;
    sort_order: number;
  }>;
  galleryItems: Array<{
    id: string;
    slug: string;
    title: string;
    category_id: string;
    image_url: string;
    sort_order: number;
    is_visible: boolean;
    is_featured: boolean;
    for_sale: boolean;
    price_label: string;
  }>;
  pageContent: Array<{
    content_key: string;
    value_text: string;
  }>;
  trustees: Array<{
    id: string;
    name: string;
    role: string;
    sort_order: number;
  }>;
  supporters: Array<{
    id: string;
    name: string;
    logo_url: string;
    description: string;
    show_in_footer: boolean;
    show_on_about: boolean;
    sort_order: number;
  }>;
  friends: Array<{
    id: string;
    name: string;
    description: string;
    sort_order: number;
  }>;
}

export function mergeSiteContent(raw: RawCmsTables | null | undefined): SiteContentBundle {
  const base = buildDefaultSiteContent();
  if (!raw) return base;

  if (raw.settings) {
    const addr = Array.isArray(raw.settings.address_lines)
      ? raw.settings.address_lines.map((x) => String(x)).filter(Boolean)
      : base.settings.address_lines;
    const phone = raw.settings.phone || base.settings.phone;
    const email = raw.settings.email || base.settings.email;
    const salesEmail = raw.settings.sales_email || base.settings.sales_email;
    base.settings = {
      id: raw.settings.id,
      joining_fee: raw.settings.joining_fee || base.settings.joining_fee,
      session_fee: raw.settings.session_fee || base.settings.session_fee,
      session_fee_short: raw.settings.session_fee_short || base.settings.session_fee_short,
      session_fee_note: raw.settings.session_fee_note || base.settings.session_fee_note,
      phone,
      phoneHref: normalizePhoneHref(phone),
      email,
      emailHref: `mailto:${email}`,
      sales_email: salesEmail,
      salesEmailHref: `mailto:${salesEmail}`,
      facebook_url: raw.settings.facebook_url || base.settings.facebook_url,
      donate_url: raw.settings.donate_url || base.settings.donate_url,
      address_lines: addr.length > 0 ? addr : base.settings.address_lines,
    };
  }

  if (raw.openingHours && raw.openingHours.length > 0) {
    const byDay = new Map(raw.openingHours.map((r) => [r.day_order, r]));
    base.openingHours = base.openingHours.map((def) => {
      const dbRow = byDay.get(def.day_order);
      if (!dbRow) return def;
      return {
        id: dbRow.id,
        day_order: dbRow.day_order,
        day_name: dbRow.day_name || def.day_name,
        is_open: dbRow.is_open,
        open_time: dbRow.open_time || def.open_time,
        close_time: dbRow.close_time || def.close_time,
        hours_display: dbRow.is_open
          ? dbRow.hours_display || `${dbRow.open_time} – ${dbRow.close_time}`
          : "Closed",
        note: dbRow.note ?? "",
      };
    });
  }

  if (raw.announcement) {
    const variant: AnnouncementVariant =
      raw.announcement.variant === "event" || raw.announcement.variant === "closure"
        ? raw.announcement.variant
        : "info";
    base.announcement = {
      id: raw.announcement.id,
      enabled: raw.announcement.enabled,
      variant,
      message: raw.announcement.message ?? "",
      link_label: raw.announcement.link_label ?? "",
      link_url: raw.announcement.link_url ?? "",
      expires_at: raw.announcement.expires_at ?? null,
    };
  }

  if (raw.siteImages && raw.siteImages.length > 0) {
    for (const row of raw.siteImages) {
      const existing = base.images[row.slot_key];
      const fp: FocalPoint =
        row.focal_point === "top" ||
        row.focal_point === "bottom" ||
        row.focal_point === "left" ||
        row.focal_point === "right"
          ? row.focal_point
          : "center";
      base.images[row.slot_key] = {
        slot_key: row.slot_key,
        page_group: existing?.page_group ?? row.page_group,
        label: existing?.label ?? row.label,
        image_url: row.image_url || existing?.image_url || "",
        alt_text: row.alt_text || existing?.alt_text || "",
        caption: row.caption ?? existing?.caption ?? "",
        focal_point: fp,
        is_custom: true,
      };
    }
  }

  if (raw.galleryCategories && raw.galleryCategories.length > 0) {
    const sortedCats = [...raw.galleryCategories].sort((a, b) => a.sort_order - b.sort_order);
    const catNameById = new Map(sortedCats.map((c) => [c.id, c.name]));
    base.galleryCategories = sortedCats;
    base.galleryFromDb = true;
    base.galleryItems = [...(raw.galleryItems ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        ...item,
        category_name: catNameById.get(item.category_id) ?? "Shed Makes",
      }));
  }

  if (raw.pageContent && raw.pageContent.length > 0) {
    const customKeys: string[] = [];
    for (const row of raw.pageContent) {
      base.pageContent[row.content_key] = row.value_text;
      customKeys.push(row.content_key);
    }
    base.customTextKeys = customKeys;
  }

  if (raw.trustees && raw.trustees.length > 0) {
    base.trustees = [...raw.trustees].sort((a, b) => a.sort_order - b.sort_order);
  }

  if (raw.supporters && raw.supporters.length > 0) {
    base.supporters = [...raw.supporters].sort((a, b) => a.sort_order - b.sort_order);
  }

  if (raw.friends && raw.friends.length > 0) {
    base.friends = [...raw.friends].sort((a, b) => a.sort_order - b.sort_order);
  }

  return base;
}

export function formatOpeningSummaryLine(hours: OpeningHourRow[]): string {
  const openDays = hours.filter((h) => h.is_open);
  if (openDays.length === 0) return "Please check our Visit & Join page for current opening times";
  return openDays
    .map((h) => {
      const shortDay = h.day_name.slice(0, 3);
      const compactHours = h.hours_display.replace(/:00/g, "").replace(/\s*–\s*/g, "–");
      const shortNote = h.note
        ? h.note
            .replace(/Session$/i, "")
            .replace(/Every 2nd & 4th Saturday of the month/i, "2nd & 4th Sat")
            .trim()
        : "";
      if (/2nd & 4th/i.test(shortNote)) return `2nd & 4th Sat ${compactHours}`;
      return shortNote ? `${shortDay} ${compactHours} (${shortNote})` : `${shortDay} ${compactHours}`;
    })
    .join(" · ");
}

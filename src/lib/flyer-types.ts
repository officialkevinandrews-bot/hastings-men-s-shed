import { photo as staticPhoto } from "@/lib/gallery";
import { WORKSHOP_PHOTOS } from "@/lib/site";
import type { SiteContentBundle } from "@/lib/cms-defaults";

export type FlyerFocal = "center" | "upper" | "top" | "bottom" | "left" | "right";
export type FlyerPrintSides = "both" | "front" | "back";
export type FlyerPaperMode = "a5" | "a4-2up" | "a4-poster";

export const FLYER_MASTER_ID = "master";
export const FLYER_PAGE_GROUP = "flyer_studio";
export const FLYER_KEY_PREFIX = "flyer:doc:";
export const FLYER_PREF_PREFIX = "flyer:last:";

export interface FlyerScheduleRow {
  day: string;
  hours: string;
  note: string;
  isOpen: boolean;
}

export interface FlyerDocument {
  id: string;
  name: string;
  isMaster: boolean;
  updatedAt: string;
  updatedBy?: string;
  syncFromWebsite: boolean;
  front: {
    topPill1: string;
    topPill2: string;
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    intro: string;
    mainPhotoUrl: string;
    mainPhotoCaption: string;
    mainPhotoFocal: FlyerFocal;
    craftLeftUrl: string;
    craftLeftCaption: string;
    craftLeftFocal: FlyerFocal;
    craftRightUrl: string;
    craftRightCaption: string;
    craftRightFocal: FlyerFocal;
    wellbeingEyebrow: string;
    wellbeingHeading: string;
    wellbeingPara1: string;
    wellbeingPara2: string;
    pill1: string;
    pill2: string;
    pill3: string;
    footerBar: string;
  };
  back: {
    eyebrow: string;
    heading: string;
    intro: string;
    hoursTitle: string;
    customHours: FlyerScheduleRow[];
    feesTitle: string;
    joiningFee: string;
    joiningFeeLabel: string;
    joiningFeeSub: string;
    sessionFee: string;
    sessionFeeLabel: string;
    sessionFeeSub: string;
    feesFootnote: string;
    locationTitle: string;
    addressLines: string[];
    parkingNote: string;
    exteriorPhotoUrl: string;
    exteriorPhotoFocal: FlyerFocal;
    qrPillText: string;
    qrUrl: string;
    qrDisplayUrl: string;
    qrHelpText: string;
    contactTitle: string;
    phone: string;
    phoneHoursNote: string;
    email: string;
    facebookText: string;
    commissionsTitle: string;
    commissionsBody: string;
    commissionsFooter: string;
    referralsTitle: string;
    referralsBody: string;
    referralsFooter: string;
    showSupporters: boolean;
    supportersHeading: string;
  };
}

export const DEFAULT_FLYER_SCHEDULE: FlyerScheduleRow[] = [
  { day: "Monday", hours: "10:00am – 1:00pm", note: "Woodcarving", isOpen: true },
  { day: "Tuesday", hours: "10:00am – 4:00pm", note: "General Session", isOpen: true },
  { day: "Wednesday", hours: "10:00am – 4:00pm", note: "General Session", isOpen: true },
  { day: "Thursday", hours: "CLOSED", note: "", isOpen: false },
  { day: "Friday", hours: "10:00am – 4:00pm", note: "General Session", isOpen: true },
  { day: "Saturday", hours: "10:00am – 1:00pm", note: "2nd & 4th Sat", isOpen: true },
  { day: "Sunday", hours: "CLOSED", note: "", isOpen: false },
];

export const QR_PRESETS = [
  { label: "Main Website (Home)", url: "https://www.hastingsmenshed.org.uk/", display: "www.hastingsmenshed.org.uk" },
  { label: "Visit & Opening Times", url: "https://www.hastingsmenshed.org.uk/visit", display: "hastingsmenshed.org.uk/visit" },
  {
    label: "Made in the Shed Gallery",
    url: "https://www.hastingsmenshed.org.uk/made-in-the-shed",
    display: "hastingsmenshed.org.uk/made-in-the-shed",
  },
  {
    label: "Commissions & Repairs",
    url: "https://www.hastingsmenshed.org.uk/commissions",
    display: "hastingsmenshed.org.uk/commissions",
  },
  { label: "Donate / Support Us", url: "https://www.hastingsmenshed.org.uk/donate", display: "hastingsmenshed.org.uk/donate" },
  {
    label: "Facebook Page",
    url: "https://www.facebook.com/profile.php?id=61561735482398",
    display: "Facebook: Hastings Men's Shed",
  },
] as const;

export function createMasterFlyerTemplate(): FlyerDocument {
  return {
    id: FLYER_MASTER_ID,
    name: "Main Shed Flyer (Master Template)",
    isMaster: true,
    updatedAt: new Date(0).toISOString(),
    syncFromWebsite: true,
    front: {
      topPill1: "REGISTERED UK CHARITY NO. 1175075",
      topPill2: "MEN & WOMEN AGED 18+ WELCOME",
      eyebrow: "THE KETTLE'S ON AT THE GODFREY BEVAN WORKSHOPS, HASTINGS",
      headlineLine1: "Fix things. Make friends.",
      headlineLine2: "Over a cup of tea.",
      intro:
        "A friendly, 100% volunteer-run community charity in Hastings where people come together to mend, craft, share skills — or simply sit down for a cuppa and good company.",
      mainPhotoUrl: WORKSHOP_PHOTOS.mainHall,
      mainPhotoCaption: "Inside The Godfrey Bevan Workshops — real friendships built side by side",
      mainPhotoFocal: "center",
      craftLeftUrl: staticPhoto("horse-head").url,
      craftLeftCaption: "Hand-carved horse head — made at the Shed",
      craftLeftFocal: "top",
      craftRightUrl: staticPhoto("owl").url,
      craftRightCaption: "Woodland owl carving — made at the Shed",
      craftRightFocal: "upper",
      wellbeingEyebrow: "MENTAL HEALTH, WELLBEING & TACKLING SOCIAL ISOLATION",
      wellbeingHeading: "More than a workshop — a place to belong",
      wellbeingPara1:
        "Retirement, bereavement, ill-health, disability, or living alone can leave anyone feeling cut off. People often talk best shoulder to shoulder — fixing something at a workbench or sharing a laugh over a mug of tea and a biscuit.",
      wellbeingPara2:
        "There is no pressure and no stigma here. Regular company keeps hands and minds active, rebuilds confidence and self-worth, and turns strangers into friends — even if you have never held a tool and just want a chat.",
      pill1: "✓ No Experience Needed",
      pill2: "✓ Wood, Metal & Carving",
      pill3: "✓ Tea, Coffee & Biscuits",
      footerBar: "NO BOOKING NEEDED — JUST DROP IN  •  TURN OVER FOR TIMES, FEES & WEBSITE QR CODE",
    },
    back: {
      eyebrow: "VISIT & JOIN US  •  NO EXPERIENCE OR BOOKING NEEDED",
      heading: "Just Turn Up — The Kettle's On",
      intro:
        "Pop in during any open session, say hello, and we will put the kettle on. Open inclusively to men and women aged 18+ of every skill level.",
      hoursTitle: "Weekly Workshop Opening Times",
      customHours: DEFAULT_FLYER_SCHEDULE.map((r) => ({ ...r })),
      feesTitle: "FEES KEPT SIMPLE & AFFORDABLE",
      joiningFee: "£10",
      joiningFeeLabel: "one-off joining fee",
      joiningFeeSub: "(when you decide to join)",
      sessionFee: "£3",
      sessionFeeLabel: "per session attended",
      sessionFeeSub: "tea, coffee & biscuits included!",
      feesFootnote: "Session contributions help fund daily workshop utilities and keep the kettle boiling.",
      locationTitle: "WHERE TO FIND US",
      addressLines: ["The Godfrey Bevan Workshops", "20 Manhattan Gardens, Hastings,", "East Sussex, TN35 5DQ"],
      parkingNote:
        "Next to Ore Community Centre & Sunflower Café. Free parking in the Community Centre car park (enter your car reg on the tablet inside the centre within 10 mins).",
      exteriorPhotoUrl: WORKSHOP_PHOTOS.buildingExterior,
      exteriorPhotoFocal: "center",
      qrPillText: "SCAN TO VISIT OUR WEBSITE",
      qrUrl: "https://www.hastingsmenshed.org.uk/",
      qrDisplayUrl: "www.hastingsmenshed.org.uk",
      qrHelpText: "Point your phone camera at the code to see our projects, watch our workshop tour & get in touch.",
      contactTitle: "GET IN TOUCH WITH THE SHED",
      phone: "01424 444246",
      phoneHoursNote: "(Answered during workshop opening hours)",
      email: "info@hastingsmenshed.org.uk",
      facebookText: "Facebook:  Hastings & St Leonards Men’s Shed",
      commissionsTitle: "COMMISSIONS, REPAIRS & ITEM SALES",
      commissionsBody:
        "We also undertake custom commission and repair work, as well as selling handcrafted items made by our members — from bird boxes and benches to bespoke woodwork. Every job helps keep our charity running.",
      commissionsFooter: "Email: info@hastingsmenshed.org.uk",
      referralsTitle: "SUPPORTING A LOVED ONE OR REFERRAL?",
      referralsBody:
        "Know someone who might be lonely or struggling after retirement, bereavement, or illness? Family members, carers, and GP social prescribers are warmly welcome to come along on a first visit for a friendly chat and a cuppa.",
      referralsFooter: "No pressure — visit at your own pace",
      showSupporters: true,
      supportersHeading: "GRATEFULLY SUPPORTED BY OUR FUNDERS & COMMUNITY FRIENDS",
    },
  };
}

export function normalizeFlyerDocument(raw: Partial<FlyerDocument> & { id: string }): FlyerDocument {
  const base = createMasterFlyerTemplate();
  return {
    id: raw.id,
    name: raw.name?.trim() || (raw.id === FLYER_MASTER_ID ? base.name : "Saved Shed Flyer"),
    isMaster: raw.id === FLYER_MASTER_ID,
    updatedAt: raw.updatedAt || base.updatedAt,
    ...(raw.updatedBy ? { updatedBy: raw.updatedBy } : {}),
    syncFromWebsite: raw.syncFromWebsite ?? true,
    front: { ...base.front, ...(raw.front ?? {}) },
    back: {
      ...base.back,
      ...(raw.back ?? {}),
      customHours:
        Array.isArray(raw.back?.customHours) && raw.back.customHours.length > 0
          ? raw.back.customHours
          : base.back.customHours,
      addressLines:
        Array.isArray(raw.back?.addressLines) && raw.back.addressLines.length > 0
          ? raw.back.addressLines
          : base.back.addressLines,
    },
  };
}

function compactFeeNumber(fee: string): string {
  return fee.replace(/\.00\b/, "").trim() || fee;
}

function shortenNoteForFlyer(note: string): string {
  return note
    .replace(/Every 2nd & 4th Saturday of the month/i, "2nd & 4th Sat")
    .replace(/General Workshop Session/i, "General Session")
    .replace(/Woodcarving Session/i, "Woodcarving")
    .replace(/Hoping to open in future/i, "")
    .trim();
}

export interface ResolvedFlyerRenderData {
  doc: FlyerDocument;
  logoUrl: string;
  schedule: FlyerScheduleRow[];
  joiningFee: string;
  sessionFee: string;
  addressLines: string[];
  phone: string;
  email: string;
  commissionsFooter: string;
  supporters: Array<{ name: string; logoUrl: string }>;
}

/**
 * Merges live website Opening Hours, Fees, Contacts, and Supporter Logos when syncFromWebsite is enabled.
 */
export function resolveFlyerForRender(doc: FlyerDocument, siteContent: SiteContentBundle): ResolvedFlyerRenderData {
  const supporters = siteContent.supporters
    .filter((s) => s.show_in_footer)
    .slice(0, 8)
    .map((s) => ({ name: s.name, logoUrl: s.logo_url }));

  const customSiteLogo = siteContent.images["site.logo"];
  const logoUrl = customSiteLogo?.is_custom
    ? customSiteLogo.image_url
    : "/images/flyer/shed-logo-transparent.png";

  if (!doc.syncFromWebsite) {
    return {
      doc,
      logoUrl,
      schedule: doc.back.customHours,
      joiningFee: doc.back.joiningFee,
      sessionFee: doc.back.sessionFee,
      addressLines: doc.back.addressLines,
      phone: doc.back.phone,
      email: doc.back.email,
      commissionsFooter: doc.back.commissionsFooter,
      supporters,
    };
  }

  const syncedSchedule: FlyerScheduleRow[] = siteContent.openingHours.map((h) => ({
    day: h.day_name,
    hours: h.is_open ? h.hours_display : "CLOSED",
    note: h.is_open ? shortenNoteForFlyer(h.note) : "",
    isOpen: h.is_open,
  }));

  const addr = siteContent.settings.address_lines;
  const formattedAddress =
    addr.length >= 4
      ? [addr[0]!, `${addr[1]}, ${addr[2]?.split(",")[0] ?? ""}`.replace(/,\s*$/, ","), `${addr[2]?.split(",")[1]?.trim() || "East Sussex"}, ${addr[3]}`]
      : addr;

  return {
    doc,
    logoUrl,
    schedule: syncedSchedule,
    joiningFee: compactFeeNumber(siteContent.settings.joining_fee),
    sessionFee: compactFeeNumber(siteContent.settings.session_fee),
    addressLines: formattedAddress,
    phone: siteContent.settings.phone,
    email: siteContent.settings.email,
    commissionsFooter: `Email: ${siteContent.settings.email}`,
    supporters,
  };
}

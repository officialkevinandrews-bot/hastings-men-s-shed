export const SITE = {
  name: "Hastings & St Leonards Men's Shed",
  legalName: "Hastings & St Leonards Men's Shed CIO",
  short: "Hastings Men's Shed",
  charityNumber: "1175075",
  address: ["The Godfrey Bevan Workshops", "20 Manhattan Gardens", "Hastings, East Sussex", "TN35 5DQ"],
  phone: "01424 444246",
  phoneHref: "tel:+441424444246",
  email: "info@hastingsmenshed.org.uk",
  emailHref: "mailto:info@hastingsmenshed.org.uk",
  salesEmail: "sales@hastingsmenshed.org.uk",
  salesEmailHref: "mailto:sales@hastingsmenshed.org.uk",
  donateUrl: "https://pay.sumup.com/b2c/QMPIUPBZ",
  charityCommissionUrl: "https://register-of-charities.charitycommission.gov.uk/en/charity-search/-/charity-details/5105383",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=20+Manhattan+Gardens+Hastings+TN35+5DQ",
  mapEmbed: "https://www.google.com/maps?q=20+Manhattan+Gardens,+Hastings+TN35+5DQ&output=embed",
};

export const WORKSHOP_PHOTOS = {
  mainHall: "/images/workshop/landing-workshop-1.jpg",
  entranceView: "/images/workshop/landing-workshop-2.jpg",
  woodworkingBench: "/images/workshop/landing-workshop-3.jpg",
  teamAtWork: "/images/workshop/landing-workshop-4.jpg",
  buildingExterior: "/images/workshop/landing-workshop-5.jpg",
  lunarProbeCartoon: "/images/workshop/about-workshop-1.jpg",
  metalWorkshop: "/images/workshop/about-workshop-2.jpg",
  toolsAndClamps: "/images/workshop/about-workshop-3.jpg",
  manshedSawSign: "/images/workshop/about-workshop-4.jpg",
  visitHighSheriff: "/images/workshop/visit-high-sheriff.jpg",
  letterHighSheriff: "/images/workshop/letter-high-sheriff.jpg",
  visitLordLieutenant: "/images/workshop/visit-lord-lieutenant.jpg",
  visitMpSallyAnn: "/images/workshop/visit-mp-sally-ann.jpg",
  letterMpSallyAnn: "/images/workshop/letter-mp-sally-ann.jpg",
} as const;

export const OPENING = [
  { day: "Monday", hours: "10:00am – 1:00pm", note: "Woodcarving Session" },
  { day: "Tuesday", hours: "10:00am – 4:00pm", note: "General Workshop Session" },
  { day: "Wednesday", hours: "10:00am – 4:00pm", note: "General Workshop Session" },
  { day: "Thursday", hours: "Closed", note: "Hoping to open in future" },
  { day: "Friday", hours: "10:00am – 4:00pm", note: "General Workshop Session" },
  { day: "Saturday", hours: "10:00am – 1:00pm", note: "Every 2nd & 4th Saturday of the month" },
  { day: "Sunday", hours: "Closed", note: "" },
] as const;

export const TRUSTEES = [
  { name: "Godfrey Bevan", role: "Chairman & Charity Trustee" },
  { name: "Simon Reeves", role: "Operations & Charity Trustee" },
  { name: "Jerome Hill", role: "Secretary & Charity Trustee" },
  { name: "Margaret (Mags) Pawson", role: "Treasurer & Charity Trustee" },
] as const;

export const SUPPORTERS = [
  "Big Local NE Hastings",
  "The National Lottery Community Fund",
  "Julia & Hans Rausing Trust",
  "Sussex Community Foundation",
  "Hastings Voluntary Action",
  "Ore Community Centre & Sunflower Café",
  "Ore in Bloom",
  "Southern Water",
  "The Muffin Club",
];

export const FRIENDS_OF_SHED = [
  {
    name: "Ore Community Centre & The Sunflower Café",
    desc: "Right next door to our workshops — the free parking for our less mobile members and wonderful food from Jordan in the Café are invaluable.",
  },
  {
    name: "Hastings Voluntary Action (HVA)",
    desc: "Providing vital charity guidance, governance advice and local voluntary sector support — we couldn't survive without them.",
  },
  {
    name: "Ore in Bloom",
    desc: "Looking after our borders and collaborating with our members on planters and green spaces that brighten the local area.",
  },
  {
    name: "Alexandra Park Greenhouse",
    desc: "Inviting the Shed to showcase local craft at events like World Wood Day and partnering on community initiatives.",
  },
  {
    name: "Umbrella Sussex (Library of Things & Make & Mend)",
    desc: "Sharing a common charitable ethos of skill-sharing, repair, reuse and community connection in Hastings.",
  },
  {
    name: "Tools With A Mission (TWAM)",
    desc: "Providing a worthwhile second home for our surplus donated tools — much better to share and empower others than send tools to landfill.",
  },
] as const;

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
  facebookUrl: "https://www.facebook.com/profile.php?id=61561735482398",
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

export const SUPPORTER_LOGOS = [
  {
    name: "Sussex Community Foundation",
    logo: "/images/supporters/sussex-community-foundation.png",
  },
  {
    name: "The National Lottery Community Fund",
    logo: "/images/supporters/national-lottery-community-fund.png",
  },
  {
    name: "Southern Water Community Grant",
    logo: "/images/supporters/southern-water.png",
  },
  {
    name: "North East Hastings Big Local",
    logo: "/images/supporters/big-local-ne-hastings.png",
  },
  {
    name: "The Muffin Club",
    logo: "/images/supporters/the-muffin-club.png",
  },
  {
    name: "The Julia and Hans Rausing Trust",
    logo: "/images/supporters/julia-and-hans-rausing-trust.png",
  },
  {
    name: "Hastings Voluntary Action",
    logo: "/images/supporters/hastings-voluntary-action.png",
  },
  {
    name: "Ore in Bloom",
    logo: "/images/supporters/ore-in-bloom.png",
  },
] as const;

export const GRANT_SUPPORTERS = [
  {
    name: "North East Hastings Big Local",
    logo: "/images/supporters/big-local-ne-hastings.png",
    desc: "Big Local enables residents in 150 areas across England to use at least £1m to make a lasting positive difference to their communities — bringing together local talent, ambitions, skills, and energy from individuals and groups to make their area a better place to live.",
  },
  {
    name: "The National Lottery Community Fund",
    logo: "/images/supporters/national-lottery-community-fund.png",
    desc: "The National Lottery raises money for good causes, enabling local people to take the lead in improving their lives and communities. Every National Lottery ticket helps make community funding possible for groups of all shapes and sizes.",
  },
  {
    name: "The Julia and Hans Rausing Trust",
    logo: "/images/supporters/julia-and-hans-rausing-trust.png",
    desc: "Hans Rausing is one of the UK's foremost philanthropists, supporting a wide range of charitable causes and community organisations across the country through the Julia and Hans Rausing Trust and its predecessor trusts since the 1990s.",
  },
  {
    name: "Sussex Community Foundation",
    logo: "/images/supporters/sussex-community-foundation.png",
    desc: "A registered charity that exists to make Sussex a fairer and more equal place by enabling local people to support local causes, providing vital grants to small charities and voluntary groups working in communities across Sussex.",
  },
  {
    name: "Southern Water (Community Grant & Goodwill Fund)",
    logo: "/images/supporters/southern-water.png",
    desc: "We are very grateful for the financial support provided by Southern Water — their community grant in 2025 allows us to continue our charitable work supporting residents in Hastings & St Leonards.",
  },
  {
    name: "The Hastings & St Leonards Muffin Club",
    logo: "/images/supporters/the-muffin-club.png",
    desc: "Since 1952, the Hastings & St Leonards Muffin Club has raised funds through community functions and distributed this money to worthy causes, deserving local charities, and individuals in need within the Borough of Hastings.",
  },
  {
    name: "Hastings Voluntary Action (HVA)",
    logo: "/images/supporters/hastings-voluntary-action.png",
    desc: "Enhancing the quality of life of people in the Hastings area by promoting voluntary action and supporting the development of local initiatives to meet community needs. We are deeply grateful for all of their advice and support.",
  },
] as const;

export const FRIENDS_OF_SHED = [
  {
    name: "Ore Community Centre & The Sunflower Café",
    desc: "The parking for our less mobile members and wonderful food from Jordan in the Café is invaluable.",
  },
  {
    name: "Ore in Bloom",
    desc: "Many thanks to all at Ore in Bloom for making such a good job of our borders — what a difference!",
  },
  {
    name: "Hastings Voluntary Action",
    desc: "Thank you for all the advice and support — we couldn't survive without you.",
  },
  {
    name: "Alexandra Park Greenhouse",
    desc: "Thank you for inviting us to your 'World Wood Day' event in 2025! We look forward to further collaborations with you.",
  },
  {
    name: "Umbrella Sussex",
    desc: "Hastings Library of Things and Make & Mend — what more appropriate friend of the Shed could you think of!",
  },
  {
    name: "Tools With A Mission",
    desc: "Glad we have a good home for our excess tools — much better to share than dump in landfill.",
  },
] as const;

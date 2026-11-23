export const SITE = {
  name: "Hastings & St Leonards Men's Shed",
  short: "Hastings Men's Shed",
  address: ["The Godfrey Bevan Workshops", "20 Manhattan Gardens", "Hastings, East Sussex", "TN35 5DQ"],
  phone: "01424 444246",
  phoneHref: "tel:+441424444246",
  donateUrl: "https://pay.sumup.com/b2c/QMPIUPBZ",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=20+Manhattan+Gardens+Hastings+TN35+5DQ",
  mapEmbed: "https://www.google.com/maps?q=20+Manhattan+Gardens,+Hastings+TN35+5DQ&output=embed",
};

export const OPENING = [
  { day: "Monday", hours: "10am – 1pm", note: "Woodcarving" },
  { day: "Tuesday", hours: "10am – 4pm", note: "General workshop" },
  { day: "Wednesday", hours: "10am – 4pm", note: "General workshop" },
  { day: "Thursday", hours: "Closed", note: "" },
  { day: "Friday", hours: "10am – 4pm", note: "General workshop" },
  { day: "Saturday", hours: "10am – 1pm", note: "2nd & 4th Saturday of the month" },
  { day: "Sunday", hours: "Closed", note: "" },
] as const;

export const SUPPORTERS = [
  "Big Local NE Hastings",
  "The National Lottery Community Fund",
  "Julia & Hans Rausing Trust",
  "Sussex Community Foundation",
  "Hastings Voluntary Action",
  "Ore Community Centre & Sunflower Cafe",
  "Ore in Bloom",
  "Southern Water",
  "The Muffin Club",
];

type Pointer = { url: string };
const files = import.meta.glob<Pointer>("../assets/shed/*.asset.json", { eager: true, import: "default" });

export type Category = "Wildlife & Gardens" | "Craft & Gifts" | "Community Commissions";
export const CATEGORIES: Category[] = ["Wildlife & Gardens", "Craft & Gifts", "Community Commissions"];

const META: Record<string, [string, Category]> = {
  "barn-owl-box-2": ["Barn owl box", "Wildlife & Gardens"],
  "owl-box-2": ["Owl box", "Wildlife & Gardens"],
  "bird-box-1": ["Bird box", "Wildlife & Gardens"],
  "bird-box-2": ["Bird box", "Wildlife & Gardens"],
  "bird-table-a": ["Bird table", "Wildlife & Gardens"],
  "bird-table-b1": ["Bird table", "Wildlife & Gardens"],
  "dovecote-2": ["Dovecote", "Wildlife & Gardens"],
  "dovecote-3": ["Dovecote", "Wildlife & Gardens"],
  "hedgehog-house": ["Hedgehog house", "Wildlife & Gardens"],
  "insect-box-1": ["Insect box", "Wildlife & Gardens"],
  "hutch-1": ["Rabbit hutch", "Wildlife & Gardens"],
  "grey-planter-2": ["Garden planter", "Wildlife & Gardens"],
  "garden-bench": ["Garden bench", "Wildlife & Gardens"],
  "haywain-3": ["Haywain planter in progress", "Wildlife & Gardens"],
  "haywain-7-finished": ["Haywain planter, finished", "Wildlife & Gardens"],
  "art-deco-style": ["Art Deco style clock", "Craft & Gifts"],
  "3-tier-fruit-bowl": ["Three-tier fruit bowl", "Craft & Gifts"],
  "two-tier-bowl-2": ["Two-tier bowl", "Craft & Gifts"],
  "bow-1": ["Model boat", "Craft & Gifts"],
  "bowl-3": ["Turned bowl", "Craft & Gifts"],
  "horse-head": ["Carved horse head", "Craft & Gifts"],
  "owl": ["Carved owl", "Craft & Gifts"],
  "vole-1": ["Carved vole", "Craft & Gifts"],
  "tree-2": ["Carved tree", "Craft & Gifts"],
  "woodcarving-blue-vase-chaz": ["Blue vase woodcarving by Chaz", "Craft & Gifts"],
  "jim-s-stand": ["Jim's stand", "Craft & Gifts"],
  "misc-on-table": ["A table of shed makes", "Craft & Gifts"],
  "sensory-trail-1": ["Sensory Trail", "Community Commissions"],
  "pigeon-holes-for-hva": ["Pigeon holes for Hastings Voluntary Action", "Community Commissions"],
  "bench-refurb": ["Bench refurbishment", "Community Commissions"],
  "dance-prop": ["Stage prop for a dance group", "Community Commissions"],
};

export type Photo = { slug: string; url: string; title: string; category: Category };

const all: Photo[] = Object.entries(files).map(([path, mod]) => {
  const slug = path.split("/").pop()!.replace(".jpg.asset.json", "");
  const meta = META[slug];
  return { slug, url: mod.url, title: meta?.[0] ?? "", category: meta?.[1] ?? "Craft & Gifts" };
});

export const WELCOME_PHOTO = all.find((p) => p.slug === "66a5787")!;
export const PHOTOS = all.filter((p) => p.slug !== "66a5787");
export const photo = (slug: string) => all.find((p) => p.slug === slug)!;

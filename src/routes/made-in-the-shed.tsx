import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Gallery } from "@/components/site/Gallery";
import { ShedVideo } from "@/components/site/ShedVideo";
import { useSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/made-in-the-shed")({
  head: () => ({
    meta: [
      { title: "Made in the Shed | Hastings & St Leonards Men's Shed" },
      { name: "description", content: "Owl boxes, hedgehog houses, turned bowls, carvings, an Art Deco clock and community commissions — all made by members of the Hastings Men's Shed." },
      { property: "og:title", content: "Made in the Shed — Hastings Men's Shed projects" },
      { property: "og:description", content: "Browse wildlife & garden makes, crafts & gifts and community commissions." },
    ],
  }),
  component: Made,
});

function Made() {
  const { pageContent } = useSiteContent();
  return (
    <>
      <PageHero eyebrow="Made in the Shed" title={pageContent["made.heroTitle"] ?? "Projects, big and small"}>
        {pageContent["made.heroIntro"]}
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 py-14"><Gallery /></section>
      <ShedVideo />
    </>
  );
}

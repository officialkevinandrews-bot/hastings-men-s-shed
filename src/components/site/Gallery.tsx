import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X, ArrowRight, Tag } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function Gallery({ limit }: { limit?: number }) {
  const { galleryCategories, galleryItems } = useSiteContent();
  const [catId, setCatId] = useState<string>("All");
  const [idx, setIdx] = useState<number | null>(null);

  const visibleItems = useMemo(() => {
    const active = galleryItems.filter((p) => p.is_visible);
    if (!limit) return active;
    // On homepage preview (limit set), show starred "Featured" items first
    return [...active].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
  }, [galleryItems, limit]);

  const list = useMemo(() => {
    const filtered = catId === "All" ? visibleItems : visibleItems.filter((p) => p.category_id === catId);
    return limit ? filtered.slice(0, limit) : filtered;
  }, [visibleItems, catId, limit]);

  const step = useCallback(
    (d: number) => setIdx((i) => (i === null || list.length === 0 ? null : (i + d + list.length) % list.length)),
    [list.length],
  );

  useEffect(() => {
    if (idx === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIdx(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [idx, step]);

  const current = idx === null ? null : list[idx] ?? null;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
        <button
          role="tab"
          aria-selected={catId === "All"}
          onClick={() => {
            setCatId("All");
            setIdx(null);
          }}
          className={cn(
            "rounded-full border-2 px-4 py-2 font-bold transition",
            catId === "All"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-aqua",
          )}
        >
          All
        </button>
        {galleryCategories.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={catId === c.id}
            onClick={() => {
              setCatId(c.id);
              setIdx(null);
            }}
            className={cn(
              "rounded-full border-2 px-4 py-2 font-bold transition",
              catId === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-aqua",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 gap-4 md:columns-3 lg:columns-4">
        {list.map((p, i) => (
          <button
            key={p.id || p.slug}
            onClick={() => setIdx(i)}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-card text-left shadow-soft"
          >
            <div className="relative overflow-hidden">
              <img
                src={p.image_url}
                alt={p.title}
                loading="lazy"
                className="w-full transition duration-500 group-hover:scale-105"
              />
              {p.for_sale && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground shadow-xs">
                  <Tag className="h-3 w-3" /> {p.price_label || "Available"}
                </span>
              )}
            </div>
            <span className="block px-3 py-2">
              <span className="block font-bold leading-tight">{p.title}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category_name}</span>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={() => setIdx(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-card p-2"
            aria-label="Close"
            onClick={() => setIdx(null)}
          >
            <X />
          </button>
          <button
            className="absolute left-3 rounded-full bg-card p-2"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            <ChevronLeft />
          </button>
          <figure className="max-h-full max-w-4xl text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={current.image_url}
              alt={current.title}
              className="mx-auto max-h-[74vh] rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-lg font-bold text-background">
              {current.title} <span className="font-normal opacity-75">· {current.category_name}</span>
              {current.for_sale && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground">
                  <Tag className="h-3 w-3" /> {current.price_label || "Available to buy"}
                </span>
              )}
            </figcaption>
            <div className="mt-4">
              <Link
                to="/commissions"
                onClick={() => setIdx(null)}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-extrabold text-accent-foreground hover:brightness-95"
              >
                Interested in buying or commissioning something similar? Enquire here <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </figure>
          <button
            className="absolute right-3 rounded-full bg-card p-2"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

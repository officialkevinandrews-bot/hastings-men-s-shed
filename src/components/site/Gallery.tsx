import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { CATEGORIES, PHOTOS, type Category } from "@/lib/gallery";
import { cn } from "@/lib/utils";

export function Gallery({ limit }: { limit?: number }) {
  const [cat, setCat] = useState<Category | "All">("All");
  const [idx, setIdx] = useState<number | null>(null);
  const list = (cat === "All" ? PHOTOS : PHOTOS.filter((p) => p.category === cat)).slice(0, limit);
  const step = useCallback((d: number) => setIdx((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);

  useEffect(() => {
    if (idx === null) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setIdx(null); if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [idx, step]);

  const current = idx === null ? null : list[idx];
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
            className={cn("rounded-full border-2 px-4 py-2 font-bold transition", cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-aqua")}>
            {c}
          </button>
        ))}
      </div>
      <div className="mt-8 columns-2 gap-4 md:columns-3 lg:columns-4">
        {list.map((p, i) => (
          <button key={p.slug} onClick={() => setIdx(i)} className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-card text-left shadow-soft">
            <img src={p.url} alt={p.title} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
            <span className="block px-3 py-2">
              <span className="block font-bold leading-tight">{p.title}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{p.category}</span>
            </span>
          </button>
        ))}
      </div>
      {current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4" role="dialog" aria-modal="true" aria-label={current.title} onClick={() => setIdx(null)}>
          <button className="absolute right-4 top-4 rounded-full bg-card p-2" aria-label="Close" onClick={() => setIdx(null)}><X /></button>
          <button className="absolute left-3 rounded-full bg-card p-2" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}><ChevronLeft /></button>
          <figure className="max-h-full max-w-4xl text-center" onClick={(e) => e.stopPropagation()}>
            <img src={current.url} alt={current.title} className="mx-auto max-h-[74vh] rounded-lg object-contain" />
            <figcaption className="mt-3 text-lg font-bold text-background">{current.title} <span className="font-normal opacity-75">· {current.category}</span></figcaption>
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
          <button className="absolute right-3 rounded-full bg-card p-2" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}><ChevronRight /></button>
        </div>
      )}
    </div>
  );
}

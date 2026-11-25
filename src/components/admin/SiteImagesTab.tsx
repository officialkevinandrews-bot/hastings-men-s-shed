import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_SITE_IMAGES,
  focalPointClass,
  type FocalPoint,
  type ResolvedSiteImage,
} from "@/lib/cms-defaults";
import { resetSiteImage, upsertSiteImage } from "@/lib/admin.functions";
import { PhotoUploadButton } from "@/components/admin/PhotoUploadButton";
import { cn } from "@/lib/utils";

interface SiteImagesTabProps {
  images: Record<string, ResolvedSiteImage>;
  onRefresh: () => Promise<void>;
}

const GROUPS = ["Home Page", "About Page", "Civic Visits & Letters", "Commissions Page", "Logo & Video"] as const;

export function SiteImagesTab({ images, onRefresh }: SiteImagesTabProps) {
  const saveFn = useServerFn(upsertSiteImage);
  const resetFn = useServerFn(resetSiteImage);

  const [activeGroup, setActiveGroup] = useState<string>(GROUPS[0]);
  const [drafts, setDrafts] = useState<Record<string, { url: string; alt: string; caption: string; fp: FocalPoint }>>(
    {},
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const slots = DEFAULT_SITE_IMAGES.filter((s) => s.page_group === activeGroup);

  function getDraft(slotKey: string) {
    const resolved = images[slotKey];
    const def = DEFAULT_SITE_IMAGES.find((d) => d.slot_key === slotKey)!;
    return (
      drafts[slotKey] ?? {
        url: resolved?.image_url ?? def.default_url,
        alt: resolved?.alt_text ?? def.default_alt,
        caption: resolved?.caption ?? def.default_caption,
        fp: resolved?.focal_point ?? def.default_focal_point,
      }
    );
  }

  function patchDraft(slotKey: string, patch: Partial<{ url: string; alt: string; caption: string; fp: FocalPoint }>) {
    const current = getDraft(slotKey);
    setDrafts((prev) => ({ ...prev, [slotKey]: { ...current, ...patch } }));
  }

  async function handleSave(slotKey: string) {
    const def = DEFAULT_SITE_IMAGES.find((d) => d.slot_key === slotKey)!;
    const d = getDraft(slotKey);
    setBusyKey(slotKey);
    try {
      await saveFn({
        data: {
          slot_key: slotKey,
          page_group: def.page_group,
          label: def.label,
          image_url: d.url,
          alt_text: d.alt,
          caption: d.caption,
          focal_point: d.fp,
        },
      });
      toast.success(`Updated "${def.label}"!`);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save photo.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReset(slotKey: string) {
    const def = DEFAULT_SITE_IMAGES.find((d) => d.slot_key === slotKey)!;
    if (!window.confirm(`Restore "${def.label}" back to the original photo?`)) return;
    setBusyKey(slotKey);
    try {
      await resetFn({ data: { slot_key: slotKey } });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
      toast.success(`Restored original photo for "${def.label}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restore default photo.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Website Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Change any photo used across the website. Photos are automatically resized for fast loading, and you can
          always restore the original picture with one click.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(g)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
              activeGroup === g
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {slots.map((def) => {
          const resolved = images[def.slot_key];
          const d = getDraft(def.slot_key);
          const hasDraftChanges = Boolean(drafts[def.slot_key]);

          return (
            <div key={def.slot_key} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold">{def.label}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{def.helper}</p>
                </div>
                {resolved?.is_custom && (
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
                    Customised
                  </span>
                )}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={d.url}
                  alt={d.alt}
                  className={cn(
                    "h-44 w-full",
                    def.is_logo ? "bg-white object-contain p-4" : `object-cover ${focalPointClass(d.fp)}`,
                  )}
                />
              </div>

              <div className="mt-4 space-y-3">
                <PhotoUploadButton
                  folder="site"
                  label="Upload replacement photo"
                  preservePng={Boolean(def.is_logo)}
                  maxWidth={def.is_logo ? 800 : 1600}
                  onUploaded={(url) => patchDraft(def.slot_key, { url })}
                />

                {!def.is_logo && (
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">
                      Photo framing (which part to keep in view)
                    </span>
                    <select
                      value={d.fp}
                      onChange={(e) => patchDraft(def.slot_key, { fp: e.target.value as FocalPoint })}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                    >
                      <option value="center">Middle (default)</option>
                      <option value="top">Top (great for people's faces)</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left side</option>
                      <option value="right">Right side</option>
                    </select>
                  </label>
                )}

                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">
                    Short photo title / description
                  </span>
                  <input
                    type="text"
                    value={d.alt}
                    onChange={(e) => patchDraft(def.slot_key, { alt: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>

                {def.default_caption !== "" && (
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">Caption shown below photo</span>
                    <textarea
                      rows={2}
                      value={d.caption}
                      onChange={(e) => patchDraft(def.slot_key, { caption: e.target.value })}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                {resolved?.is_custom ? (
                  <button
                    type="button"
                    disabled={busyKey === def.slot_key}
                    onClick={() => handleReset(def.slot_key)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore original photo
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">Using original photo</span>
                )}

                <button
                  type="button"
                  disabled={busyKey === def.slot_key || !hasDraftChanges}
                  onClick={() => handleSave(def.slot_key)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-45"
                >
                  {busyKey === def.slot_key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Photo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

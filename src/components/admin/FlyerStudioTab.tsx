import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Save,
  CopyPlus,
  Printer,
  FileDown,
  ImageDown,
  RotateCcw,
  Trash2,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Image as ImageIcon,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteFlyerDocument,
  resetMasterFlyer,
  saveFlyerDocument,
  setLastOpenedFlyer,
} from "@/lib/admin.functions";
import type { SiteContentBundle } from "@/lib/cms-defaults";
import {
  FLYER_MASTER_ID,
  QR_PRESETS,
  createMasterFlyerTemplate,
  resolveFlyerForRender,
  type FlyerDocument,
  type FlyerFocal,
  type FlyerPaperMode,
  type FlyerPrintSides,
} from "@/lib/flyer-types";
import {
  downloadFlyerPdf,
  downloadFlyerPng,
  printFlyerDirect,
  renderFlyerBackToCanvas,
  renderFlyerFrontToCanvas,
} from "@/lib/flyer-renderer";
import { PhotoUploadButton } from "@/components/admin/PhotoUploadButton";
import { cn } from "@/lib/utils";

interface FlyerStudioTabProps {
  flyers: FlyerDocument[];
  initialFlyerId: string;
  siteContent: SiteContentBundle;
  onRefresh: () => Promise<void>;
  onDirtyStateChange: (dirty: boolean, flyerName: string, saveHandler: () => Promise<boolean>) => void;
}

type EditorSection = "front" | "back" | "photos" | "hours";
type PreviewView = "front" | "back" | "both";
type PhotoSlotTarget = "mainPhoto" | "craftLeft" | "craftRight" | "exterior";

const LAST_FLYER_LS_KEY = "shed_last_opened_flyer_id";

export function FlyerStudioTab({
  flyers,
  initialFlyerId,
  siteContent,
  onRefresh,
  onDirtyStateChange,
}: FlyerStudioTabProps) {
  const saveFn = useServerFn(saveFlyerDocument);
  const deleteFn = useServerFn(deleteFlyerDocument);
  const resetMasterFn = useServerFn(resetMasterFlyer);
  const setLastFn = useServerFn(setLastOpenedFlyer);

  // Pick initial flyer: prefer server-remembered lastFlyerId, fallback to localStorage, then master
  const startFlyer = useMemo(() => {
    const byServer = flyers.find((f) => f.id === initialFlyerId);
    if (byServer) return byServer;
    try {
      const ls = typeof window !== "undefined" ? localStorage.getItem(LAST_FLYER_LS_KEY) : null;
      const byLs = ls ? flyers.find((f) => f.id === ls) : undefined;
      if (byLs) return byLs;
    } catch {
      // ignore
    }
    return flyers[0] ?? createMasterFlyerTemplate();
  }, [flyers, initialFlyerId]);

  const [activeId, setActiveId] = useState<string>(startFlyer.id);
  const [draft, setDraft] = useState<FlyerDocument>(() => structuredClone(startFlyer));
  const [savedBaseline, setSavedBaseline] = useState<string>(() => JSON.stringify(startFlyer));

  const [section, setSection] = useState<EditorSection>("front");
  const [previewView, setPreviewView] = useState<PreviewView>("front");
  const [printSides, setPrintSides] = useState<FlyerPrintSides>("both");
  const [paperMode, setPaperMode] = useState<FlyerPaperMode>("a5");

  const [saving, setSaving] = useState(false);
  const [exportBusy, setExportBusy] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  // Modals
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyName, setCopyName] = useState("");
  const [photoPickerSlot, setPhotoPickerSlot] = useState<PhotoSlotTarget | null>(null);
  const [pendingSwitchId, setPendingSwitchId] = useState<string | null>(null);

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDirty = useMemo(() => JSON.stringify(draft) !== savedBaseline, [draft, savedBaseline]);

  // Keep local draft synchronized if server refreshes the same clean flyer
  useEffect(() => {
    const latest = flyers.find((f) => f.id === activeId);
    if (latest && !isDirty) {
      const serialized = JSON.stringify(latest);
      if (serialized !== savedBaseline) {
        setDraft(structuredClone(latest));
        setSavedBaseline(serialized);
      }
    }
  }, [flyers, activeId, isDirty, savedBaseline]);

  const resolvedData = useMemo(() => resolveFlyerForRender(draft, siteContent), [draft, siteContent]);

  // Render live canvas previews cleanly with light debounce
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setRendering(true);
      try {
        if ((previewView === "front" || previewView === "both") && frontCanvasRef.current) {
          await renderFlyerFrontToCanvas(frontCanvasRef.current, resolvedData, 0.5);
        }
        if ((previewView === "back" || previewView === "both") && backCanvasRef.current) {
          await renderFlyerBackToCanvas(backCanvasRef.current, resolvedData, 0.5);
        }
      } catch (err) {
        console.warn("[Flyer preview] render warning:", err);
      } finally {
        if (!cancelled) setRendering(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [resolvedData, previewView]);

  const performSave = useCallback(async (): Promise<boolean> => {
    if (!draft.name.trim()) {
      toast.error("Please give your flyer a name before saving.");
      return false;
    }
    setSaving(true);
    try {
      const res = await saveFn({
        data: {
          id: draft.id,
          name: draft.name.trim(),
          isMaster: draft.isMaster,
          syncFromWebsite: draft.syncFromWebsite,
          front: draft.front,
          back: draft.back,
        },
      });
      setDraft(structuredClone(res.flyer));
      setSavedBaseline(JSON.stringify(res.flyer));
      try {
        localStorage.setItem(LAST_FLYER_LS_KEY, res.flyer.id);
      } catch {
        // ignore
      }
      toast.success(`Saved "${res.flyer.name}"!`);
      await onRefresh();
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save flyer. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, saveFn, onRefresh]);

  // Report dirty state & save callback up to /admin for tab/sign-out/browser-close warnings
  useEffect(() => {
    onDirtyStateChange(isDirty, draft.name || "Untitled Flyer", performSave);
  }, [isDirty, draft.name, performSave, onDirtyStateChange]);

  // Clear dirty guard on unmount
  useEffect(() => {
    return () => {
      onDirtyStateChange(false, "", async () => true);
    };
  }, [onDirtyStateChange]);

  function loadFlyerNow(targetId: string) {
    const found = flyers.find((f) => f.id === targetId);
    if (!found) return;
    setActiveId(found.id);
    setDraft(structuredClone(found));
    setSavedBaseline(JSON.stringify(found));
    try {
      localStorage.setItem(LAST_FLYER_LS_KEY, found.id);
    } catch {
      // ignore
    }
    // Persist last-opened flyer on server so it loads automatically next time they log in
    setLastFn({ data: { id: found.id } }).catch(() => {});
  }

  function handleSelectFlyer(targetId: string) {
    if (targetId === activeId) return;
    if (isDirty) {
      setPendingSwitchId(targetId);
      return;
    }
    loadFlyerNow(targetId);
  }

  async function handleSaveAsCopy() {
    const cleanName = copyName.trim();
    if (!cleanName) {
      toast.error("Please type a name for your new copy.");
      return;
    }
    const newId = `flyer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    setSaving(true);
    try {
      const res = await saveFn({
        data: {
          id: newId,
          name: cleanName,
          isMaster: false,
          syncFromWebsite: draft.syncFromWebsite,
          front: draft.front,
          back: draft.back,
        },
      });
      setActiveId(res.flyer.id);
      setDraft(structuredClone(res.flyer));
      setSavedBaseline(JSON.stringify(res.flyer));
      try {
        localStorage.setItem(LAST_FLYER_LS_KEY, res.flyer.id);
      } catch {
        // ignore
      }
      setCopyModalOpen(false);
      setCopyName("");
      toast.success(`Created saved copy "${res.flyer.name}"!`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save copy.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetMaster() {
    if (
      !window.confirm(
        "Reset the Master Shed Flyer back to its original approved wording and photos? Any saved copies you made will NOT be affected.",
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await resetMasterFn();
      setActiveId(FLYER_MASTER_ID);
      setDraft(structuredClone(res.flyer));
      setSavedBaseline(JSON.stringify(res.flyer));
      toast.success("Master Shed Flyer restored to its original design!");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset master flyer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCopy() {
    if (draft.isMaster) return;
    if (!window.confirm(`Delete saved flyer "${draft.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteFn({ data: { id: draft.id } });
      toast.success(`Deleted "${draft.name}"`);
      const master = flyers.find((f) => f.id === FLYER_MASTER_ID) ?? createMasterFlyerTemplate();
      setActiveId(master.id);
      setDraft(structuredClone(master));
      setSavedBaseline(JSON.stringify(master));
      await setLastFn({ data: { id: master.id } }).catch(() => {});
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete flyer.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePrint() {
    setExportBusy("print");
    try {
      await printFlyerDirect(resolvedData, printSides, paperMode);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open print dialog.");
    } finally {
      setExportBusy(null);
    }
  }

  async function handleDownloadPdf() {
    setExportBusy("pdf");
    try {
      await downloadFlyerPdf(resolvedData, printSides, paperMode);
      toast.success("High-resolution 300 DPI PDF downloaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate PDF.");
    } finally {
      setExportBusy(null);
    }
  }

  async function handleDownloadPng() {
    setExportBusy("png");
    try {
      if (printSides === "both") {
        await downloadFlyerPng(resolvedData, "front");
        await downloadFlyerPng(resolvedData, "back");
        toast.success("Downloaded both Front & Back PNG images!");
      } else {
        await downloadFlyerPng(resolvedData, printSides);
        toast.success(`Downloaded ${printSides === "front" ? "Front" : "Back"} PNG image!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export PNG.");
    } finally {
      setExportBusy(null);
    }
  }

  function updateFront(patch: Partial<FlyerDocument["front"]>) {
    setDraft((prev) => ({ ...prev, front: { ...prev.front, ...patch } }));
  }

  function updateBack(patch: Partial<FlyerDocument["back"]>) {
    setDraft((prev) => ({ ...prev, back: { ...prev.back, ...patch } }));
  }

  function applyChosenPhoto(url: string) {
    if (!photoPickerSlot) return;
    if (photoPickerSlot === "mainPhoto") updateFront({ mainPhotoUrl: url });
    if (photoPickerSlot === "craftLeft") updateFront({ craftLeftUrl: url });
    if (photoPickerSlot === "craftRight") updateFront({ craftRightUrl: url });
    if (photoPickerSlot === "exterior") updateBack({ exteriorPhotoUrl: url });
    setPhotoPickerSlot(null);
  }

  // Curated pool of existing website + Made in the Shed photos for 1-click picking
  const existingPhotosPool = useMemo(() => {
    const out: Array<{ label: string; url: string; group: string }> = [];
    const seen = new Set<string>();
    for (const item of siteContent.galleryItems) {
      if (!seen.has(item.image_url)) {
        seen.add(item.image_url);
        out.push({ label: item.title, url: item.image_url, group: "Made in the Shed" });
      }
    }
    for (const img of Object.values(siteContent.images)) {
      if (img.slot_key === "site.logo" || img.slot_key.includes("Letter")) continue;
      if (!seen.has(img.image_url)) {
        seen.add(img.image_url);
        out.push({ label: img.label, url: img.image_url, group: "Workshop Photos" });
      }
    }
    return out;
  }, [siteContent]);

  return (
    <div className="space-y-6">
      {/* Header & Saved Flyers Bar */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Flyer Studio — Edit, Save Copies &amp; Print</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Edit wording or swap photos with a live preview. Save your own seasonal or event copies anytime — the
              original Master Flyer can never be deleted and can always be reset.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
                <AlertTriangle className="h-3.5 w-3.5" /> Unsaved changes
              </span>
            )}
            <button
              type="button"
              disabled={saving || !isDirty}
              onClick={performSave}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-soft transition disabled:opacity-45",
                isDirty
                  ? "bg-primary text-primary-foreground hover:brightness-110"
                  : "bg-secondary text-primary",
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setCopyName(`${draft.name.replace(/\s*\(Master Template\)$/i, "")} Copy`);
                setCopyModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-background px-4 py-2 text-sm font-bold text-primary hover:bg-secondary"
            >
              <CopyPlus className="h-4 w-4" /> Save as New Copy
            </button>
          </div>
        </div>

        {/* Saved Flyers Library Strip */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            Saved Flyers ({flyers.length}) — Automatically remembers the last flyer you worked on
          </p>
          <div className="flex flex-wrap gap-2">
            {flyers.map((f) => {
              const active = f.id === activeId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleSelectFlyer(f.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-background text-foreground hover:border-primary",
                  )}
                >
                  {f.isMaster && <ShieldCheck className="h-4 w-4 shrink-0" />}
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Flyer Name + Reset / Delete controls */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-background p-3.5">
          <label className="min-w-[240px] flex-1">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Flyer Name {draft.isMaster ? "(Protected Master Template)" : "(Saved Copy)"}
            </span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border-2 border-input bg-card px-3.5 py-2 text-sm font-bold focus:border-primary focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {draft.isMaster ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleResetMaster}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Master to Original
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={handleDeleteCopy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-destructive hover:border-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete This Copy
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Print & Download Control Bar */}
      <div className="rounded-3xl border-2 border-primary/25 bg-secondary/35 p-5 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              1. Which side(s) to print or download?
            </p>
            <div className="inline-flex flex-wrap rounded-xl border border-border bg-card p-1">
              {(
                [
                  ["both", "Both Sides (Double-Sided)"],
                  ["front", "Front Only"],
                  ["back", "Back Only"],
                ] as const
              ).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPrintSides(val)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold transition sm:text-sm",
                    printSides === val
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              2. Paper / Print Size
            </p>
            <select
              value={paperMode}
              onChange={(e) => setPaperMode(e.target.value as FlyerPaperMode)}
              className="w-full rounded-xl border-2 border-input bg-card px-3.5 py-2 text-sm font-bold focus:border-primary focus:outline-none"
            >
              <option value="a5">A5 Flyer (1 per page — best for Print Shops &amp; A5 paper)</option>
              <option value="a4-2up">2 Flyers per A4 Sheet (best for Home / Office A4 printers)</option>
              <option value="a4-poster">Full A4 Poster (enlarged for windows &amp; noticeboards)</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={exportBusy !== null}
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
            >
              {exportBusy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              Print
            </button>
            <button
              type="button"
              disabled={exportBusy !== null}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-extrabold text-accent-foreground shadow-soft hover:brightness-95 disabled:opacity-60"
            >
              {exportBusy === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Download PDF
            </button>
            <button
              type="button"
              disabled={exportBusy !== null}
              onClick={handleDownloadPng}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold hover:border-primary disabled:opacity-60"
            >
              {exportBusy === "png" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageDown className="h-4 w-4" />}
              PNG
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Live Preview (left) + Plain-English Editor (right) */}
      <div className="grid items-start gap-6 xl:grid-cols-[440px_1fr]">
        {/* Live Visual Preview Column */}
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft xl:sticky xl:top-24">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-xl border border-border bg-background p-1">
              {(
                [
                  ["front", "Front"],
                  ["back", "Back"],
                  ["both", "Both"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPreviewView(v)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-bold transition",
                    previewView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {rendering ? "Updating preview..." : "Live A5 Preview"}
            </span>
          </div>

          <div className={cn("grid gap-3", previewView === "both" ? "grid-cols-2" : "grid-cols-1")}>
            {(previewView === "front" || previewView === "both") && (
              <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-xs">
                <canvas ref={frontCanvasRef} className="block h-auto w-full" />
              </div>
            )}
            {(previewView === "back" || previewView === "both") && (
              <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-xs">
                <canvas ref={backCanvasRef} className="block h-auto w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Plain-English Editor Column */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["front", "Front Wording"],
                ["photos", "Photos & QR Code"],
                ["back", "Back Wording"],
                ["hours", "Opening Times & Fees"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSection(k);
                  if (k === "front") setPreviewView("front");
                  if (k === "back" || k === "hours") setPreviewView("back");
                }}
                className={cn(
                  "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
                  section === k
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* SECTION: FRONT WORDING */}
          {section === "front" && (
            <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Top Teal Badge</span>
                  <input
                    type="text"
                    value={draft.front.topPill1}
                    onChange={(e) => updateFront({ topPill1: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Top Gold Badge</span>
                  <input
                    type="text"
                    value={draft.front.topPill2}
                    onChange={(e) => updateFront({ topPill2: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Small Line Above Headline</span>
                <input
                  type="text"
                  value={draft.front.eyebrow}
                  onChange={(e) => updateFront({ eyebrow: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Big Headline — Line 1</span>
                  <input
                    type="text"
                    value={draft.front.headlineLine1}
                    onChange={(e) => updateFront({ headlineLine1: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-base font-extrabold focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">
                    Big Headline — Line 2 (Teal)
                  </span>
                  <input
                    type="text"
                    value={draft.front.headlineLine2}
                    onChange={(e) => updateFront({ headlineLine2: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-base font-extrabold text-primary focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Welcome Intro Paragraph</span>
                <textarea
                  rows={3}
                  value={draft.front.intro}
                  onChange={(e) => updateFront({ intro: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              <div className="space-y-3 rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Dark Teal Mental Health &amp; Wellbeing Box
                </p>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Gold Subheading</span>
                  <input
                    type="text"
                    value={draft.front.wellbeingEyebrow}
                    onChange={(e) => updateFront({ wellbeingEyebrow: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Box Heading</span>
                  <input
                    type="text"
                    value={draft.front.wellbeingHeading}
                    onChange={(e) => updateFront({ wellbeingHeading: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Paragraph 1</span>
                  <textarea
                    rows={3}
                    value={draft.front.wellbeingPara1}
                    onChange={(e) => updateFront({ wellbeingPara1: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-muted-foreground">Paragraph 2</span>
                  <textarea
                    rows={3}
                    value={draft.front.wellbeingPara2}
                    onChange={(e) => updateFront({ wellbeingPara2: e.target.value })}
                    className="w-full rounded-xl border-2 border-input bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    value={draft.front.pill1}
                    onChange={(e) => updateFront({ pill1: e.target.value })}
                    placeholder="Badge 1"
                    className="rounded-xl border-2 border-input bg-card px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={draft.front.pill2}
                    onChange={(e) => updateFront({ pill2: e.target.value })}
                    placeholder="Badge 2"
                    className="rounded-xl border-2 border-input bg-card px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={draft.front.pill3}
                    onChange={(e) => updateFront({ pill3: e.target.value })}
                    placeholder="Badge 3"
                    className="rounded-xl border-2 border-input bg-card px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Bottom Gold Strip Text</span>
                <input
                  type="text"
                  value={draft.front.footerBar}
                  onChange={(e) => updateFront({ footerBar: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none"
                />
              </label>
            </div>
          )}

          {/* SECTION: PHOTOS & QR CODE */}
          {section === "photos" && (
            <div className="space-y-4">
              {(
                [
                  {
                    slot: "mainPhoto" as PhotoSlotTarget,
                    title: "Front — Main Wide Workshop Photo",
                    url: draft.front.mainPhotoUrl,
                    caption: draft.front.mainPhotoCaption,
                    focal: draft.front.mainPhotoFocal,
                    onCaption: (v: string) => updateFront({ mainPhotoCaption: v }),
                    onFocal: (v: FlyerFocal) => updateFront({ mainPhotoFocal: v }),
                    onUpload: (u: string) => updateFront({ mainPhotoUrl: u }),
                    side: "front" as const,
                  },
                  {
                    slot: "craftLeft" as PhotoSlotTarget,
                    title: "Front — Left Craft Photo (default: Horse Head)",
                    url: draft.front.craftLeftUrl,
                    caption: draft.front.craftLeftCaption,
                    focal: draft.front.craftLeftFocal,
                    onCaption: (v: string) => updateFront({ craftLeftCaption: v }),
                    onFocal: (v: FlyerFocal) => updateFront({ craftLeftFocal: v }),
                    onUpload: (u: string) => updateFront({ craftLeftUrl: u }),
                    side: "front" as const,
                  },
                  {
                    slot: "craftRight" as PhotoSlotTarget,
                    title: "Front — Right Craft Photo (default: Woodland Owl)",
                    url: draft.front.craftRightUrl,
                    caption: draft.front.craftRightCaption,
                    focal: draft.front.craftRightFocal,
                    onCaption: (v: string) => updateFront({ craftRightCaption: v }),
                    onFocal: (v: FlyerFocal) => updateFront({ craftRightFocal: v }),
                    onUpload: (u: string) => updateFront({ craftRightUrl: u }),
                    side: "front" as const,
                  },
                  {
                    slot: "exterior" as PhotoSlotTarget,
                    title: "Back — Exterior Building Thumbnail",
                    url: draft.back.exteriorPhotoUrl,
                    caption: null,
                    focal: draft.back.exteriorPhotoFocal,
                    onCaption: null,
                    onFocal: (v: FlyerFocal) => updateBack({ exteriorPhotoFocal: v }),
                    onUpload: (u: string) => updateBack({ exteriorPhotoUrl: u }),
                    side: "back" as const,
                  },
                ] as const
              ).map((card) => (
                <div key={card.slot} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                    <img
                      src={card.url}
                      alt={card.title}
                      className="h-28 w-full rounded-xl border border-border object-cover"
                    />
                    <div className="space-y-2.5">
                      <p className="text-sm font-extrabold">{card.title}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewView(card.side);
                            setPhotoPickerSlot(card.slot);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <ImageIcon className="h-3.5 w-3.5" /> Pick from Shed Gallery
                        </button>
                        <PhotoUploadButton
                          folder="site"
                          label="Upload new photo"
                          onUploaded={(u) => {
                            setPreviewView(card.side);
                            card.onUpload(u);
                          }}
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-0.5 block text-[11px] font-bold text-muted-foreground">Framing focus</span>
                          <select
                            value={card.focal}
                            onChange={(e) => {
                              setPreviewView(card.side);
                              card.onFocal(e.target.value as FlyerFocal);
                            }}
                            className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold"
                          >
                            <option value="center">Middle</option>
                            <option value="upper">Upper (great for carvings)</option>
                            <option value="top">Top edge</option>
                            <option value="bottom">Bottom edge</option>
                            <option value="left">Left side</option>
                            <option value="right">Right side</option>
                          </select>
                        </label>

                        {card.onCaption && (
                          <label className="block">
                            <span className="mb-0.5 block text-[11px] font-bold text-muted-foreground">
                              Caption on photo
                            </span>
                            <input
                              type="text"
                              value={card.caption ?? ""}
                              onChange={(e) => {
                                setPreviewView(card.side);
                                card.onCaption(e.target.value);
                              }}
                              className="w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* QR Code Destination Card */}
              <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <p className="flex items-center gap-2 text-sm font-extrabold text-primary">
                  <QrCode className="h-4 w-4" /> QR Code Link (Back Side)
                </p>
                <p className="text-xs text-muted-foreground">
                  Choose where people go when they scan the flyer with their phone camera (defaults to your main
                  website):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QR_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => {
                        setPreviewView("back");
                        updateBack({ qrUrl: p.url, qrDisplayUrl: p.display });
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition",
                        draft.back.qrUrl === p.url
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">Full QR Web Address</span>
                    <input
                      type="url"
                      value={draft.back.qrUrl}
                      onChange={(e) => {
                        setPreviewView("back");
                        updateBack({ qrUrl: e.target.value });
                      }}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">
                      Website text printed below QR
                    </span>
                    <input
                      type="text"
                      value={draft.back.qrDisplayUrl}
                      onChange={(e) => {
                        setPreviewView("back");
                        updateBack({ qrDisplayUrl: e.target.value });
                      }}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">Badge above QR Code</span>
                    <input
                      type="text"
                      value={draft.back.qrPillText}
                      onChange={(e) => updateBack({ qrPillText: e.target.value })}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-xs font-bold focus:border-primary focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold text-muted-foreground">Helper line under QR Code</span>
                    <input
                      type="text"
                      value={draft.back.qrHelpText}
                      onChange={(e) => updateBack({ qrHelpText: e.target.value })}
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BACK WORDING */}
          {section === "back" && (
            <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Top Small Line</span>
                <input
                  type="text"
                  value={draft.back.eyebrow}
                  onChange={(e) => updateBack({ eyebrow: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-semibold focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Back Main Heading</span>
                <input
                  type="text"
                  value={draft.back.heading}
                  onChange={(e) => updateBack({ heading: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-base font-extrabold focus:border-primary focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Back Intro Paragraph</span>
                <textarea
                  rows={2}
                  value={draft.back.intro}
                  onChange={(e) => updateBack({ intro: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Parking &amp; Directions Note</span>
                <textarea
                  rows={2}
                  value={draft.back.parkingNote}
                  onChange={(e) => updateBack({ parkingNote: e.target.value })}
                  className="w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Left Box (Commissions)</p>
                  <input
                    type="text"
                    value={draft.back.commissionsTitle}
                    onChange={(e) => updateBack({ commissionsTitle: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={4}
                    value={draft.back.commissionsBody}
                    onChange={(e) => updateBack({ commissionsBody: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-primary">Right Box (Referrals)</p>
                  <input
                    type="text"
                    value={draft.back.referralsTitle}
                    onChange={(e) => updateBack({ referralsTitle: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={4}
                    value={draft.back.referralsBody}
                    onChange={(e) => updateBack({ referralsBody: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={draft.back.referralsFooter}
                    onChange={(e) => updateBack({ referralsFooter: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-2.5 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <label className="flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <span className="block text-sm font-extrabold">Show "Gratefully Supported By" 8-logo strip</span>
                    <span className="text-xs text-muted-foreground">
                      Pulls your active footer supporter logos automatically.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.back.showSupporters}
                    onChange={(e) => updateBack({ showSupporters: e.target.checked })}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
                {draft.back.showSupporters && (
                  <input
                    type="text"
                    value={draft.back.supportersHeading}
                    onChange={(e) => updateBack({ supportersHeading: e.target.value })}
                    className="mt-3 w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold"
                  />
                )}
              </div>
            </div>
          )}

          {/* SECTION: OPENING TIMES & FEES */}
          {section === "hours" && (
            <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-primary/30 bg-secondary/40 p-4">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-extrabold">
                    <Sparkles className="h-4 w-4 text-primary" /> Sync automatically with live Website settings
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    When ON, this flyer always uses your latest website Opening Times, Fees, Phone, Email &amp; Address.
                    Turn OFF to type one-off custom times (e.g. for an Open Day or Craft Sale).
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={draft.syncFromWebsite}
                  onClick={() => setDraft((prev) => ({ ...prev, syncFromWebsite: !prev.syncFromWebsite }))}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider transition",
                    draft.syncFromWebsite ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {draft.syncFromWebsite ? "Auto-Synced (ON)" : "Custom Flyer Info"}
                </button>
              </div>

              {draft.syncFromWebsite ? (
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Using live website details:{" "}
                  <strong>
                    {siteContent.settings.joining_fee} joining · {siteContent.settings.session_fee} per session ·{" "}
                    {siteContent.settings.phone} · {siteContent.settings.email}
                  </strong>
                  . To change normal Shed hours or fees everywhere, use the <strong>Opening Times</strong> or{" "}
                  <strong>Fees &amp; People</strong> tabs—or switch Auto-Sync OFF above to enter one-off details just
                  for this flyer.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
                      Custom Opening Times / Event Schedule
                    </p>
                    {draft.back.customHours.map((row, idx) => (
                      <div key={row.day} className="grid gap-2 sm:grid-cols-[110px_150px_1fr_auto] sm:items-center">
                        <span className="text-sm font-bold">{row.day}</span>
                        <input
                          type="text"
                          value={row.hours}
                          onChange={(e) => {
                            const next = draft.back.customHours.map((r, i) =>
                              i === idx ? { ...r, hours: e.target.value, isOpen: !/closed/i.test(e.target.value) } : r,
                            );
                            updateBack({ customHours: next });
                          }}
                          className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          value={row.note}
                          placeholder="Note (e.g. Open Day!)"
                          onChange={(e) => {
                            const next = draft.back.customHours.map((r, i) =>
                              i === idx ? { ...r, note: e.target.value } : r,
                            );
                            updateBack({ customHours: next });
                          }}
                          className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs"
                        />
                        <label className="flex items-center gap-1 text-xs font-bold">
                          <input
                            type="checkbox"
                            checked={row.isOpen}
                            onChange={(e) => {
                              const next = draft.back.customHours.map((r, i) =>
                                i === idx
                                  ? { ...r, isOpen: e.target.checked, hours: e.target.checked ? "10:00am – 4:00pm" : "CLOSED" }
                                  : r,
                              );
                              updateBack({ customHours: next });
                            }}
                          />
                          Open
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">Joining Fee (e.g. £10 or FREE)</span>
                      <input
                        type="text"
                        value={draft.back.joiningFee}
                        onChange={(e) => updateBack({ joiningFee: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">Session Fee (e.g. £3 or FREE)</span>
                      <input
                        type="text"
                        value={draft.back.sessionFee}
                        onChange={(e) => updateBack({ sessionFee: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">Telephone</span>
                      <input
                        type="text"
                        value={draft.back.phone}
                        onChange={(e) => updateBack({ phone: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs font-bold text-muted-foreground">Email</span>
                      <input
                        type="text"
                        value={draft.back.email}
                        onChange={(e) => updateBack({ email: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </div>
              )}

              <label className="block border-t border-border pt-4">
                <span className="mb-1 block text-xs font-bold text-muted-foreground">Fees Card Bottom Footnote</span>
                <input
                  type="text"
                  value={draft.back.feesFootnote}
                  onChange={(e) => updateBack({ feesFootnote: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Save As New Copy Modal */}
      {copyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h3 className="text-xl font-extrabold">Save as a New Flyer Copy</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Give this version a friendly name (for example, <em>"Summer Open Day 2026"</em> or{" "}
              <em>"GP Referral Flyer"</em>). Your original Master Flyer stays untouched.
            </p>
            <input
              type="text"
              autoFocus
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              placeholder="e.g. Christmas Craft Sale Flyer"
              className="mt-4 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base font-bold focus:border-primary focus:outline-none"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCopyModalOpen(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !copyName.trim()}
                onClick={handleSaveAsCopy}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save New Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal When Switching Between Saved Flyers */}
      {pendingSwitchId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold">Save changes before switching flyers?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have unsaved edits on <strong>{draft.name}</strong>. Click Save so you don't lose your work.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingSwitchId(null)}
                className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingSwitchId;
                  setPendingSwitchId(null);
                  loadFlyerNow(target);
                }}
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-sm font-bold text-destructive"
              >
                Discard Changes
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const target = pendingSwitchId;
                  const ok = await performSave();
                  if (ok) {
                    setPendingSwitchId(null);
                    loadFlyerNow(target);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save &amp; Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Shed Photo Picker Modal */}
      {photoPickerSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold">Choose a Photo from the Shed</h3>
                <p className="text-xs text-muted-foreground">Tap any photo below to drop it straight onto your flyer.</p>
              </div>
              <button
                type="button"
                onClick={() => setPhotoPickerSlot(null)}
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {existingPhotosPool.map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => applyChosenPhoto(p.url)}
                  className="group overflow-hidden rounded-xl border border-border bg-background text-left transition hover:border-primary"
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                  />
                  <span className="block truncate px-2 py-1.5 text-xs font-bold">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

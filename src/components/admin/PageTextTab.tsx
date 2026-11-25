import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_PAGE_CONTENT } from "@/lib/cms-defaults";
import { resetPageContent, upsertPageContent } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

interface PageTextTabProps {
  pageContent: Record<string, string>;
  customTextKeys: string[];
  onRefresh: () => Promise<void>;
}

const PAGE_GROUPS = Array.from(new Set(DEFAULT_PAGE_CONTENT.map((f) => f.page_group)));

export function PageTextTab({ pageContent, customTextKeys, onRefresh }: PageTextTabProps) {
  const saveFn = useServerFn(upsertPageContent);
  const resetFn = useServerFn(resetPageContent);

  const [activeGroup, setActiveGroup] = useState<string>(PAGE_GROUPS[0] ?? "Home Page");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const customSet = new Set(customTextKeys);
  const fields = DEFAULT_PAGE_CONTENT.filter((f) => f.page_group === activeGroup);

  async function handleSave(key: string) {
    const def = DEFAULT_PAGE_CONTENT.find((f) => f.content_key === key)!;
    const val = (drafts[key] ?? pageContent[key] ?? def.default_value).trim();
    if (!val) {
      toast.error("Please enter some text before saving.");
      return;
    }
    setBusyKey(key);
    try {
      await saveFn({
        data: {
          content_key: key,
          page_group: def.page_group,
          label: def.label,
          value_text: val,
        },
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success(`Saved "${def.label}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save text.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReset(key: string) {
    const def = DEFAULT_PAGE_CONTENT.find((f) => f.content_key === key)!;
    if (!window.confirm(`Restore "${def.label}" back to its original wording?`)) return;
    setBusyKey(key);
    try {
      await resetFn({ data: { content_key: key } });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success(`Restored original wording for "${def.label}"`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset text.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Website Wording &amp; Key Text</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a page below to update headings, welcome paragraphs, the parking warning, or charity information.
          Layout and colours stay locked so everything always looks neat.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PAGE_GROUPS.map((g) => (
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

      <div className="space-y-4">
        {fields.map((f) => {
          const savedVal = pageContent[f.content_key] ?? f.default_value;
          const val = drafts[f.content_key] ?? savedVal;
          const isDirty = drafts[f.content_key] !== undefined && drafts[f.content_key] !== savedVal;
          const isCustom = customSet.has(f.content_key);

          return (
            <div key={f.content_key} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold">{f.label}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.helper}</p>
                </div>
                {isCustom && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
                    Edited
                  </span>
                )}
              </div>

              <div className="mt-3">
                {f.multiline ? (
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [f.content_key]: e.target.value }))}
                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [f.content_key]: e.target.value }))}
                    className="w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 text-base font-semibold focus:border-primary focus:outline-none"
                  />
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {isCustom ? (
                  <button
                    type="button"
                    disabled={busyKey === f.content_key}
                    onClick={() => handleReset(f.content_key)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore original wording
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">Using original wording</span>
                )}

                <button
                  type="button"
                  disabled={busyKey === f.content_key || !isDirty}
                  onClick={() => handleSave(f.content_key)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-45"
                >
                  {busyKey === f.content_key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Text
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, Loader2, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_OPENING_HOURS,
  TIME_OPTIONS,
  type OpeningHourRow,
} from "@/lib/cms-defaults";
import { saveOpeningHours } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

interface OpeningHoursTabProps {
  initialHours: OpeningHourRow[];
  onRefresh: () => Promise<void>;
}

export function OpeningHoursTab({ initialHours, onRefresh }: OpeningHoursTabProps) {
  const saveFn = useServerFn(saveOpeningHours);
  const [rows, setRows] = useState<OpeningHourRow[]>(() =>
    initialHours.map((r) => ({ ...r })),
  );
  const [busy, setBusy] = useState(false);

  function updateRow(dayOrder: number, patch: Partial<OpeningHourRow>) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.day_order !== dayOrder) return row;
        const next = { ...row, ...patch };
        if (patch.open_time !== undefined || patch.close_time !== undefined || patch.is_open !== undefined) {
          next.hours_display = next.is_open ? `${next.open_time} – ${next.close_time}` : "Closed";
        }
        return next;
      }),
    );
  }

  async function handleSave() {
    setBusy(true);
    try {
      await saveFn({ data: rows });
      toast.success("Opening times saved! Updated on Home, Visit & Join, and the Footer.");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save opening times.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold">Weekly Session Opening Times</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Flip any day Open or Closed, pick the start and finish times, and add an optional session label. Saving
            here updates the Home page, Visit &amp; Join page, and Footer all at once.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRows(DEFAULT_OPENING_HOURS.map((r) => ({ ...r })))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground hover:border-primary hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Reset to defaults
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Opening Times
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.day_order}
            className={cn(
              "rounded-2xl border p-4 shadow-soft transition sm:p-5",
              row.is_open ? "border-border bg-card" : "border-border/70 bg-muted/40",
            )}
          >
            <div className="grid gap-4 lg:grid-cols-[180px_1fr_1fr] lg:items-center">
              <div className="flex items-center justify-between gap-3 lg:justify-start">
                <span className="w-28 text-lg font-extrabold">{row.day_name}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={row.is_open}
                  onClick={() => updateRow(row.day_order, { is_open: !row.is_open })}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider transition",
                    row.is_open
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      row.is_open ? "bg-accent" : "bg-muted-foreground/50",
                    )}
                  />
                  {row.is_open ? "Open" : "Closed"}
                </button>
              </div>

              {row.is_open ? (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`${row.day_name} opening time`}
                    value={row.open_time}
                    onChange={(e) => updateRow(row.day_order, { open_time: e.target.value })}
                    className="rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none"
                  >
                    {!TIME_OPTIONS.includes(row.open_time as (typeof TIME_OPTIONS)[number]) && (
                      <option value={row.open_time}>{row.open_time}</option>
                    )}
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-bold text-muted-foreground">to</span>
                  <select
                    aria-label={`${row.day_name} closing time`}
                    value={row.close_time}
                    onChange={(e) => updateRow(row.day_order, { close_time: e.target.value })}
                    className="rounded-xl border-2 border-input bg-background px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none"
                  >
                    {!TIME_OPTIONS.includes(row.close_time as (typeof TIME_OPTIONS)[number]) && (
                      <option value={row.close_time}>{row.close_time}</option>
                    )}
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-sm font-semibold text-muted-foreground">Closed all day</p>
              )}

              <div>
                <input
                  type="text"
                  value={row.note}
                  onChange={(e) => updateRow(row.day_order, { note: e.target.value })}
                  placeholder={row.is_open ? "Session note (e.g. Woodcarving Session)" : "Optional note (e.g. Hoping to open in future)"}
                  className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
          <Clock className="h-4 w-4" /> Preview — How visitors will see it on the website
        </p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((o) => (
            <div
              key={o.day_order}
              className={cn(
                "flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm last:border-0",
                !o.is_open && "text-muted-foreground",
              )}
            >
              <span className="font-bold">{o.day_name}</span>
              <span className="text-right">
                <span className="font-semibold">{o.hours_display}</span>
                {o.note && <span className="block text-xs text-primary">{o.note}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Save Opening Times
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, Loader2, Megaphone, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { AnnouncementData, AnnouncementVariant } from "@/lib/cms-defaults";
import { saveAnnouncement } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

interface NoticeBannerTabProps {
  initial: AnnouncementData;
  onRefresh: () => Promise<void>;
}

const STYLES: Array<{ value: AnnouncementVariant; title: string; previewClass: string; desc: string }> = [
  {
    value: "info",
    title: "Friendly Gold Notice",
    previewClass: "bg-accent text-accent-foreground",
    desc: "Great for general updates & reminders",
  },
  {
    value: "event",
    title: "Teal Event / Open Day",
    previewClass: "bg-primary text-primary-foreground",
    desc: "Great for Open Days, craft sales & news",
  },
  {
    value: "closure",
    title: "Closure / Urgent Alert",
    previewClass: "bg-destructive text-destructive-foreground",
    desc: "Great for Bank Holidays, snow days or Christmas closures",
  },
];

export function NoticeBannerTab({ initial, onRefresh }: NoticeBannerTabProps) {
  const saveFn = useServerFn(saveAnnouncement);

  const [enabled, setEnabled] = useState(initial.enabled);
  const [variant, setVariant] = useState<AnnouncementVariant>(initial.variant);
  const [message, setMessage] = useState(initial.message);
  const [linkLabel, setLinkLabel] = useState(initial.link_label);
  const [linkUrl, setLinkUrl] = useState(initial.link_url);
  const [expiresDate, setExpiresDate] = useState(() =>
    initial.expires_at ? initial.expires_at.slice(0, 10) : "",
  );
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (enabled && !message.trim()) {
      toast.error("Please type a short message before turning the banner on.");
      return;
    }
    setBusy(true);
    try {
      const expiresIso = expiresDate ? new Date(`${expiresDate}T23:59:59.000Z`).toISOString() : null;
      await saveFn({
        data: {
          enabled,
          variant,
          message: message.trim(),
          link_label: linkLabel.trim(),
          link_url: linkUrl.trim(),
          expires_at: expiresIso,
        },
      });
      toast.success(enabled ? "Notice banner is now live on the website!" : "Notice banner turned off.");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save notice banner.");
    } finally {
      setBusy(false);
    }
  }

  const activeStyle = STYLES.find((s) => s.value === variant) ?? STYLES[0]!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Top Notice &amp; Closure Banner</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Need to tell visitors about a Bank Holiday closure, Christmas break, or Saturday Open Day? Turn this banner
          on and it will appear right across the very top of every page.
        </p>
      </div>

      {/* Live Preview */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
          Live Preview
        </div>
        {enabled && message.trim() ? (
          <div className={cn("px-4 py-3 text-center text-sm font-bold", activeStyle.previewClass)}>
            <span className="inline-flex flex-wrap items-center justify-center gap-2">
              {variant === "closure" ? (
                <AlertTriangle className="h-4 w-4 shrink-0" />
              ) : variant === "event" ? (
                <Calendar className="h-4 w-4 shrink-0" />
              ) : (
                <Megaphone className="h-4 w-4 shrink-0" />
              )}
              <span>{message}</span>
              {linkLabel.trim() && linkUrl.trim() && (
                <span className="underline">{linkLabel} →</span>
              )}
            </span>
          </div>
        ) : (
          <div className="px-4 py-5 text-center text-sm text-muted-foreground">
            Banner is currently <strong>OFF</strong> (nothing shown at the top of the website).
          </div>
        )}
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-base font-extrabold">Show banner on website</p>
            <p className="text-xs text-muted-foreground">Switch on to display immediately, or off to hide it.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold uppercase tracking-wider transition",
              enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            <span className={cn("h-3 w-3 rounded-full", enabled ? "bg-accent" : "bg-muted-foreground/50")} />
            {enabled ? "Banner is ON" : "Banner is OFF"}
          </button>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold">Banner style</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setVariant(s.value)}
                className={cn(
                  "rounded-2xl border-2 p-3.5 text-left transition",
                  variant === s.value ? "border-primary bg-secondary/40" : "border-border bg-background hover:border-primary/50",
                )}
              >
                <span className={cn("inline-block rounded-full px-3 py-0.5 text-xs font-extrabold", s.previewClass)}>
                  {s.title}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold">Notice message</span>
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Closed for Bank Holiday Monday — normal sessions resume Tuesday 10am–4pm!"
            className="w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Optional link text</span>
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="e.g. See opening times"
              className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold">Optional link destination</span>
            <select
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm font-semibold focus:border-primary focus:outline-none"
            >
              <option value="">No link</option>
              <option value="/visit">Visit &amp; Join page (/visit)</option>
              <option value="/made-in-the-shed">Made in the Shed page (/made-in-the-shed)</option>
              <option value="/commissions">Commissions &amp; Repairs (/commissions)</option>
              <option value="/donate">Donate page (/donate)</option>
              <option value="/about">About &amp; Impact page (/about)</option>
            </select>
          </label>
        </div>

        <label className="block max-w-xs">
          <span className="mb-1 block text-sm font-bold">Automatically turn off after date (optional)</span>
          <input
            type="date"
            value={expiresDate}
            onChange={(e) => setExpiresDate(e.target.value)}
            className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Handy for holiday closures so you don't have to remember to switch it off!
          </span>
        </label>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Notice Banner
          </button>
        </div>
      </div>
    </div>
  );
}

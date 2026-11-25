import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, Trash2, Save, Loader2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { deleteEnquiry, updateEnquiry, type EnquiryRecord } from "@/lib/admin.functions";
import type { EnquiryStatus } from "@/lib/cms-defaults";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<EnquiryStatus, { label: string; badge: string }> = {
  new: { label: "New", badge: "bg-accent text-accent-foreground" },
  in_progress: { label: "In Progress", badge: "bg-secondary text-primary" },
  replied: { label: "Replied", badge: "bg-primary text-primary-foreground" },
  archived: { label: "Archived", badge: "bg-muted text-muted-foreground" },
};

interface EnquiriesTabProps {
  enquiries: EnquiryRecord[];
  onRefresh: () => Promise<void>;
}

export function EnquiriesTab({ enquiries, onRefresh }: EnquiriesTabProps) {
  const updateFn = useServerFn(updateEnquiry);
  const deleteFn = useServerFn(deleteEnquiry);

  const [filter, setFilter] = useState<EnquiryStatus | "all">("all");
  const [drafts, setDrafts] = useState<Record<string, { status: EnquiryStatus; notes: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  function getDraft(e: EnquiryRecord) {
    return drafts[e.id] ?? { status: e.status, notes: e.admin_notes };
  }

  async function handleSave(e: EnquiryRecord) {
    const d = getDraft(e);
    setBusyId(e.id);
    try {
      await updateFn({ data: { id: e.id, status: d.status, admin_notes: d.notes } });
      toast.success("Enquiry updated");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update enquiry");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(e: EnquiryRecord) {
    if (!window.confirm(`Delete enquiry from ${e.name}? This cannot be undone.`)) return;
    setBusyId(e.id);
    try {
      await deleteFn({ data: { id: e.id } });
      toast.success("Enquiry deleted");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete enquiry");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Enquiries Inbox</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages sent through the Commissions, Repairs &amp; Contact form on the website appear here. Click a
          person's email or phone number to reply directly.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "new", "in_progress", "replied", "archived"] as const).map((k) => {
          const count = k === "all" ? enquiries.length : enquiries.filter((e) => e.status === k).length;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
                filter === k
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary",
              )}
            >
              {k === "all" ? "All" : STATUS_LABELS[k].label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-soft">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-bold">No enquiries in this folder</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When visitors fill out the Commissions &amp; Repairs form, their messages will appear here right away.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const draft = getDraft(item);
            const dirty = draft.status !== item.status || draft.notes !== item.admin_notes;
            const dateStr = new Date(item.created_at).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-3 py-0.5 text-xs font-extrabold uppercase tracking-wide",
                          STATUS_LABELS[item.status].badge,
                        )}
                      >
                        {STATUS_LABELS[item.status].label}
                      </span>
                      <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary">
                        {item.enquiry_type}
                      </span>
                      <span className="text-xs text-muted-foreground">{dateStr}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-extrabold">{item.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-4 text-sm font-semibold">
                      <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                        <Mail className="h-4 w-4" /> {item.email}
                      </a>
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                          <Phone className="h-4 w-4" /> {item.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </div>

                <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-[200px_1fr_auto] md:items-end">
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </span>
                    <select
                      value={draft.status}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...draft, status: e.target.value as EnquiryStatus },
                        }))
                      }
                      className="w-full rounded-xl border-2 border-input bg-background px-3 py-2.5 text-sm font-bold focus:border-primary focus:outline-none"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="replied">Replied</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Private Committee Notes (only admins see this)
                    </span>
                    <input
                      type="text"
                      value={draft.notes}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [item.id]: { ...draft, notes: e.target.value },
                        }))
                      }
                      placeholder="e.g. Phoned back on Tuesday — Godfrey quoted £45"
                      className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busyId === item.id || !dirty}
                      onClick={() => handleSave(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-45"
                    >
                      {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => handleDelete(item)}
                      title="Delete enquiry"
                      className="inline-flex items-center justify-center rounded-xl border border-border bg-background p-2.5 text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

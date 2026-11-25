import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FriendData, SiteSettingsData, SupporterData, TrusteeData } from "@/lib/cms-defaults";
import { saveFriends, saveSiteSettings, saveSupporters, saveTrustees } from "@/lib/admin.functions";
import { PhotoUploadButton } from "@/components/admin/PhotoUploadButton";
import { cn } from "@/lib/utils";

interface ShedPeopleTabProps {
  settings: SiteSettingsData;
  trustees: TrusteeData[];
  supporters: SupporterData[];
  friends: FriendData[];
  onRefresh: () => Promise<void>;
}

type SubTab = "contact" | "trustees" | "supporters" | "friends";

export function ShedPeopleTab({ settings, trustees, supporters, friends, onRefresh }: ShedPeopleTabProps) {
  const saveSettingsFn = useServerFn(saveSiteSettings);
  const saveTrusteesFn = useServerFn(saveTrustees);
  const saveSupportersFn = useServerFn(saveSupporters);
  const saveFriendsFn = useServerFn(saveFriends);

  const [sub, setSub] = useState<SubTab>("contact");
  const [busy, setBusy] = useState(false);

  // Settings form state
  const [sForm, setSForm] = useState({
    joining_fee: settings.joining_fee,
    session_fee: settings.session_fee,
    session_fee_short: settings.session_fee_short,
    session_fee_note: settings.session_fee_note,
    phone: settings.phone,
    email: settings.email,
    sales_email: settings.sales_email,
    facebook_url: settings.facebook_url,
    donate_url: settings.donate_url,
    addressText: settings.address_lines.join("\n"),
  });

  // Lists state
  const [trusteeList, setTrusteeList] = useState(() => trustees.map((t) => ({ name: t.name, role: t.role })));
  const [supporterList, setSupporterList] = useState(() =>
    supporters.map((s) => ({
      name: s.name,
      logo_url: s.logo_url,
      description: s.description,
      show_in_footer: s.show_in_footer,
      show_on_about: s.show_on_about,
    })),
  );
  const [friendList, setFriendList] = useState(() =>
    friends.map((f) => ({ name: f.name, description: f.description })),
  );

  function moveRow<T>(list: T[], idx: number, dir: -1 | 1): T[] {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return list;
    const copy = [...list];
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item!);
    return copy;
  }

  async function handleSaveSettings() {
    const address_lines = sForm.addressText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (address_lines.length === 0) {
      toast.error("Please enter at least one address line.");
      return;
    }
    setBusy(true);
    try {
      await saveSettingsFn({
        data: {
          joining_fee: sForm.joining_fee,
          session_fee: sForm.session_fee,
          session_fee_short: sForm.session_fee_short,
          session_fee_note: sForm.session_fee_note,
          phone: sForm.phone,
          email: sForm.email,
          sales_email: sForm.sales_email,
          facebook_url: sForm.facebook_url,
          donate_url: sForm.donate_url,
          address_lines,
        },
      });
      toast.success("Fees & contact details updated across the website!");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings. Check email and web links.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTrustees() {
    const cleaned = trusteeList.filter((t) => t.name.trim() && t.role.trim());
    setBusy(true);
    try {
      await saveTrusteesFn({ data: cleaned });
      toast.success("Charity Trustees list updated!");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save Trustees.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveSupporters() {
    const cleaned = supporterList.filter((s) => s.name.trim() && s.logo_url.trim());
    setBusy(true);
    try {
      await saveSupportersFn({ data: cleaned });
      toast.success("Grant Funders & Supporter logos updated!");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save Supporters.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveFriends() {
    const cleaned = friendList.filter((f) => f.name.trim());
    setBusy(true);
    try {
      await saveFriendsFn({ data: cleaned });
      toast.success("'Friends of the Shed' updated!");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save Friends.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Fees, Contact Details, Trustees &amp; Supporters</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update session fees, contact details, Trustees after an AGM, or add new grant funders and logos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["contact", "Fees & Contact Details"],
            ["trustees", `Trustees (${trusteeList.length})`],
            ["supporters", `Grant Funders & Logos (${supporterList.length})`],
            ["friends", `Friends of the Shed (${friendList.length})`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setSub(k)}
            className={cn(
              "rounded-full border-2 px-4 py-1.5 text-sm font-bold transition",
              sub === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "contact" && (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-bold">One-off joining fee</span>
              <input
                type="text"
                value={sForm.joining_fee}
                onChange={(e) => setSForm({ ...sForm, joining_fee: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-base font-semibold focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Session contribution fee</span>
              <input
                type="text"
                value={sForm.session_fee}
                onChange={(e) => setSForm({ ...sForm, session_fee: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-base font-semibold focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Home page yellow card headline</span>
              <input
                type="text"
                value={sForm.session_fee_short}
                onChange={(e) => setSForm({ ...sForm, session_fee_short: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Home page yellow card subtext</span>
              <input
                type="text"
                value={sForm.session_fee_note}
                onChange={(e) => setSForm({ ...sForm, session_fee_note: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Telephone number</span>
              <input
                type="text"
                value={sForm.phone}
                onChange={(e) => setSForm({ ...sForm, phone: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Main email address</span>
              <input
                type="email"
                value={sForm.email}
                onChange={(e) => setSForm({ ...sForm, email: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Sales &amp; commissions email</span>
              <input
                type="email"
                value={sForm.sales_email}
                onChange={(e) => setSForm({ ...sForm, sales_email: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold">Facebook page link</span>
              <input
                type="url"
                value={sForm.facebook_url}
                onChange={(e) => setSForm({ ...sForm, facebook_url: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-bold">SumUp Online Donation link</span>
              <input
                type="url"
                value={sForm.donate_url}
                onChange={(e) => setSForm({ ...sForm, donate_url: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-bold">Workshop address (one line per row)</span>
              <textarea
                rows={4}
                value={sForm.addressText}
                onChange={(e) => setSForm({ ...sForm, addressText: e.target.value })}
                className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={handleSaveSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Fees &amp; Contact Details
            </button>
          </div>
        </div>
      )}

      {sub === "trustees" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-sm text-muted-foreground">
            Shown on both the <strong>About &amp; Impact</strong> page and the <strong>Policies</strong> page.
          </p>
          <div className="space-y-3">
            {trusteeList.map((t, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <input
                  type="text"
                  value={t.name}
                  placeholder="Trustee name"
                  onChange={(e) =>
                    setTrusteeList((prev) => prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
                  }
                  className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-bold"
                />
                <input
                  type="text"
                  value={t.role}
                  placeholder="Role (e.g. Chairman & Charity Trustee)"
                  onChange={(e) =>
                    setTrusteeList((prev) => prev.map((r, idx) => (idx === i ? { ...r, role: e.target.value } : r)))
                  }
                  className="rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setTrusteeList((prev) => moveRow(prev, i, -1))}
                    disabled={i === 0}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrusteeList((prev) => moveRow(prev, i, 1))}
                    disabled={i === trusteeList.length - 1}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrusteeList((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTrusteeList((prev) => [...prev, { name: "", role: "Charity Trustee" }])}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add Trustee
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSaveTrustees}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Trustees
            </button>
          </div>
        </div>
      )}

      {sub === "supporters" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Manage the grant funders &amp; logos shown in the global <strong>Gratefully Supported By</strong> footer
              bar and on the <strong>About &amp; Impact</strong> page.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setSupporterList((prev) => [
                    ...prev,
                    { name: "", logo_url: "", description: "", show_in_footer: true, show_on_about: true },
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add Supporter
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleSaveSupporters}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Supporters
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {supporterList.map((sup, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="grid gap-4 md:grid-cols-[150px_1fr]">
                  <div className="space-y-2">
                    <div className="flex h-24 w-full items-center justify-center rounded-xl border border-border bg-white p-2">
                      {sup.logo_url ? (
                        <img src={sup.logo_url} alt={sup.name} className="max-h-20 w-auto max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No logo yet</span>
                      )}
                    </div>
                    <PhotoUploadButton
                      folder="supporters"
                      label="Upload logo"
                      preservePng
                      maxWidth={600}
                      onUploaded={(url) =>
                        setSupporterList((prev) => prev.map((r, idx) => (idx === i ? { ...r, logo_url: url } : r)))
                      }
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={sup.name}
                        placeholder="Organisation name"
                        onChange={(e) =>
                          setSupporterList((prev) => prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
                        }
                        className="min-w-[220px] flex-1 rounded-xl border-2 border-input bg-background px-3.5 py-2 text-sm font-bold focus:border-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSupporterList((prev) => moveRow(prev, i, -1))}
                        disabled={i === 0}
                        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSupporterList((prev) => moveRow(prev, i, 1))}
                        disabled={i === supporterList.length - 1}
                        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSupporterList((prev) => prev.filter((_, idx) => idx !== i))}
                        className="rounded-lg border border-border p-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={sup.description}
                      placeholder="Short factual description of how they support the Shed (shown on About page)"
                      onChange={(e) =>
                        setSupporterList((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)),
                        )
                      }
                      className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                    />

                    <div className="flex flex-wrap gap-5 text-xs font-bold">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sup.show_in_footer}
                          onChange={(e) =>
                            setSupporterList((prev) =>
                              prev.map((r, idx) => (idx === i ? { ...r, show_in_footer: e.target.checked } : r)),
                            )
                          }
                          className="h-4 w-4 accent-primary"
                        />
                        Show logo in Footer strip on every page
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sup.show_on_about}
                          onChange={(e) =>
                            setSupporterList((prev) =>
                              prev.map((r, idx) => (idx === i ? { ...r, show_on_about: e.target.checked } : r)),
                            )
                          }
                          className="h-4 w-4 accent-primary"
                        />
                        Show detailed card on About &amp; Impact page
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === "friends" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-sm text-muted-foreground">
            Local community organisations shown in the <strong>'Friends' of the Shed</strong> section on the About page.
          </p>
          <div className="space-y-3">
            {friendList.map((f, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f.name}
                    placeholder="Organisation name"
                    onChange={(e) =>
                      setFriendList((prev) => prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
                    }
                    className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setFriendList((prev) => moveRow(prev, i, -1))}
                    disabled={i === 0}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFriendList((prev) => moveRow(prev, i, 1))}
                    disabled={i === friendList.length - 1}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFriendList((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={f.description}
                  placeholder="Short note about how they work with the Shed"
                  onChange={(e) =>
                    setFriendList((prev) =>
                      prev.map((r, idx) => (idx === i ? { ...r, description: e.target.value } : r)),
                    )
                  }
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFriendList((prev) => [...prev, { name: "", description: "" }])}
              className="inline-flex items-center gap-1.5 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add Community Friend
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSaveFriends}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Friends of the Shed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

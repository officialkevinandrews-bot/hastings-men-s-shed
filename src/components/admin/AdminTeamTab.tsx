import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, UserPlus, Trash2, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import {
  addAdminUser,
  removeAdminUser,
  updateAdminUser,
  type AdminUserRecord,
} from "@/lib/admin.functions";
import { cn } from "@/lib/utils";

interface AdminTeamTabProps {
  currentAdmin: AdminUserRecord;
  admins: AdminUserRecord[];
  onRefresh: () => Promise<void>;
}

export function AdminTeamTab({ currentAdmin, admins, onRefresh }: AdminTeamTabProps) {
  const addFn = useServerFn(addAdminUser);
  const updateFn = useServerFn(updateAdminUser);
  const removeFn = useServerFn(removeAdminUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setBusy(true);
    try {
      await addFn({ data: { display_name: name.trim(), email: email.trim().toLowerCase() } });
      setName("");
      setEmail("");
      toast.success(`Added ${name.trim()} to the authorised admin list!`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add admin.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive(target: AdminUserRecord) {
    setBusy(true);
    try {
      await updateFn({
        data: { id: target.id, display_name: target.display_name, is_active: !target.is_active },
      });
      toast.success(target.is_active ? `Paused access for ${target.display_name}` : `Restored access for ${target.display_name}`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update admin.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(target: AdminUserRecord) {
    if (!window.confirm(`Remove admin access for ${target.display_name} (${target.email})?`)) return;
    setBusy(true);
    try {
      await removeFn({ data: { id: target.id } });
      toast.success(`Removed ${target.email}`);
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove admin.");
    } finally {
      setBusy(false);
    }
  }

  if (currentAdmin.role !== "owner") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-xl font-extrabold">Owner Only</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the site owner can add or remove authorised Shed admins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Admin Access Allowlist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the email addresses listed below can ever sign in to this admin area. Nobody else can sign up or see
          any admin data.
        </p>
      </div>

      {/* Add Admin Form */}
      <form onSubmit={handleAdd} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="flex items-center gap-2 text-base font-extrabold">
          <UserPlus className="h-5 w-5 text-primary" /> Add an authorised committee admin
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Once you add their email here, tell them to scroll to the bottom of the website, click{" "}
          <strong>Committee</strong>, and either click <strong>Sign in with Google</strong> (if it's a Gmail address) or
          click <strong>First time here? Set up your admin password</strong>.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Their Name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Godfrey Bevan"
              className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Their Email Address
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border-2 border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Allow Email
          </button>
        </div>
      </form>

      {/* Current Admins List */}
      <div className="space-y-3">
        {admins.map((a) => {
          const isOwner = a.role === "owner";
          return (
            <div
              key={a.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-soft",
                a.is_active ? "border-border" : "border-dashed border-muted-foreground/40 opacity-75",
              )}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-extrabold">{a.display_name || a.email}</p>
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground">
                      <Crown className="h-3 w-3" /> Site Owner
                    </span>
                  ) : (
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                      Committee Admin
                    </span>
                  )}
                  {!a.is_active && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                      Access Paused
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{a.email}</p>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleToggleActive(a)}
                    className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold hover:border-primary"
                  >
                    {a.is_active ? "Pause Access" : "Restore Access"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRemove(a)}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-destructive hover:border-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

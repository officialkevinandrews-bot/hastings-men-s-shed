import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";
import { checkDomainDnsStatus, type AdminUserRecord } from "@/lib/admin.functions";
import {
  KUALO_ORIGIN_IP,
  LOVABLE_TARGET_IP,
  SHED_DOMAIN,
  buildKualoSupportTicket,
  type CheckLevel,
  type DomainDnsSnapshot,
  type EvaluatedDomainStatus,
} from "@/lib/domain-check";
import { cn } from "@/lib/utils";

interface DomainGoLiveTabProps {
  currentAdmin: AdminUserRecord;
}

const CHECKLIST_STORAGE_KEY = "shed_domain_golive_checklist_v1";

const LAUNCH_STEPS = [
  { id: "verify_code", label: "Got the lovable_verify=... code from Lovable (Settings → Domains → Connect Domain → Manual Setup)" },
  { id: "kualo_updated", label: "Updated the 3 DNS records in Kualo (either via Kualo Support ticket or cPanel Zone Editor)" },
  { id: "status_green", label: "Clicked 'Check Live Status Again' above and saw green ticks for Website, Email & Verification" },
  { id: "https_works", label: "Opened https://www.hastingsmenshed.org.uk and confirmed the new site & padlock icon appear" },
  { id: "email_works", label: "Sent a quick test email to info@hastingsmenshed.org.uk to confirm charity email still arrives" },
  { id: "admin_login", label: "Tested signing in at https://www.hastingsmenshed.org.uk/admin" },
  { id: "qr_tested", label: "Scanned the printed A5 flyer QR code with a phone camera to verify it opens the new site" },
  { id: "renew_checked", label: "Checked 123-Reg domain renewal is switched on before 20 December 2026" },
] as const;

function StatusBadge({ level }: { level: CheckLevel }) {
  if (level === "ok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-extrabold text-primary-foreground">
        <CheckCircle2 className="h-3.5 w-3.5" /> Good
      </span>
    );
  }
  if (level === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-0.5 text-xs font-extrabold text-destructive-foreground">
        <AlertTriangle className="h-3.5 w-3.5" /> Important
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground">
      <Clock className="h-3.5 w-3.5" /> Ready when you are
    </span>
  );
}

function CopyChip({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function doCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy automatically — please highlight and copy manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={doCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-primary transition hover:border-primary hover:bg-secondary"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied!" : label || value}</span>
    </button>
  );
}

export function DomainGoLiveTab({ currentAdmin }: DomainGoLiveTabProps) {
  const checkDnsFn = useServerFn(checkDomainDnsStatus);

  const [loading, setLoading] = useState(false);
  const [dnsResult, setDnsResult] = useState<{
    snapshot: DomainDnsSnapshot;
    status: EvaluatedDomainStatus;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [ticketCopied, setTicketCopied] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(CHECKLIST_STORAGE_KEY) : null;
      return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const runLiveCheck = useCallback(async () => {
    setLoading(true);
    try {
      const res = await checkDnsFn();
      setDnsResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not check live DNS right now.");
    } finally {
      setLoading(false);
    }
  }, [checkDnsFn]);

  useEffect(() => {
    if (currentAdmin.role === "owner") {
      runLiveCheck();
    }
  }, [currentAdmin.role, runLiveCheck]);

  function toggleChecklist(id: string) {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  async function copySupportTicket() {
    try {
      await navigator.clipboard.writeText(buildKualoSupportTicket(verifyCode));
      setTicketCopied(true);
      toast.success("Kualo Support message copied! Paste it into a Kualo support ticket or email.");
      setTimeout(() => setTicketCopied(false), 2500);
    } catch {
      toast.error("Could not copy automatically — please copy the message box below.");
    }
  }

  if (currentAdmin.role !== "owner") {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-xl font-extrabold">Site Owner Only</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the Site Owner can view domain connection settings.
        </p>
      </div>
    );
  }

  const ticketText = buildKualoSupportTicket(verifyCode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
            <Globe className="h-3.5 w-3.5" /> Owner-Only Transition Assistant
          </p>
          <h2 className="mt-1 text-2xl font-extrabold">Connect {SHED_DOMAIN}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Everything you need to safely switch <strong>{SHED_DOMAIN}</strong> from the old website to this new site
            without interrupting <strong>info@</strong> or <strong>sales@</strong> charity emails.
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={runLiveCheck}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110 disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          {loading ? "Checking live DNS..." : "Check Live Status Again"}
        </button>
      </div>

      {/* Who Holds What Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
            1. Where DNS &amp; Email Live (Make Changes Here)
          </p>
          <h3 className="mt-1 text-lg font-extrabold">Kualo UK (cPanel)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your domain's active nameservers point to <strong>Kualo</strong> (<code>ns1–ns4.kualo.net</code>). Kualo
            hosts the old website (<code>{KUALO_ORIGIN_IP}</code>) and the Shed's email (<code>filteredmx.net</code>).
          </p>
          <a
            href="https://my.kualo.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline"
          >
            Open Kualo Login (my.kualo.com) <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" /> 2. Domain Ownership (Do NOT Touch Nameservers)
          </p>
          <h3 className="mt-1 text-lg font-extrabold">123-Reg (Renewal Only)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Registered at <strong>123-Reg</strong> — current expiry is <strong>20 December 2026</strong>. You do{" "}
            <strong>not</strong> need to change anything at 123-Reg for the switchover (just make sure renewal stays
            active!).
          </p>
          <a
            href="https://www.123-reg.co.uk/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline"
          >
            Open 123-Reg <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Live DNS Health Check Cards */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold">Live Domain &amp; Email Safety Status</h3>
          {dnsResult && (
            <span className="text-xs text-muted-foreground">
              Last checked:{" "}
              {new Date(dnsResult.snapshot.checkedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>

        {!dnsResult ? (
          <p className="mt-4 text-sm text-muted-foreground">Checking live DNS records for {SHED_DOMAIN}...</p>
        ) : (
          <div className="mt-4 space-y-3">
            {Object.entries(dnsResult.status.checks).map(([key, item]) => (
              <div
                key={key}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4",
                  item.level === "ok"
                    ? "border-primary/25 bg-secondary/35"
                    : item.level === "warning"
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-border bg-background",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <StatusBadge level={item.level} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 1: Get Verification Code from Lovable */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
          Step 1
        </span>
        <h3 className="mt-2 text-xl font-extrabold">Get your verification code in Lovable</h3>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            Open your project in <strong>Lovable</strong> and go to <strong>Settings → Domains</strong> (or click{" "}
            <strong>Publish → Custom Domain</strong>).
          </li>
          <li>
            Click <strong>Connect Domain</strong>, type <code>{SHED_DOMAIN}</code>, and choose{" "}
            <strong>"Go to our manual setup"</strong> at the bottom of the popup.
          </li>
          <li>
            Lovable will show a TXT verification value starting with <code>lovable_verify=...</code>. Paste it in the
            box below so we can build your exact Kualo instructions automatically:
          </li>
        </ol>

        <label className="mt-4 block max-w-xl">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Paste Lovable TXT verification value here
          </span>
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="lovable_verify=xxxxxxxxxxxxxxxx"
            className="w-full rounded-xl border-2 border-input bg-background px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
          />
        </label>
      </div>

      {/* Step 2: Two Easy Ways to Apply the DNS Change in Kualo */}
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
        <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
          Step 2
        </span>
        <h3 className="text-xl font-extrabold">Update 3 DNS records in Kualo (choose Option A or Option B)</h3>

        {/* Option A: Easiest — Copy & Send to Kualo Support */}
        <div className="rounded-2xl border-2 border-primary bg-secondary/35 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-foreground">
                Recommended &amp; Easiest
              </span>
              <h4 className="mt-1.5 flex items-center gap-2 text-lg font-extrabold">
                <Mail className="h-5 w-5 text-primary" /> Option A: Ask Kualo Support to do it for you
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Whoever holds the Shed's Kualo account logs into <strong>my.kualo.com</strong>, opens a Support Ticket,
                and pastes this exact message. Kualo's UK support team will safely apply all 3 records without touching
                email!
              </p>
            </div>
            <button
              type="button"
              onClick={copySupportTicket}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
            >
              {ticketCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {ticketCopied ? "Message Copied!" : "Copy Message for Kualo"}
            </button>
          </div>
          <pre className="mt-4 max-h-64 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {ticketText}
          </pre>
        </div>

        {/* Option B: Manual cPanel Zone Editor Table */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <h4 className="text-lg font-extrabold">Option B: Edit yourself in Kualo cPanel (takes 2 minutes)</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Log into <strong>my.kualo.com → cPanel → Zone Editor → Manage</strong> next to <code>{SHED_DOMAIN}</code>{" "}
            and apply these 3 changes <strong>in order</strong>:
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-extrabold text-destructive">
                1. FIRST (protects Outlook &amp; phone email): Pin mail.{SHED_DOMAIN} to Kualo
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Find the existing <code>mail.{SHED_DOMAIN}.</code> row (currently a CNAME) → click <strong>Edit</strong>{" "}
                → change Type to <strong>A</strong> and Record/Value to:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyChip value={`mail.${SHED_DOMAIN}`} label={`Name: mail.${SHED_DOMAIN}`} />
                <CopyChip value={KUALO_ORIGIN_IP} label={`Value: ${KUALO_ORIGIN_IP}`} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-extrabold">2. Add Lovable's verification TXT record</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click <strong>+ Add Record → Add TXT Record</strong> and enter:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyChip value={`_lovable.${SHED_DOMAIN}`} label={`Name: _lovable.${SHED_DOMAIN}`} />
                <CopyChip
                  value={verifyCode.trim() || "lovable_verify=..."}
                  label={`Value: ${verifyCode.trim() || "paste Step 1 code above"}`}
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-extrabold text-primary">3. Switch the website to Lovable</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Find the existing <strong>A</strong> record for <code>{SHED_DOMAIN}.</code> (currently{" "}
                <code>{KUALO_ORIGIN_IP}</code>) → click <strong>Edit</strong> → change the IP address to:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CopyChip value={SHED_DOMAIN} label={`Name: ${SHED_DOMAIN}`} />
                <CopyChip value={LOVABLE_TARGET_IP} label={`Value: ${LOVABLE_TARGET_IP}`} />
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                Leave <code>www.{SHED_DOMAIN}.</code> (CNAME), all <code>MX</code> records, and the <code>v=spf1</code>{" "}
                TXT record untouched!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Interactive Launch Checklist */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground">
          Step 3
        </span>
        <h3 className="mt-2 text-xl font-extrabold">Go-Live Checklist</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          DNS updates usually take 5–30 minutes (occasionally up to a few hours). Tick off each item as you go:
        </p>

        <div className="mt-4 space-y-2.5">
          {LAUNCH_STEPS.map((step) => {
            const done = Boolean(checkedItems[step.id]);
            return (
              <label
                key={step.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition",
                  done ? "border-primary/40 bg-secondary/40 text-muted-foreground line-through" : "border-border bg-background",
                )}
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggleChecklist(step.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                />
                <span className="font-semibold">{step.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

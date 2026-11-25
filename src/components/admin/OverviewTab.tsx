import {
  Clock,
  Image as ImageIcon,
  Inbox,
  Megaphone,
  Images,
  FileText,
  Users,
  ShieldCheck,
  Globe,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import type { AdminDashboardPayload } from "@/lib/admin.functions";

export type AdminTabKey =
  | "overview"
  | "enquiries"
  | "gallery"
  | "images"
  | "hours"
  | "notice"
  | "text"
  | "people"
  | "admins"
  | "domain";

interface OverviewTabProps {
  data: AdminDashboardPayload;
  onSelectTab: (tab: AdminTabKey) => void;
}

export function OverviewTab({ data, onSelectTab }: OverviewTabProps) {
  const newEnquiries = data.enquiries.filter((e) => e.status === "new").length;
  const visiblePhotos = data.siteContent.galleryItems.filter((g) => g.is_visible).length;
  const activeAdmins = data.admins.filter((a) => a.is_active).length;
  const bannerActive =
    data.siteContent.announcement.enabled &&
    Boolean(data.siteContent.announcement.message.trim()) &&
    (!data.siteContent.announcement.expires_at ||
      new Date(data.siteContent.announcement.expires_at).getTime() > Date.now());

  const firstName = (data.currentAdmin.display_name || data.currentAdmin.email).split(" ")[0];

  const shortcuts: Array<{ tab: AdminTabKey; icon: typeof Clock; title: string; desc: string }> = [
    {
      tab: "gallery",
      icon: Images,
      title: "Add photos to 'Made in the Shed'",
      desc: "Upload new carvings or projects, edit titles, or add new categories.",
    },
    {
      tab: "hours",
      icon: Clock,
      title: "Change weekly opening times",
      desc: "Switch days open/closed and update session times across the whole site.",
    },
    {
      tab: "images",
      icon: ImageIcon,
      title: "Change website photos",
      desc: "Swap workshop pictures, homepage images, civic visit photos, or logo.",
    },
    {
      tab: "notice",
      icon: Megaphone,
      title: "Post a temporary notice or closure",
      desc: "Show a banner at the top for Bank Holidays, Christmas dates, or Open Days.",
    },
    {
      tab: "enquiries",
      icon: Inbox,
      title: "Check incoming enquiries",
      desc: "Read messages sent from the Commissions, Repairs & Contact form.",
    },
    {
      tab: "text",
      icon: FileText,
      title: "Edit page wording & parking note",
      desc: "Update welcome text, mission statements, and visitor instructions safely.",
    },
    {
      tab: "people",
      icon: Users,
      title: "Update fees, contacts, trustees & funders",
      desc: "Edit £3/£10 fees, phone, email, Trustees, Grant Funders, and Friends.",
    },
  ];

  if (data.currentAdmin.role === "owner") {
    shortcuts.push(
      {
        tab: "admins",
        icon: ShieldCheck,
        title: "Manage who can sign in",
        desc: "Add or remove authorised committee admins (Owner only).",
      },
      {
        tab: "domain",
        icon: Globe,
        title: "Connect hastingsmenshed.org.uk",
        desc: "Live DNS status checker, email safety check, and step-by-step Kualo guide (Owner only).",
      },
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
            Hastings &amp; St Leonards Men's Shed
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Welcome back, {firstName}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Everything you change here updates the live website automatically. Don't worry about breaking the layout or
            colours — those stay safely locked.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
        >
          View live website <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => onSelectTab("enquiries")}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Enquiries</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{newEnquiries}</p>
          <p className="mt-1 text-xs text-muted-foreground">{data.enquiries.length} total saved</p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("gallery")}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Made in the Shed</p>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{visiblePhotos}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            photos in {data.siteContent.galleryCategories.length} groups
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab("notice")}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Notice Banner</p>
          <p className="mt-2 text-2xl font-extrabold">{bannerActive ? "Showing live" : "Off"}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {bannerActive ? data.siteContent.announcement.message : "No temporary notice active"}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab(data.currentAdmin.role === "owner" ? "admins" : "hours")}
          className="rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Authorised Admins</p>
          <p className="mt-2 text-3xl font-extrabold text-foreground">{activeAdmins}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Signed in as {data.currentAdmin.role === "owner" ? "Site Owner" : "Committee Admin"}
          </p>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-extrabold">What would you like to update today?</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {shortcuts.map(({ tab, icon: Icon, title, desc }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary hover:bg-secondary/30"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2 text-base font-extrabold text-foreground">
                  <span>{title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

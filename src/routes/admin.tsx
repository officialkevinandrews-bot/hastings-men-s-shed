import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard,
  Inbox,
  Images,
  Image as ImageIcon,
  Clock,
  Megaphone,
  FileText,
  Printer,
  Users,
  ShieldCheck,
  Globe,
  LogOut,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminDashboardData,
  getAdminStatus,
  type AdminDashboardPayload,
} from "@/lib/admin.functions";
import { SITE_CONTENT_QUERY_KEY } from "@/lib/site-content";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { OverviewTab, type AdminTabKey } from "@/components/admin/OverviewTab";
import { EnquiriesTab } from "@/components/admin/EnquiriesTab";
import { GalleryTab } from "@/components/admin/GalleryTab";
import { SiteImagesTab } from "@/components/admin/SiteImagesTab";
import { OpeningHoursTab } from "@/components/admin/OpeningHoursTab";
import { NoticeBannerTab } from "@/components/admin/NoticeBannerTab";
import { PageTextTab } from "@/components/admin/PageTextTab";
import { FlyerStudioTab } from "@/components/admin/FlyerStudioTab";
import { ShedPeopleTab } from "@/components/admin/ShedPeopleTab";
import { AdminTeamTab } from "@/components/admin/AdminTeamTab";
import { DomainGoLiveTab } from "@/components/admin/DomainGoLiveTab";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Committee Admin | Hastings & St Leonards Men's Shed" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type PendingLeaveAction =
  | { type: "tab"; tab: AdminTabKey }
  | { type: "signout" }
  | null;

function AdminPage() {
  const queryClient = useQueryClient();
  const checkStatusFn = useServerFn(getAdminStatus);
  const loadDashboardFn = useServerFn(getAdminDashboardData);

  const [checking, setChecking] = useState(true);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardPayload | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabKey>("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Unsaved-changes guard (used by Flyer Studio when navigating away or closing tab)
  const [flyerDirty, setFlyerDirty] = useState(false);
  const [flyerDirtyName, setFlyerDirtyName] = useState("");
  const flyerSaveRef = useRef<() => Promise<boolean>>(async () => true);
  const [pendingLeave, setPendingLeave] = useState<PendingLeaveAction>(null);
  const [savingBeforeLeave, setSavingBeforeLeave] = useState(false);

  const handleFlyerDirtyChange = useCallback(
    (dirty: boolean, flyerName: string, saveHandler: () => Promise<boolean>) => {
      setFlyerDirty(dirty);
      setFlyerDirtyName(flyerName);
      flyerSaveRef.current = saveHandler;
    },
    [],
  );

  // Warn before browser refresh / tab close if flyer has unsaved changes
  useEffect(() => {
    if (!flyerDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [flyerDirty]);

  const verifyAndLoad = useCallback(async () => {
    setChecking(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        setDashboard(null);
        return;
      }

      const status = await checkStatusFn();
      if (!status.authorized) {
        const rejected = status.email || sessionData.session.user.email || "this account";
        await supabase.auth.signOut();
        setDeniedEmail(rejected);
        setDashboard(null);
        return;
      }

      setDeniedEmail(null);
      const data = await loadDashboardFn();
      setDashboard(data);
    } catch (err) {
      console.error("[Admin] auth/load error:", err);
      await supabase.auth.signOut();
      setDashboard(null);
    } finally {
      setChecking(false);
    }
  }, [checkStatusFn, loadDashboardFn]);

  useEffect(() => {
    verifyAndLoad();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        verifyAndLoad();
      } else if (event === "SIGNED_OUT") {
        setDashboard(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [verifyAndLoad]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await loadDashboardFn();
      setDashboard(data);
      await queryClient.invalidateQueries({ queryKey: SITE_CONTENT_QUERY_KEY });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not refresh data.");
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardFn, queryClient]);

  async function doSignOutNow() {
    await supabase.auth.signOut();
    setDashboard(null);
    setDeniedEmail(null);
    setFlyerDirty(false);
    toast.success("Signed out safely");
  }

  function requestTabChange(nextTab: AdminTabKey) {
    if (nextTab === activeTab) return;
    if (activeTab === "flyer" && flyerDirty) {
      setPendingLeave({ type: "tab", tab: nextTab });
      return;
    }
    setActiveTab(nextTab);
  }

  function requestSignOut() {
    if (activeTab === "flyer" && flyerDirty) {
      setPendingLeave({ type: "signout" });
      return;
    }
    doSignOutNow();
  }

  async function executePendingLeave(saveFirst: boolean) {
    const action = pendingLeave;
    if (!action) return;
    if (saveFirst) {
      setSavingBeforeLeave(true);
      const ok = await flyerSaveRef.current();
      setSavingBeforeLeave(false);
      if (!ok) return;
    } else {
      setFlyerDirty(false);
    }
    setPendingLeave(null);
    if (action.type === "tab") {
      setActiveTab(action.tab);
    } else if (action.type === "signout") {
      await doSignOutNow();
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-wood/30 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">Checking Shed committee access...</p>
      </div>
    );
  }

  if (!dashboard) {
    return <AdminAuthGate deniedEmail={deniedEmail} onSignedIn={verifyAndLoad} />;
  }

  const unreadEnquiries = dashboard.enquiries.filter((e) => e.status === "new").length;
  const navItems: Array<{ key: AdminTabKey; label: string; icon: typeof LayoutDashboard; badge?: number | undefined }> = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "enquiries", label: "Enquiries", icon: Inbox, badge: unreadEnquiries > 0 ? unreadEnquiries : undefined },
    { key: "gallery", label: "Made in the Shed", icon: Images },
    { key: "images", label: "Website Photos", icon: ImageIcon },
    { key: "hours", label: "Opening Times", icon: Clock },
    { key: "notice", label: "Notice Banner", icon: Megaphone },
    { key: "text", label: "Website Text", icon: FileText },
    { key: "flyer", label: "Flyer Studio", icon: Printer },
    { key: "people", label: "Fees & People", icon: Users },
  ];

  if (dashboard.currentAdmin.role === "owner") {
    navItems.push(
      { key: "admins", label: "Admin Access", icon: ShieldCheck },
      { key: "domain", label: "Domain & Go-Live", icon: Globe },
    );
  }

  return (
    <div className="min-h-screen bg-wood/25">
      {/* Top Studio Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="stripe-bar h-1.5" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={dashboard.siteContent.images["site.logo"]?.image_url}
              alt="Hastings Men's Shed"
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-extrabold leading-tight sm:text-base">Shed Website Editor</p>
              <p className="text-xs text-muted-foreground">
                Signed in as <strong>{dashboard.currentAdmin.display_name || dashboard.currentAdmin.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={refreshing}
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-bold hover:border-primary"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Refresh
            </button>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-xs font-bold text-primary hover:brightness-95"
            >
              View Live Site <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={requestSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:py-8">
        {/* Sidebar Navigation */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Admin sections"
            className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {navItems.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                type="button"
                onClick={() => requestTabChange(key)}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition lg:w-full",
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card text-foreground hover:bg-secondary",
                )}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </span>
                {badge !== undefined && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-accent-foreground">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Active Tab Area */}
        <main className="min-w-0">
          {activeTab === "overview" && <OverviewTab data={dashboard} onSelectTab={requestTabChange} />}
          {activeTab === "enquiries" && (
            <EnquiriesTab enquiries={dashboard.enquiries} onRefresh={handleRefresh} />
          )}
          {activeTab === "gallery" && (
            <GalleryTab
              categories={dashboard.siteContent.galleryCategories}
              items={dashboard.siteContent.galleryItems}
              galleryFromDb={dashboard.siteContent.galleryFromDb}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "images" && (
            <SiteImagesTab images={dashboard.siteContent.images} onRefresh={handleRefresh} />
          )}
          {activeTab === "hours" && (
            <OpeningHoursTab
              key={JSON.stringify(dashboard.siteContent.openingHours)}
              initialHours={dashboard.siteContent.openingHours}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "notice" && (
            <NoticeBannerTab
              key={JSON.stringify(dashboard.siteContent.announcement)}
              initial={dashboard.siteContent.announcement}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "text" && (
            <PageTextTab
              pageContent={dashboard.siteContent.pageContent}
              customTextKeys={dashboard.siteContent.customTextKeys}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "flyer" && (
            <FlyerStudioTab
              flyers={dashboard.flyers}
              initialFlyerId={dashboard.lastFlyerId}
              siteContent={dashboard.siteContent}
              onRefresh={handleRefresh}
              onDirtyStateChange={handleFlyerDirtyChange}
            />
          )}
          {activeTab === "people" && (
            <ShedPeopleTab
              key={JSON.stringify([
                dashboard.siteContent.settings,
                dashboard.siteContent.trustees,
                dashboard.siteContent.supporters,
                dashboard.siteContent.friends,
              ])}
              settings={dashboard.siteContent.settings}
              trustees={dashboard.siteContent.trustees}
              supporters={dashboard.siteContent.supporters}
              friends={dashboard.siteContent.friends}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "admins" && (
            <AdminTeamTab
              currentAdmin={dashboard.currentAdmin}
              admins={dashboard.admins}
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "domain" && <DomainGoLiveTab currentAdmin={dashboard.currentAdmin} />}
        </main>
      </div>

      {/* Global Unsaved Flyer Changes Modal (with Built-In Save Button!) */}
      {pendingLeave && (
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
                <h3 className="text-lg font-extrabold">You have unsaved flyer changes</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Would you like to save your changes to <strong>{flyerDirtyName}</strong> before leaving the Flyer
                  Studio?
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={savingBeforeLeave}
                onClick={() => setPendingLeave(null)}
                className="rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold"
              >
                Keep Editing
              </button>
              <button
                type="button"
                disabled={savingBeforeLeave}
                onClick={() => executePendingLeave(false)}
                className="rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2 text-sm font-bold text-destructive"
              >
                Leave Without Saving
              </button>
              <button
                type="button"
                disabled={savingBeforeLeave}
                onClick={() => executePendingLeave(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft hover:brightness-110"
              >
                {savingBeforeLeave ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

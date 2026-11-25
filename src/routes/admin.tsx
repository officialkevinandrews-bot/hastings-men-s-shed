import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
  Users,
  ShieldCheck,
  Globe,
  LogOut,
  ExternalLink,
  Loader2,
  RefreshCw,
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

function AdminPage() {
  const queryClient = useQueryClient();
  const checkStatusFn = useServerFn(getAdminStatus);
  const loadDashboardFn = useServerFn(getAdminDashboardData);

  const [checking, setChecking] = useState(true);
  const [deniedEmail, setDeniedEmail] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardPayload | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTabKey>("overview");
  const [refreshing, setRefreshing] = useState(false);

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

  async function handleSignOut() {
    await supabase.auth.signOut();
    setDashboard(null);
    setDeniedEmail(null);
    toast.success("Signed out safely");
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
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:py-8">
        {/* Sidebar Navigation (horizontal scroll on mobile, sticky list on desktop) */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Admin sections"
            className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {navItems.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
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
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-extrabold",
                      activeTab === key
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent text-accent-foreground",
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Active Tab Area */}
        <main className="min-w-0">
          {activeTab === "overview" && <OverviewTab data={dashboard} onSelectTab={setActiveTab} />}
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
          {activeTab === "domain" && (
            <DomainGoLiveTab currentAdmin={dashboard.currentAdmin} />
          )}
        </main>
      </div>
    </div>
  );
}

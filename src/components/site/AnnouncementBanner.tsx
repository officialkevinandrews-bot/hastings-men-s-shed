import { Link } from "@tanstack/react-router";
import { AlertTriangle, Calendar, Megaphone } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function AnnouncementBanner() {
  const { announcement } = useSiteContent();

  if (!announcement.enabled || !announcement.message.trim()) return null;
  if (announcement.expires_at && new Date(announcement.expires_at).getTime() <= Date.now()) {
    return null;
  }

  const styleClass =
    announcement.variant === "closure"
      ? "bg-destructive text-destructive-foreground"
      : announcement.variant === "event"
        ? "bg-primary text-primary-foreground"
        : "bg-accent text-accent-foreground";

  const Icon =
    announcement.variant === "closure"
      ? AlertTriangle
      : announcement.variant === "event"
        ? Calendar
        : Megaphone;

  const isInternal = announcement.link_url.startsWith("/");

  return (
    <div className={cn("px-4 py-2.5 text-center text-sm font-bold", styleClass)} role="status">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{announcement.message}</span>
        {announcement.link_label && announcement.link_url && (
          isInternal ? (
            <Link to={announcement.link_url} className="underline underline-offset-2 hover:opacity-85">
              {announcement.link_label} →
            </Link>
          ) : (
            <a
              href={announcement.link_url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:opacity-85"
            >
              {announcement.link_label} →
            </a>
          )
        )}
      </div>
    </div>
  );
}

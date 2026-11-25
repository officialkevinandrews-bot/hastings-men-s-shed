import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Mail, HeartHandshake, Lock } from "lucide-react";
import { SITE } from "@/lib/site";
import { useSiteContent } from "@/lib/site-content";
import { FacebookIcon } from "@/components/site/FacebookIcon";

export function Footer() {
  const { settings, openingHours, supporters, pageContent } = useSiteContent();
  const footerSupporters = supporters.filter((s) => s.show_in_footer);

  return (
    <footer className="mt-24">
      {/* Global "Gratefully Supported by" Logo Strip shown on every page */}
      {footerSupporters.length > 0 && (
        <div className="border-t border-border bg-card py-12">
          <div className="mx-auto max-w-6xl px-4">
            <p className="text-center text-sm font-extrabold uppercase tracking-widest text-primary">
              Gratefully Supported By
            </p>
            <p className="mx-auto mt-1.5 max-w-2xl text-center text-sm text-muted-foreground">
              Our volunteer-run charity is made possible thanks to our grant funders and local community supporters
            </p>
            <div className="mt-7 grid grid-cols-2 items-center gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {footerSupporters.map((s) => (
                <div
                  key={s.id || s.name}
                  title={s.name}
                  className="flex h-24 items-center justify-center rounded-2xl border border-border bg-white p-3 shadow-soft transition hover:scale-[1.03]"
                >
                  <img
                    src={s.logo_url}
                    alt={s.name}
                    loading="lazy"
                    className="max-h-16 w-auto max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-primary text-primary-foreground">
        <div className="stripe-bar h-1.5" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-accent-foreground">
              <HeartHandshake className="h-3.5 w-3.5" /> Registered UK Charity No. {SITE.charityNumber}
            </p>
            <h2 className="mt-3 text-2xl font-bold">{SITE.name}</h2>
            <p className="mt-3 text-primary-foreground/85">{pageContent["footer.aboutSummary"]}</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-accent">Find &amp; contact us</h3>
            <p className="mt-3 flex gap-2">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-accent" />
              <span>{settings.address_lines.join(", ")}</span>
            </p>
            <a href={settings.phoneHref} className="mt-2.5 flex items-center gap-2 font-semibold hover:underline">
              <Phone className="h-4 w-4 text-accent" />
              {settings.phone}
            </a>
            <a href={settings.emailHref} className="mt-2 flex items-center gap-2 font-semibold hover:underline">
              <Mail className="h-4 w-4 text-accent" />
              {settings.email}
            </a>
            <p className="mt-3 text-xs text-primary-foreground/75">
              Commissions, repairs &amp; item sales enquiries:{" "}
              <a href={settings.emailHref} className="underline">
                {settings.email}
              </a>
            </p>
            <a
              href={settings.facebook_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-[#1565D8]"
            >
              <FacebookIcon className="h-4 w-4" /> Follow us on Facebook
            </a>
          </div>
          <div>
            <h3 className="text-lg font-bold text-accent">Weekly session times</h3>
            <ul className="mt-3 space-y-1 text-sm">
              {openingHours.map((o) => (
                <li key={o.day_name} className="flex justify-between gap-4 border-b border-primary-foreground/15 pb-1">
                  <span>{o.day_name}</span>
                  <span className="text-right text-primary-foreground/85">{o.hours_display}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-primary-foreground/75">
            <span>
              © {new Date().getFullYear()} {SITE.legalName} · Registered Charity No. {SITE.charityNumber} (England &amp;
              Wales)
            </span>
            <span className="flex flex-wrap items-center gap-4">
              <Link to="/about" className="hover:underline">Our Mission &amp; Impact</Link>
              <Link to="/policies" className="hover:underline">Constitution &amp; Policies</Link>
              <Link to="/donate" className="hover:underline">Donate</Link>
              <Link to="/commissions" className="hover:underline">Commissions &amp; Repairs</Link>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1 text-xs text-primary-foreground/55 transition hover:text-primary-foreground"
                title="Authorised committee login"
              >
                <Lock className="h-3 w-3" /> Committee
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

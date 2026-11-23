import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Heart, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg.asset.json";
import { SITE } from "@/lib/site";
import { FacebookIcon } from "@/components/site/FacebookIcon";

const NAV = [
  { to: "/about", label: "About & Our Impact" },
  { to: "/visit", label: "Visit & Join" },
  { to: "/made-in-the-shed", label: "Made in the Shed" },
  { to: "/commissions", label: "Commissions & Repairs" },
  { to: "/policies", label: "Policies" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="stripe-bar h-1.5" />
      <div className="border-b border-border/60 bg-secondary/70 px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>Registered UK Charity No. {SITE.charityNumber} (CIO) · Hastings &amp; St Leonards</span>
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="hidden md:inline">
              Open to Men &amp; Women 18+ ·{" "}
              <a href={SITE.emailHref} className="font-bold text-primary underline">{SITE.email}</a> ·{" "}
              <a href={SITE.phoneHref} className="font-bold text-primary hover:underline">{SITE.phone}</a>
            </span>
            <a
              href={SITE.facebookUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Follow Hastings & St Leonards Men's Shed on Facebook"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1877F2] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#1565D8]"
            >
              <FacebookIcon className="h-3 w-3" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="shrink-0" aria-label={`${SITE.name} home`}>
          <img src={logo.url} alt={SITE.name} className="h-11 w-auto sm:h-12 md:h-14" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-secondary-foreground xl:px-3 xl:text-[0.95rem]"
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/donate"
            className="ml-2 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition hover:brightness-95 xl:text-[0.95rem]"
          >
            <Heart className="h-4 w-4 shrink-0" /> Support Our Charity
          </Link>
          <a
            href={SITE.facebookUrl}
            target="_blank"
            rel="noreferrer"
            title="Follow us on Facebook"
            aria-label="Follow Hastings & St Leonards Men's Shed on Facebook"
            className="ml-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-xs transition hover:bg-[#1565D8]"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={SITE.facebookUrl}
            target="_blank"
            rel="noreferrer"
            title="Follow us on Facebook"
            aria-label="Follow Hastings & St Leonards Men's Shed on Facebook"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-xs transition hover:bg-[#1565D8]"
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <button className="rounded-md p-2" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border px-4 pb-4 lg:hidden" aria-label="Mobile">
          {[...NAV, { to: "/donate", label: "Support Our Charity (Donate)" } as const].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-secondary">
              {n.label}
            </Link>
          ))}
          <a
            href={SITE.facebookUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-2.5 text-base font-bold text-white transition hover:bg-[#1565D8]"
          >
            <FacebookIcon className="h-4 w-4" /> Follow us on Facebook
          </a>
        </nav>
      )}
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Heart, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.jpg.asset.json";
import { SITE } from "@/lib/site";

const NAV = [
  { to: "/about", label: "About & Our Impact" },
  { to: "/visit", label: "Visit & Join" },
  { to: "/made-in-the-shed", label: "Made in the Shed" },
  { to: "/commissions", label: "Commissions, Repairs & Sales" },
  { to: "/policies", label: "Governance & Policies" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="stripe-bar h-1.5" />
      <div className="border-b border-border/60 bg-secondary/70 px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Registered UK Charity No. {SITE.charityNumber} (CIO) · Combating loneliness &amp; social isolation in Hastings &amp; St Leonards
          </span>
          <span className="hidden sm:inline">
            Open to Men &amp; Women 18+ · <a href={SITE.emailHref} className="font-bold text-primary underline">{SITE.email}</a> · <a href={SITE.phoneHref} className="font-bold text-primary hover:underline">{SITE.phone}</a>
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="shrink-0" aria-label={`${SITE.name} home`}>
          <img src={logo.url} alt={SITE.name} className="h-12 w-auto md:h-14" />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-[0.95rem] font-semibold text-foreground/80 hover:bg-secondary hover:text-secondary-foreground" activeProps={{ className: "bg-secondary text-secondary-foreground" }}>
              {n.label}
            </Link>
          ))}
          <Link to="/donate" className="ml-2 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-bold text-accent-foreground hover:brightness-95">
            <Heart className="h-4 w-4" /> Support Our Charity
          </Link>
        </nav>
        <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-4 pb-4 lg:hidden" aria-label="Mobile">
          {[...NAV, { to: "/donate", label: "Support Our Charity (Donate)" } as const].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-secondary">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

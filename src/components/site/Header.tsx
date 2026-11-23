import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import logo from "@/assets/logo.jpg.asset.json";
import { SITE } from "@/lib/site";

const NAV = [
  { to: "/visit", label: "Visit & Join" },
  { to: "/about", label: "About & Impact" },
  { to: "/made-in-the-shed", label: "Made in the Shed" },
  { to: "/commissions", label: "Commissions" },
  { to: "/policies", label: "Policies" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="stripe-bar h-1.5" />
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
            <Heart className="h-4 w-4" /> Donate
          </Link>
        </nav>
        <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-4 pb-4 lg:hidden" aria-label="Mobile">
          {[...NAV, { to: "/donate", label: "Donate" } as const].map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-lg font-semibold hover:bg-secondary">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { Phone, MapPin } from "lucide-react";
import { SITE, OPENING } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="stripe-bar h-1.5" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-bold">{SITE.name}</h2>
          <p className="mt-3 text-primary-foreground/80">Practical craft, good company and a cuppa. A UK registered charity (CIO) helping people across Hastings & St Leonards feel less alone.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-accent">Find us</h3>
          <p className="mt-3 flex gap-2"><MapPin className="mt-1 h-4 w-4 shrink-0" /><span>{SITE.address.join(", ")}</span></p>
          <a href={SITE.phoneHref} className="mt-2 flex items-center gap-2 font-semibold hover:underline"><Phone className="h-4 w-4" />{SITE.phone}</a>
        </div>
        <div>
          <h3 className="text-lg font-bold text-accent">Opening times</h3>
          <ul className="mt-3 space-y-1 text-sm">
            {OPENING.map((o) => (
              <li key={o.day} className="flex justify-between gap-4 border-b border-primary-foreground/15 pb-1"><span>{o.day}</span><span className="text-primary-foreground/85">{o.hours}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3 px-4 py-5 text-sm text-primary-foreground/75">
          <span>© {new Date().getFullYear()} {SITE.name} · Registered Charity (CIO)</span>
          <span className="flex gap-4"><Link to="/policies" className="hover:underline">Constitution & policies</Link><Link to="/donate" className="hover:underline">Donate</Link><Link to="/commissions" className="hover:underline">Commissions</Link></span>
        </div>
      </div>
    </footer>
  );
}

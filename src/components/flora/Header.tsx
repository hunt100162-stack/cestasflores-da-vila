import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User as UserIcon, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "./cart";
import { SITE, openWhatsapp } from "@/config/site";
import { WhatsIcon } from "./WhatsIcon";

const links = [
  { href: "#inicio", label: "Início" },
  { href: "#flores", label: "Flores" },
  { href: "#buques", label: "Buquês" },
  { href: "#ocasioes", label: "Ocasiões" },
  { href: "#sobre", label: "Sobre Nós" },
  { href: "#contato", label: "Contato" },
];

export function Logo() {
  return (
    <a href="#inicio" className="leading-none">
      <span className="font-display text-2xl font-semibold text-sage-deep md:text-3xl">Cestas Flores da Vila</span>
      <span className="eyebrow block text-[0.6rem]">Flores · Cestas · Presentes</span>
    </a>
  );
}

export function Header() {
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all ${scrolled ? "bg-background/95 py-2 shadow-soft backdrop-blur" : "bg-background/60 py-4 backdrop-blur-sm"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-foreground/80 hover:text-primary">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative rounded-full p-2.5 text-sage-deep hover:bg-muted"
            aria-label={`Abrir carrinho (${count} itens)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-sage-deep">
                {count}
              </span>
            )}
          </button>
          <Link to={user ? "/conta" : "/auth"} className="rounded-full p-2.5 text-sage-deep hover:bg-muted" aria-label={user ? "Minha conta" : "Entrar"}>
            <UserIcon className="h-5 w-5" />
          </Link>
          <button onClick={() => openWhatsapp(SITE.defaultMessage)} className="btn btn-whatsapp hidden md:inline-flex">
            <WhatsIcon className="h-4 w-4" /> Pedir pelo WhatsApp
          </button>
          <button onClick={() => setMenu(!menu)} className="rounded-full p-2.5 lg:hidden" aria-label="Menu" aria-expanded={menu}>
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="mx-5 mt-3 rounded-2xl border bg-card p-4 shadow-soft lg:hidden" aria-label="Mobile">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-3 font-medium hover:bg-muted">
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setMenu(false); openWhatsapp(SITE.defaultMessage); }}
            className="btn btn-whatsapp mt-2 w-full"
          >
            <WhatsIcon className="h-4 w-4" /> Pedir pelo WhatsApp
          </button>
        </nav>
      )}
    </header>
  );
}

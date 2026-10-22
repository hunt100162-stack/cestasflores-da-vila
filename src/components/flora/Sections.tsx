import { useEffect, useState } from "react";
import { Clock, Gift, Heart, Instagram, MapPin, MessageCircle, Palette, Phone, Sparkles, X, LayoutGrid } from "lucide-react";
import hero from "@/assets/hero.jpg";
import sobre from "@/assets/sobre.jpg";
import { categories, gallery, occasions, type CategoryId } from "@/data/catalog";
import { SITE, openWhatsapp } from "@/config/site";
import { Logo } from "./Header";
import { WhatsIcon } from "./WhatsIcon";

function Title({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[92vh] items-end overflow-hidden pt-24 md:items-center">
      <img src={hero} alt="Buquê de rosas e peônias com eucalipto" width={1600} height={1104} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
      <div className="absolute inset-0 bg-hero-fade max-md:bg-background/55" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 md:pb-0">
        <div className="fade-up max-w-xl">
          <p className="eyebrow">Flores · Cestas · Presentes</p>
          <h1 className="mt-4 text-5xl leading-[1.02] text-sage-deep md:text-7xl">Flores e cestas que transformam momentos em lembranças inesquecíveis.</h1>
          <p className="mt-5 text-lg text-foreground/80">
            Surpreenda quem você ama com flores, cestas e presentes especiais, preparados para tornar cada ocasião única.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#buques" className="btn btn-primary">Ver nossas cestas</a>
            <a href="#flores" className="btn btn-outline">Conhecer produtos</a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sage-deep">
            {["Buquês para presentear", "Arranjos personalizados", "Flores para ocasiões especiais"].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Categories({ onPick }: { onPick: (id: CategoryId) => void }) {
  return (
    <section id="flores" className="bg-muted/60 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Title eyebrow="Categorias" title="Encontre a flor certa" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((c) => (
            <article key={c.id} className="group overflow-hidden rounded-2xl bg-card shadow-soft">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col items-start gap-3 p-4">
                <h3 className="text-xl leading-tight">{c.emoji} {c.name}</h3>
                <button onClick={() => onPick(c.id)} className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Ver opções →</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Occasions({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section id="ocasioes" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Title eyebrow="Ocasiões" title="Flores para cada ocasião" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {occasions.map((o) => (
            <article key={o.id} className="group relative overflow-hidden rounded-2xl">
              <img src={o.image} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-deep/90 via-sage-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="text-2xl leading-tight">{o.title}</h3>
                <p className="mt-1 text-sm opacity-90">{o.description}</p>
                <button onClick={() => onPick(o.id)} className="mt-3 rounded-full bg-background/90 px-4 py-2 text-xs font-semibold text-sage-deep hover:bg-background">
                  Ver sugestões
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const items = [
    { icon: Sparkles, t: "Arranjos especiais", d: "Combinações pensadas para cada ocasião." },
    { icon: Palette, t: "Personalização", d: "Possibilidade de escolher cores e estilos." },
    { icon: MessageCircle, t: "Atendimento próximo", d: "Contato fácil e direto pelo WhatsApp." },
    { icon: LayoutGrid, t: "Praticidade", d: "Catálogo organizado e pedidos simplificados." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <Title eyebrow="Diferenciais" title="Feito com carinho" sub="Exemplos editáveis — ajuste conforme os serviços confirmados pela floricultura." />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="rounded-2xl border bg-card p-6 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-sage-deep"><I className="h-6 w-6" /></span>
            <h3 className="mt-4 text-2xl">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Gallery() {
  const [idx, setIdx] = useState<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setIdx(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <section className="bg-muted/60 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Title eyebrow="Galeria" title="Inspirações florais" />
        <div className="mt-10 columns-2 gap-4 md:columns-4">
          {gallery.map((g, i) => (
            <button key={i} onClick={() => setIdx(i)} className="group mb-4 block w-full overflow-hidden rounded-2xl" aria-label={`Ampliar: ${g.alt}`}>
              <img src={g.src} alt={g.alt} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-90 ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`} />
            </button>
          ))}
        </div>
      </div>
      {idx !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-sage-deep/85 p-4 backdrop-blur" onClick={() => setIdx(null)} role="dialog" aria-modal="true">
          <button className="absolute right-4 top-4 rounded-full bg-background p-2" aria-label="Fechar"><X className="h-5 w-5" /></button>
          <img src={gallery[idx]?.src} alt={gallery[idx]?.alt ?? ""} className="fade-up max-h-[85vh] max-w-full rounded-2xl shadow-soft" />
        </div>
      )}
    </section>
  );
}

export function About() {
  return (
    <section id="sobre" className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2">
      <img src={sobre} alt="Florista montando um buquê" loading="lazy" width={1008} height={1200} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-soft" />
      <div>
        <p className="eyebrow">Sobre nós</p>
        <h2 className="mt-2 text-4xl leading-tight md:text-5xl">Cada flor tem uma história. A gente ajuda você a contar a sua.</h2>
        <p className="mt-5 text-foreground/80">
          Na Cestas Flores da Vila, acreditamos que flores são uma forma delicada de dizer o que as palavras às vezes não alcançam.
          Cada buquê é montado com atenção aos detalhes, pensando em quem vai recebê-lo e no momento que ele vai marcar.
        </p>
        <p className="mt-4 text-foreground/80">
          Do presente inesperado à celebração mais importante, estamos aqui para ajudar você a escolher as flores certas.
        </p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs text-secondary-foreground">
          <Heart className="h-3.5 w-3.5" /> Texto demonstrativo — totalmente editável.
        </p>
      </div>
    </section>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const mapsUrl = SITE.addressConfirmed ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}` : null;
  return (
    <section id="contato" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-7xl px-5">
        <Title eyebrow="Contato" title="Venha nos visitar" sub="Dados de demonstração — substitua pelas informações reais." />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 rounded-2xl bg-card p-6">
            <Info icon={MapPin} label="Endereço">{SITE.address}</Info>
            <Info icon={Phone} label="Telefone / WhatsApp">{SITE.phone}</Info>
            <Info icon={Clock} label="Horários">
              {SITE.hours.map((h) => <span key={h.days} className="block">{h.days}: {h.time}</span>)}
            </Info>
            <div className="flex flex-wrap gap-2 pt-2">
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Como chegar</a>
              ) : (
                <button disabled className="btn btn-primary" title="Disponível quando o endereço real for confirmado">Como chegar</button>
              )}
              {SITE.instagram ? (
                <a href={SITE.instagram} target="_blank" rel="noreferrer" className="btn btn-outline"><Instagram className="h-4 w-4" /> Instagram</a>
              ) : (
                <button disabled className="btn btn-outline" title="Instagram a definir"><Instagram className="h-4 w-4" /> Instagram</button>
              )}
            </div>
            {!SITE.addressConfirmed && <p className="text-xs text-muted-foreground">“Como chegar” e Instagram são ativados quando os dados reais forem inseridos.</p>}
          </div>
          <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-sage bg-muted">
            <div className="text-center">
              <MapPin className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-3 font-display text-2xl">Mapa ilustrativo</p>
              <p className="mt-1 px-6 text-sm text-muted-foreground">Espaço reservado para o mapa incorporado com o endereço real.</p>
            </div>
          </div>
          <form
            className="space-y-3 rounded-2xl bg-card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              openWhatsapp(`Olá! Meu nome é ${f.get("nome")}. Tenho uma dúvida: ${f.get("msg")}`);
              setSent(true);
            }}
          >
            <h3 className="text-2xl">Tire suas dúvidas</h3>
            <input name="nome" required className="field" placeholder="Seu nome" aria-label="Seu nome" />
            <textarea name="msg" required className="field min-h-28" placeholder="Sua mensagem" aria-label="Sua mensagem" />
            <button className="btn btn-whatsapp w-full"><WhatsIcon className="h-4 w-4" /> Enviar pelo WhatsApp</button>
            {sent && <p className="text-xs text-muted-foreground">Sua mensagem foi preparada para envio no WhatsApp.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}

function Info({ icon: I, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <I className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
      <div><p className="text-sm font-semibold">{label}</p><p className="text-sm text-muted-foreground">{children}</p></div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-sage-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2 [&_span]:text-primary-foreground">
          <Logo />
          <p className="mt-4 max-w-sm text-sm opacity-80">Flores, cestas e presentes pensados para transformar momentos em lembranças.</p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => openWhatsapp(SITE.defaultMessage)} className="rounded-full border border-primary-foreground/30 p-2.5 hover:bg-primary-foreground/10" aria-label="WhatsApp"><WhatsIcon className="h-4 w-4" /></button>
            {SITE.instagram && <a href={SITE.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-primary-foreground/30 p-2.5 hover:bg-primary-foreground/10" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>}
            <a href="#buques" className="rounded-full border border-primary-foreground/30 p-2.5 hover:bg-primary-foreground/10" aria-label="Catálogo"><Gift className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <p className="eyebrow">Links</p>
          <ul className="mt-3 space-y-2 text-sm opacity-90">
            {[["#inicio", "Início"], ["#flores", "Flores"], ["#buques", "Buquês"], ["#ocasioes", "Ocasiões"], ["#sobre", "Sobre Nós"], ["#contato", "Contato"]].map(([h, l]) => (
              <li key={h}><a href={h} className="hover:underline">{l}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Contato</p>
          <p className="mt-3 text-sm opacity-90">{SITE.phone}</p>
          {SITE.hours.map((h) => <p key={h.days} className="text-sm opacity-90">{h.days}: {h.time}</p>)}
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-5 py-5 text-center text-xs opacity-75">
        Site de demonstração. Empresa, preços e informações são fictícios e ilustrativos.
      </div>
    </footer>
  );
}

export function FloatingWhats() {
  return (
    <button
      onClick={() => openWhatsapp(SITE.defaultMessage)}
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-soft transition hover:scale-105"
      aria-label="Conversar pelo WhatsApp"
    >
      <WhatsIcon className="h-7 w-7" />
    </button>
  );
}

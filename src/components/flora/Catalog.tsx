import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { categories, occasions, products, type CategoryId } from "@/data/catalog";
import { brl } from "@/lib/order";
import { useCart } from "./cart";
import { openWhatsapp } from "@/config/site";
import { WhatsIcon } from "./WhatsIcon";
import { toast } from "sonner";

export type Filter = { type: "all" } | { type: "cat"; id: CategoryId } | { type: "occ"; id: string };

export function Catalog({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  const { add, setOpen } = useCart();
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");

  const list = useMemo(() => {
    let l = products;
    if (filter.type === "cat") l = l.filter((p) => p.category === filter.id);
    if (filter.type === "occ") {
      const ids = occasions.find((o) => o.id === filter.id)?.productIds ?? [];
      l = l.filter((p) => ids.includes(p.id));
    }
    if (sort !== "none") l = [...l].sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
    return l;
  }, [filter, sort]);

  const occ = filter.type === "occ" ? occasions.find((o) => o.id === filter.id) : null;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`;

  return (
    <section id="buques" className="mx-auto max-w-7xl px-5 py-20">
      <div className="text-center">
        <p className="eyebrow">Catálogo</p>
        <h2 className="mt-2 text-4xl md:text-5xl">Nossa vitrine</h2>
        <p className="mt-3 text-sm text-muted-foreground">Preços ilustrativos para demonstração.</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button className={chip(filter.type === "all")} onClick={() => setFilter({ type: "all" })}>Todos</button>
          {categories.map((c) => (
            <button key={c.id} className={`${chip(filter.type === "cat" && filter.id === c.id)} shrink-0`} onClick={() => setFilter({ type: "cat", id: c.id })}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
        <select className="field md:w-56" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Ordenar por preço">
          <option value="none">Ordenar: destaque</option>
          <option value="asc">Menor preço</option>
          <option value="desc">Maior preço</option>
        </select>
      </div>

      {occ && (
        <p className="mt-4 text-sm">
          Sugestões para <strong>{occ.title}</strong> ·{" "}
          <button className="text-primary underline" onClick={() => setFilter({ type: "all" })}>ver todos</button>
        </p>
      )}

      {list.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Nenhum produto nesta categoria por enquanto.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-soft">
              <div className="aspect-square overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-3 md:p-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                  {categories.find((c) => c.id === p.category)?.name}
                </p>
                <h3 className="mt-1 text-lg leading-tight md:text-xl">{p.name}</h3>
                <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{p.description}</p>
                <p className="mt-2 font-semibold text-sage-deep">
                  {p.priceFrom && <span className="text-xs font-normal">A partir de </span>}{brl(p.price)}
                </p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    className="btn btn-primary flex-1 px-3 py-2 text-xs md:text-sm"
                    onClick={() => {
                      add(p);
                      toast.success(`${p.name} adicionado`, { action: { label: "Ver carrinho", onClick: () => setOpen(true) } });
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Adicionar ao carrinho</span><span className="sm:hidden">Adicionar</span>
                  </button>
                  <button
                    className="btn btn-whatsapp px-3 py-2"
                    aria-label={`Pedir ${p.name} pelo WhatsApp`}
                    onClick={() => openWhatsapp(`Olá! Tenho interesse no produto "${p.name}" (${p.priceFrom ? "a partir de " : ""}${brl(p.price)}). Pode me passar mais informações?`)}
                  >
                    <WhatsIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

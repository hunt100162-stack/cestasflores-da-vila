import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingBag, X } from "lucide-react";
import { categories, occasions, products as demoProducts, type CategoryId, type Product } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";
import { useImageUrls } from "@/lib/images";
import { brl } from "@/lib/order";
import { useCart } from "./cart";
import { openWhatsapp } from "@/config/site";
import { WhatsIcon } from "./WhatsIcon";
import { toast } from "sonner";

export type Filter = { type: "all" } | { type: "cat"; id: CategoryId } | { type: "occ"; id: string };

export function Catalog({ filter, setFilter }: { filter: Filter; setFilter: (f: Filter) => void }) {
  const { add, setOpen } = useCart();
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  // The storefront reads the same database records managed by the admin panel.
  const catalog = useQuery({
    queryKey: ["public-catalog"],
    queryFn: async (): Promise<Product[]> => {
      const [productResult, categoryResult, linkResult] = await Promise.all([
        supabase.from("products").select("id,slug,name,description,price,promo_price,price_from,images,stock,active,sort_order").eq("active", true).order("sort_order").order("created_at"),
        supabase.from("categories").select("id,slug,name,active").eq("active", true).order("sort_order"),
        supabase.from("product_categories").select("product_id,category_id"),
      ]);
      if (productResult.error) throw productResult.error;
      if (categoryResult.error) throw categoryResult.error;
      if (linkResult.error) throw linkResult.error;

      const categoryById = new Map(categoryResult.data.map((category) => [category.id, category.slug]));
      const linksByProduct = new Map<string, string[]>();
      for (const link of linkResult.data) {
        const current = linksByProduct.get(link.product_id) ?? [];
        current.push(link.category_id);
        linksByProduct.set(link.product_id, current);
      }

      return productResult.data.map((product) => {
        const categoryIds = linksByProduct.get(product.id) ?? [];
        const categoryId = categoryIds[0];
        const categorySlug = categoryId ? categoryById.get(categoryId) : undefined;
        const demo = demoProducts.find((item) => item.id === product.slug);
        return {
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          price: Number(product.promo_price ?? product.price),
          priceFrom: product.price_from,
          category: categorySlug ?? "buques",
          image: product.images[0] ?? demo?.image ?? demoProducts[0].image,
          stock: product.stock,
        };
      });
    },
    staleTime: 30_000,
  });
  const products = catalog.data ?? [];
  const imageFor = useImageUrls(products.map((p) => p.image));

  const list = useMemo(() => {
    let l = products;
    if (filter.type === "cat") l = l.filter((p) => p.category === filter.id);
    if (filter.type === "occ") {
      const ids = occasions.find((o) => o.id === filter.id)?.productIds ?? [];
      l = l.filter((p) => ids.includes(p.id) || ids.includes(demoProducts.find((d) => d.name === p.name)?.id ?? ""));
    }
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (term) l = l.filter((p) => `${p.name} ${p.description}`.toLocaleLowerCase("pt-BR").includes(term));
    if (sort !== "none") l = [...l].sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
    return l;
  }, [filter, sort, products, search]);

  const occ = filter.type === "occ" ? occasions.find((o) => o.id === filter.id) : null;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"}`;

  return (
    <section id="buques" className="mx-auto max-w-7xl px-5 py-20">
      <div className="text-center">
        <p className="eyebrow">Catálogo</p>
        <h2 className="mt-2 text-4xl md:text-5xl">Nossa vitrine</h2>
        <p className="mt-3 text-sm text-muted-foreground">Preços e disponibilidade conforme o cadastro da loja.</p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem] md:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="field pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar flores, cestas e presentes..." aria-label="Buscar produtos" />
        </label>
        <select className="field" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Ordenar por preço">
          <option value="none">Ordenar: destaque</option>
          <option value="asc">Menor preço</option>
          <option value="desc">Maior preço</option>
        </select>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          <button className={chip(filter.type === "all")} onClick={() => setFilter({ type: "all" })}>Todos</button>
          {categories.map((c) => (
            <button key={c.id} className={`${chip(filter.type === "cat" && filter.id === c.id)} shrink-0`} onClick={() => setFilter({ type: "cat", id: c.id })}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      {occ && (
        <p className="mt-4 text-sm">
          Sugestões para <strong>{occ.title}</strong> ·{" "}
          <button className="text-primary underline" onClick={() => setFilter({ type: "all" })}>ver todos</button>
        </p>
      )}

      {catalog.isLoading ? (
        <p className="py-16 text-center text-muted-foreground">Carregando produtos...</p>
      ) : catalog.isError ? (
        <p className="py-16 text-center text-muted-foreground">Não foi possível carregar o catálogo agora. Tente novamente em instantes.</p>
      ) : list.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Nenhum produto nesta categoria por enquanto.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition hover:shadow-soft">
              <div className="aspect-square overflow-hidden">
                <img src={imageFor(p.image) ?? demoProducts[0].image} alt={p.name} loading="lazy" width={816} height={816} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-3 md:p-5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                  {categories.find((c) => c.id === p.category)?.name ?? p.category}
                </p>
                <h3 className="mt-1 text-lg leading-tight md:text-xl">{p.name}</h3>
                <button className="mt-2 self-start text-sm font-semibold text-primary underline-offset-4 hover:underline" onClick={() => setSelected(p)}>Ver detalhes</button>
                <p className="mt-1 hidden text-sm text-muted-foreground sm:block">{p.description}</p>
                <p className="mt-2 font-semibold text-sage-deep">
                  {p.priceFrom && <span className="text-xs font-normal">A partir de </span>}{brl(p.price)}
                </p>
                <div className="mt-auto flex gap-2 pt-4">
                  <button
                    disabled={p.stock === 0}
                    className="btn btn-primary flex-1 px-3 py-2 text-xs md:text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      add(p);
                      toast.success(`${p.name} adicionado`, { action: { label: "Ver carrinho", onClick: () => setOpen(true) } });
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">{p.stock === 0 ? "Esgotado" : "Adicionar ao carrinho"}</span><span className="sm:hidden">{p.stock === 0 ? "Esgotado" : "Adicionar"}</span>
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
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-sage-deep/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selected.name}`} onClick={() => setSelected(null)}>
          <div className="relative grid max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background shadow-soft md:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2" onClick={() => setSelected(null)} aria-label="Fechar detalhes"><X className="h-5 w-5" /></button>
            <img src={imageFor(selected.image) ?? demoProducts[0].image} alt={selected.name} className="aspect-square h-full w-full object-cover" />
            <div className="flex flex-col p-6">
              <p className="eyebrow">{categories.find((category) => category.id === selected.category)?.name ?? selected.category}</p>
              <h3 className="mt-2 text-3xl">{selected.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{selected.description || "Consulte a loja para mais detalhes sobre este produto."}</p>
              <p className="mt-4 text-xl font-semibold text-sage-deep">{selected.priceFrom && <span className="text-sm font-normal">A partir de </span>}{brl(selected.price)}</p>
              <p className="mt-2 text-sm">{selected.stock === 0 ? "Produto esgotado no momento." : selected.stock != null ? `Disponibilidade: ${selected.stock} em estoque.` : "Consulte a disponibilidade com a loja."}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <button className="btn btn-primary flex-1" disabled={selected.stock === 0} onClick={() => { add(selected); toast.success(`${selected.name} adicionado`); setSelected(null); setOpen(true); }}>
                  <ShoppingBag className="h-4 w-4" /> Adicionar
                </button>
                <button className="btn btn-whatsapp" onClick={() => openWhatsapp(`Olá! Tenho interesse em "${selected.name}". Pode me passar mais informações?`)}>
                  <WhatsIcon className="h-4 w-4" /> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

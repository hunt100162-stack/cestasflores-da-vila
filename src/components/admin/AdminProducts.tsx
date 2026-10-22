import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET, useImageUrls, validateImage } from "@/lib/images";
import { brl } from "@/lib/order";

type Row = {
  id: string; name: string; slug: string; description: string | null; price: number; promo_price: number | null;
  images: string[]; stock: number; active: boolean; is_example: boolean; categoryIds: string[];
};

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function AdminProducts() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [avail, setAvail] = useState<"" | "on" | "off" | "out">("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const cats = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("sort_order")).data ?? [],
  });
  const prods = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("id,name,slug,description,price,promo_price,images,stock,active,is_example,product_categories(category_id)")
        .order("sort_order").order("created_at");
      if (error) throw error;
      return data.map(({ product_categories, ...p }) => ({
        ...p, price: Number(p.price), promo_price: p.promo_price == null ? null : Number(p.promo_price),
        categoryIds: product_categories.map((c) => c.category_id),
      })) as Row[];
    },
  });
  const img = useImageUrls((prods.data ?? []).map((p) => p.images[0] ?? ""));
  const catName = (id: string) => cats.data?.find((c) => c.id === id)?.name ?? "";

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (prods.data ?? []).filter((p) =>
      (!t || p.name.toLowerCase().includes(t)) &&
      (!cat || p.categoryIds.includes(cat)) &&
      (avail === "" || (avail === "on" && p.active) || (avail === "off" && !p.active) || (avail === "out" && p.stock === 0)));
  }, [prods.data, q, cat, avail]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); };

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: { active?: boolean; stock?: number } }) => {
      const { error } = await supabase.from("products").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Produto atualizado."); refresh(); },
    onError: (e: Error) => toast.error("Não foi possível salvar: " + e.message),
  });
  const del = useMutation({
    mutationFn: async (p: Row) => {
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;
      const files = p.images.filter((i) => !i.startsWith("demo:"));
      if (files.length) await supabase.storage.from(BUCKET).remove(files);
    },
    onSuccess: () => { toast.success("Produto excluído."); refresh(); },
    onError: (e: Error) => toast.error("Não foi possível excluir: " + e.message),
  });

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Produtos</h2>
        <button className="btn btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Novo produto</button>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-[1fr_14rem_12rem]">
        <input className="field" placeholder="Pesquisar por nome..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Pesquisar produtos" />
        <select className="field" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="field" value={avail} onChange={(e) => setAvail(e.target.value as typeof avail)} aria-label="Filtrar por disponibilidade">
          <option value="">Qualquer disponibilidade</option>
          <option value="on">Disponíveis</option>
          <option value="off">Esgotados / desativados</option>
          <option value="out">Estoque zerado</option>
        </select>
      </div>

      {prods.isLoading ? <p className="mt-6 text-muted-foreground">Carregando...</p> : list.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-2xl border bg-card">
          {list.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 md:flex-nowrap">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {img(p.images[0]) && <img src={img(p.images[0])} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.name} {p.is_example && <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[0.65rem] text-secondary-foreground">exemplo</span>}</p>
                <p className="text-xs text-muted-foreground">{p.categoryIds.map(catName).join(", ") || "Sem categoria"}</p>
                <p className="text-sm">
                  {p.promo_price != null ? <><s className="text-muted-foreground">{brl(p.price)}</s> {brl(p.promo_price)}</> : brl(p.price)}
                  {" · "}<span className={p.active ? "text-primary" : "text-destructive"}>{p.active ? "Disponível" : "Esgotado"}</span>
                </p>
              </div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Estoque
                <input type="number" min={0} defaultValue={p.stock} key={p.stock} className="field w-20 py-1"
                  aria-label={`Estoque de ${p.name}`}
                  onBlur={(e) => { const v = Math.max(0, Math.floor(Number(e.target.value))); if (v !== p.stock) patch.mutate({ id: p.id, values: { stock: v } }); }} />
              </label>
              <button className="btn btn-outline px-3 py-1.5 text-xs" onClick={() => patch.mutate({ id: p.id, values: { active: !p.active } })}>
                {p.active ? "Marcar esgotado" : "Reativar"}
              </button>
              <button className="rounded-full p-2 hover:bg-muted" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}><Pencil className="h-4 w-4" /></button>
              <button className="rounded-full p-2 text-destructive hover:bg-muted" aria-label={`Excluir ${p.name}`}
                onClick={() => { if (confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) del.mutate(p); }}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {editing && <ProductForm row={editing === "new" ? null : editing} cats={cats.data ?? []} onClose={() => setEditing(null)} onSaved={refresh} />}
    </section>
  );
}

function ProductForm({ row, cats, onClose, onSaved }: { row: Row | null; cats: { id: string; name: string }[]; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row?.name ?? "");
  const [description, setDescription] = useState(row?.description ?? "");
  const [price, setPrice] = useState(row ? String(row.price) : "");
  const [promo, setPromo] = useState(row?.promo_price != null ? String(row.promo_price) : "");
  const [stock, setStock] = useState(row ? String(row.stock) : "0");
  const [catIds, setCatIds] = useState<string[]>(row?.categoryIds ?? []);
  const [images, setImages] = useState<string[]>(row?.images ?? []);
  const [busy, setBusy] = useState(false);
  const img = useImageUrls(images);

  const upload = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      const err = validateImage(f);
      if (err) { toast.error(`${f.name}: ${err}`); continue; }
      const path = `${crypto.randomUUID()}.${f.name.split(".").pop()?.toLowerCase() ?? "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type });
      if (error) toast.error("Falha no envio: " + error.message);
      else setImages((i) => [...i, path]);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(price.replace(",", ".")), pr = promo.trim() ? Number(promo.replace(",", ".")) : null, s = Math.floor(Number(stock));
    if (!name.trim()) return toast.error("Informe o nome.");
    if (!(p >= 0)) return toast.error("Preço inválido.");
    if (pr != null && !(pr >= 0 && pr < p)) return toast.error("O preço promocional deve ser menor que o preço normal.");
    if (!(s >= 0)) return toast.error("Estoque inválido.");
    setBusy(true);
    const values = { name: name.trim(), description: description.trim() || null, price: p, promo_price: pr, stock: s, images, updated_at: new Date().toISOString() };
    let id = row?.id;
    if (row) {
      const { error } = await supabase.from("products").update(values).eq("id", row.id);
      if (error) { setBusy(false); return toast.error("Não foi possível salvar: " + error.message); }
    } else {
      const { data, error } = await supabase.from("products").insert({ ...values, slug: `${slugify(name)}-${Date.now().toString(36)}` }).select("id").single();
      if (error) { setBusy(false); return toast.error("Não foi possível criar: " + error.message); }
      id = data.id;
    }
    await supabase.from("product_categories").delete().eq("product_id", id!);
    if (catIds.length) {
      const { error } = await supabase.from("product_categories").insert(catIds.map((c) => ({ product_id: id!, category_id: c })));
      if (error) toast.error("Categorias não salvas: " + error.message);
    }
    setBusy(false);
    toast.success(row ? "Produto atualizado." : "Produto criado.");
    onSaved(); onClose();
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={row ? "Editar produto" : "Novo produto"}>
      <div className="absolute inset-0 bg-sage-deep/40 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={save} className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col gap-3 overflow-y-auto bg-background p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl">{row ? "Editar produto" : "Novo produto"}</h3>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-muted" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <label className="text-sm">Nome<input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label className="text-sm">Descrição<textarea className="field mt-1 min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="grid grid-cols-3 gap-2">
          <label className="text-sm">Preço (R$)<input className="field mt-1" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} required /></label>
          <label className="text-sm">Promoção<input className="field mt-1" inputMode="decimal" placeholder="opcional" value={promo} onChange={(e) => setPromo(e.target.value)} /></label>
          <label className="text-sm">Estoque<input className="field mt-1" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} /></label>
        </div>
        <fieldset className="text-sm">
          <legend>Categorias</legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {cats.map((c) => {
              const on = catIds.includes(c.id);
              return (
                <button type="button" key={c.id} onClick={() => setCatIds(on ? catIds.filter((x) => x !== c.id) : [...catIds, c.id])}
                  className={`rounded-full border px-3 py-1 ${on ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`} aria-pressed={on}>
                  {c.name}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="text-sm">
          Imagens
          <div className="mt-1 flex flex-wrap gap-2">
            {images.map((ref) => (
              <div key={ref} className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted">
                {img(ref) && <img src={img(ref)} alt="" className="h-full w-full object-cover" />}
                <button type="button" className="absolute right-1 top-1 rounded-full bg-background p-0.5" aria-label="Remover imagem"
                  onClick={() => setImages(images.filter((i) => i !== ref))}><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-2 text-xs" onChange={(e) => upload(e.target.files)} aria-label="Enviar imagens" />
          <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP, até 5 MB.</p>
        </div>
        <button className="btn btn-primary mt-auto" disabled={busy}>{busy ? "Salvando..." : "Salvar"}</button>
      </form>
    </div>
  );
}

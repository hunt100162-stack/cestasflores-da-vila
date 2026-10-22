import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel — Cestas Flores da Vila" }, { name: "description", content: "Painel administrativo da Cestas Flores da Vila." }] }),
  component: Admin,
});

function Admin() {
  const { ready, isStaff } = useAuth();
  const stats = useQuery({
    queryKey: ["admin-stats"],
    enabled: isStaff,
    queryFn: async () => {
      const soon = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
      const [p, o, prods, lots] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pendente", "aguardando_pagamento"]),
        supabase.from("products").select("stock,low_stock_threshold").eq("active", true),
        supabase.from("product_lots").select("id", { count: "exact", head: true }).gt("quantity", 0).lte("expires_at", soon),
      ]);
      return {
        products: p.count ?? 0,
        pending: o.count ?? 0,
        low: (prods.data ?? []).filter((x) => x.stock <= x.low_stock_threshold).length,
        expiring: lots.count ?? 0,
      };
    },
  });

  if (!ready) return <p className="p-10 text-center text-muted-foreground">Carregando...</p>;
  if (!isStaff)
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="text-3xl">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">Esta área é só para a equipe da loja.</p>
        <Link to="/" className="btn btn-outline mt-6">Voltar à loja</Link>
      </main>
    );

  const cards = [
    { label: "Produtos cadastrados", value: stats.data?.products },
    { label: "Pedidos pendentes", value: stats.data?.pending },
    { label: "Estoque baixo", value: stats.data?.low },
    { label: "Lotes vencendo em 7 dias", value: stats.data?.expiring },
  ];
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <Link to="/" className="text-sm text-primary">← Ver loja</Link>
      <h1 className="mt-3 text-4xl">Painel administrativo</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-4xl text-sage-deep">{c.value ?? "–"}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
        Próximas etapas: categorias, lotes com validade e pedidos aparecerão aqui.
      </p>
      <AdminProducts />
      <Toaster position="top-center" />
    </main>
  );
}

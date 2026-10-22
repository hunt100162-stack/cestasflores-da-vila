import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { brl } from "@/lib/order";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({ meta: [{ title: "Minha conta — Flora Encanto" }, { name: "description", content: "Seus pedidos na Cestas Flores da Vila." }] }),
  component: Conta,
});

function Conta() {
  const { user, isStaff } = useAuth();
  const qc = useQueryClient();
  const nav = useNavigate();
  const orders = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id,status,total,created_at").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const out = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link to="/" className="text-sm text-primary">← Voltar à loja</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Minha conta</h1>
        <div className="flex gap-2">
          {isStaff && <Link to="/admin" className="btn btn-primary">Painel administrativo</Link>}
          <button onClick={out} className="btn btn-outline">Sair</button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      <h2 className="mt-8 text-2xl">Meus pedidos</h2>
      {orders.data?.length ? (
        <ul className="mt-3 divide-y rounded-2xl border bg-card">
          {orders.data.map((o) => (
            <li key={o.id} className="flex justify-between px-4 py-3 text-sm">
              <span>{new Date(o.created_at).toLocaleDateString("pt-BR")} · <strong>{o.status.replace("_", " ")}</strong></span>
              <span>{brl(Number(o.total))}</span>
            </li>
          ))}
        </ul>
      ) : <p className="mt-3 text-muted-foreground">{orders.isLoading ? "Carregando..." : "Você ainda não fez pedidos."}</p>}
    </main>
  );
}

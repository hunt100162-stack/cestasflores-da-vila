import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Cestas Flores da Vila" },
      { name: "description", content: "Entre ou crie sua conta na Cestas Flores da Vila para acompanhar seus pedidos." },
      { property: "og:title", content: "Entrar — Cestas Flores da Vila" },
      { property: "og:description", content: "Acesse sua conta Cestas Flores da Vila." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) nav({ to: "/conta" }); });
    const { data } = supabase.auth.onAuthStateChange((e) => { if (e === "SIGNED_IN") nav({ to: "/conta" }); });
    return () => data.subscription.unsubscribe();
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("E-mail ou senha incorretos, ou e-mail ainda não confirmado.");
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: window.location.origin + "/conta", data: { full_name: name } },
      });
      setMsg(error ? error.message : "Conta criada! Confira seu e-mail para confirmar o cadastro.");
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) setMsg("Não foi possível entrar com o Google.");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-5 py-12">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-soft">
        <Link to="/" className="font-display text-2xl font-semibold text-sage-deep">Cestas Flores da Vila</Link>
        <h1 className="mt-4 text-3xl">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "up" && <input className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome" />}
          <input className="field" type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail" />
          <input className="field" type="password" required minLength={6} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Senha" />
          <button className="btn btn-primary w-full" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</button>
        </form>
        <button onClick={google} className="btn btn-outline mt-3 w-full">Continuar com Google</button>
        {msg && <p className="mt-4 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">{msg}</p>}
        <button className="mt-4 w-full text-sm text-primary underline-offset-4 hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>
          {mode === "in" ? "Ainda não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/components/flora/cart";
import { Header } from "@/components/flora/Header";
import { CartDrawer } from "@/components/flora/CartDrawer";
import { Catalog, type Filter } from "@/components/flora/Catalog";
import { About, Categories, Contact, FloatingWhats, Features, Footer, Gallery, Hero, Occasions } from "@/components/flora/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cestas Flores da Vila — Flores, cestas e presentes" },
      { name: "description", content: "Flores, cestas e presentes especiais para surpreender em qualquer ocasião. Consulte o catálogo e faça seu pedido." },
      { property: "og:title", content: "Cestas Flores da Vila — Floricultura" },
      { property: "og:description", content: "Flores e cestas que transformam momentos em lembranças inesquecíveis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [filter, setFilter] = useState<Filter>({ type: "all" });
  const go = (f: Filter) => {
    setFilter(f);
    document.getElementById("buques")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <Categories onPick={(id) => go({ type: "cat", id })} />
        <Catalog filter={filter} setFilter={setFilter} />
        <Occasions onPick={(id) => go({ type: "occ", id })} />
        <Features />
        <Gallery />
        <About />
        <Contact />
      </main>
      <Footer />
      <FloatingWhats />
      <CartDrawer />
      <Toaster position="top-center" />
    </CartProvider>
  );
}

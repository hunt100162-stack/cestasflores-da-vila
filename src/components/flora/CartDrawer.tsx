import { useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "./cart";
import { brl, buildOrderMessage, cartTotal } from "@/lib/order";
import { WHATSAPP_NUMBER, openWhatsapp } from "@/config/site";
import { useImageUrls } from "@/lib/images";
import { WhatsIcon } from "./WhatsIcon";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const imageFor = useImageUrls(lines.map((line) => line.image ?? ""));
  if (!open) return null;
  const total = cartTotal(lines);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrinho">
      <div className="absolute inset-0 bg-sage-deep/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="fade-up absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-soft">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-2xl">Seu carrinho</h2>
          <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted" aria-label="Fechar carrinho">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl">Seu carrinho está vazio.</p>
              <a href="#buques" onClick={() => setOpen(false)} className="btn btn-outline mt-5">Explorar flores</a>
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {lines.map((l) => {
                  return (
                    <li key={l.id} className="flex gap-3">
                      {l.image && <img src={imageFor(l.image) ?? l.image} alt="" className="h-20 w-20 rounded-xl object-cover" loading="lazy" />}
                      <div className="flex-1">
                        <p className="font-medium leading-tight">{l.name}</p>
                        <p className="text-sm text-muted-foreground">{l.priceFrom && "a partir de "}{brl(l.price)}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="rounded-full border p-1.5" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Diminuir"><Minus className="h-3 w-3" /></button>
                          <span className="w-6 text-center text-sm font-semibold" aria-label="Quantidade">{l.qty}</span>
                          <button className="rounded-full border p-1.5" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Aumentar"><Plus className="h-3 w-3" /></button>
                          <button className="ml-auto p-1.5 text-muted-foreground hover:text-destructive" onClick={() => remove(l.id)} aria-label={`Remover ${l.name}`}><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">{brl(l.price * l.qty)}</p>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 space-y-3 border-t pt-5">
                <p className="eyebrow">Detalhes do pedido</p>
                <input className="field" placeholder="Seu nome (opcional)" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome" />
                <label className="block text-sm text-muted-foreground">
                  Data desejada de entrega ou retirada
                  <input type="date" className="field mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <textarea className="field min-h-20" placeholder="Observações: cores, mensagem do cartão..." value={notes} onChange={(e) => setNotes(e.target.value)} aria-label="Observações" />
              </div>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="space-y-3 border-t bg-card px-5 py-4">
            <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{brl(total)}</span></div>
            <div className="flex justify-between font-display text-2xl"><span>Total estimado</span><span>{brl(total)}</span></div>
            {!WHATSAPP_NUMBER && (
              <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
                Demonstração: número de WhatsApp ainda não configurado. O pedido não será enviado.
              </p>
            )}
            <button
              className="btn btn-whatsapp w-full"
              onClick={() => openWhatsapp(buildOrderMessage(lines, { name, date: date ? date.split("-").reverse().join("/") : "", notes }))}
            >
              <WhatsIcon className="h-4 w-4" /> Enviar pedido pelo WhatsApp
            </button>
            <button className="w-full text-sm font-medium text-primary underline-offset-4 hover:underline" onClick={() => setOpen(false)}>
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

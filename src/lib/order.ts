export type CartLine = { id: string; name: string; price: number; qty: number; priceFrom?: boolean | undefined; image?: string | undefined };

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function cartTotal(lines: CartLine[]) {
  return Math.round(lines.reduce((s, l) => s + l.price * l.qty, 0) * 100) / 100;
}

export function buildOrderMessage(
  lines: CartLine[],
  info: { name?: string; date?: string; notes?: string },
) {
  const out = ["Olá, Flora Encanto! Gostaria de fazer um pedido:", ""];
  for (const l of lines) {
    out.push(
      `• ${l.qty}x ${l.name} — ${l.priceFrom ? "a partir de " : ""}${brl(l.price)} cada (${brl(l.price * l.qty)})`,
    );
  }
  out.push("", `Total estimado: ${brl(cartTotal(lines))}`);
  if (info.name?.trim()) out.push(`Nome: ${info.name.trim()}`);
  if (info.date?.trim()) out.push(`Data desejada (entrega/retirada): ${info.date.trim()}`);
  if (info.notes?.trim()) out.push(`Observações: ${info.notes.trim()}`);
  return out.join("\n");
}

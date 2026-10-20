import { describe, it, expect } from "vitest";
import { buildOrderMessage, cartTotal } from "./order";

const lines = [
  { id: "a", name: "Buquê Clássico de Rosas", price: 129.9, qty: 2 },
  { id: "b", name: "Buquê de Girassóis", price: 99.9, qty: 1 },
];

describe("pedido", () => {
  it("soma o total com quantidades", () => {
    expect(cartTotal(lines)).toBe(359.7);
  });
  it("inclui itens, total e campos do cliente na mensagem", () => {
    const m = buildOrderMessage(lines, { name: "Ana", date: "10/11", notes: "Cartão: Parabéns" });
    expect(m).toContain("2x Buquê Clássico de Rosas");
    expect(m).toMatch(/Total estimado: R\$\s?359,70/);
    expect(m).toContain("Nome: Ana");
    expect(m).toContain("Data desejada (entrega/retirada): 10/11");
    expect(m).toContain("Observações: Cartão: Parabéns");
  });
  it("omite nome quando vazio", () => {
    expect(buildOrderMessage(lines, {})).not.toContain("Nome:");
  });
});

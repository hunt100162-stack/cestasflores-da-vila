// ==== DADOS COMERCIAIS EDITÁVEIS DA LOJA ====
// Preencha com o número real (somente dígitos, com DDI e DDD), ex: "5511999999999".
// Enquanto estiver vazio, o site mostra um aviso e não abre o WhatsApp.
export const WHATSAPP_NUMBER = "";

export const SITE = {
  name: "Cestas Flores da Vila",
  fullName: "Cestas Flores da Vila — Floricultura",
  // Defina addressConfirmed = true somente depois de confirmar o endereço real.
  address: "Endereço a confirmar",
  addressConfirmed: false,
  phone: "A confirmar",
  instagram: "", // ex: "https://instagram.com/usuario-da-loja"
  hours: [
    { days: "Horário de atendimento", time: "A confirmar" },
  ],
  defaultMessage:
    "Olá! Conheci a Cestas Flores da Vila pelo site e gostaria de saber mais sobre as flores, cestas e presentes disponíveis.",
};

export function whatsappLink(message: string): string | null {
  const n = WHATSAPP_NUMBER.replace(/\D/g, "");
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function openWhatsapp(message: string) {
  const url = whatsappLink(message);
  if (!url) {
    alert(
      "Demonstração: o número de WhatsApp ainda não foi configurado.\n\nResponsável: defina WHATSAPP_NUMBER em src/config/site.ts.\n\nMensagem que seria enviada:\n\n" +
        message,
    );
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

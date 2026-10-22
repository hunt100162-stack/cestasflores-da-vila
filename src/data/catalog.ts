import rosas from "@/assets/p-rosas.jpg";
import girassois from "@/assets/p-girassois.jpg";
import romantico from "@/assets/p-romantico.jpg";
import orquidea from "@/assets/p-orquidea.jpg";
import primavera from "@/assets/p-primavera.jpg";
import tulipas from "@/assets/p-tulipas.jpg";
import caixa from "@/assets/p-caixa.jpg";
import cesta from "@/assets/p-cesta.jpg";
import delicado from "@/assets/p-delicado.jpg";
import aniversario from "@/assets/p-aniversario.jpg";
import vaso from "@/assets/p-vaso.jpg";
import casamento from "@/assets/p-casamento.jpg";
import decoracao from "@/assets/decoracao.jpg";
import hero from "@/assets/hero.jpg";

export type CategoryId = string;

export const categories: { id: CategoryId; name: string; emoji: string; image: string }[] = [
  { id: "rosas", name: "Rosas", emoji: "🌹", image: rosas },
  { id: "tulipas", name: "Tulipas", emoji: "🌷", image: tulipas },
  { id: "girassois", name: "Girassóis", emoji: "🌻", image: girassois },
  { id: "orquideas", name: "Orquídeas", emoji: "🌸", image: orquidea },
  { id: "buques", name: "Buquês especiais", emoji: "💐", image: romantico },
  { id: "plantas", name: "Plantas e vasos", emoji: "🪴", image: vaso },
  { id: "cestas", name: "Cestas e presentes", emoji: "💝", image: cesta },
  { id: "eventos", name: "Casamentos e eventos", emoji: "💍", image: casamento },
];

export type Product = {
  id: string; slug?: string; name: string; description: string; price: number; priceFrom?: boolean | undefined;
  category: CategoryId; image: string; stock?: number;
};

export const products: Product[] = [
  { id: "classico-rosas", name: "Buquê Clássico de Rosas", description: "Rosas vermelhas com eucalipto em papel kraft.", price: 129.9, category: "rosas", image: rosas },
  { id: "girassois", name: "Buquê de Girassóis", description: "Girassóis vibrantes para alegrar o dia.", price: 99.9, category: "girassois", image: girassois },
  { id: "romantico", name: "Buquê Romântico", description: "Rosas rosa e brancas com mosquitinho.", price: 149.9, category: "buques", image: romantico },
  { id: "orquidea", name: "Orquídea Elegante", description: "Phalaenopsis branca em cachepô de cerâmica.", price: 119.9, category: "orquideas", image: orquidea },
  { id: "primavera", name: "Arranjo Primavera", description: "Ranúnculos e margaridas em vaso de vidro.", price: 139.9, category: "plantas", image: primavera },
  { id: "tulipas", name: "Buquê de Tulipas", description: "Tulipas rosa e brancas em papel sálvia.", price: 159.9, category: "tulipas", image: tulipas },
  { id: "caixa-rosas", name: "Caixa de Rosas Premium", description: "Rosas vermelhas em caixa redonda elegante.", price: 189.9, category: "rosas", image: caixa },
  { id: "cesta", name: "Cesta Floral Especial", description: "Flores, chocolates e mimos em cesta de vime.", price: 169.9, category: "cestas", image: cesta },
  { id: "delicado", name: "Buquê Delicado", description: "Lisianthus e flores em tons pastel.", price: 89.9, category: "buques", image: delicado },
  { id: "aniversario", name: "Arranjo para Aniversário", description: "Gérberas e rosas coloridas em caixa festiva.", price: 119.9, category: "cestas", image: aniversario },
  { id: "vaso", name: "Vaso Decorativo com Flores", description: "Hortênsias em vaso de porcelana decorada.", price: 109.9, category: "plantas", image: vaso },
  { id: "personalizado", name: "Buquê Personalizado", description: "Você escolhe flores, cores e embalagem.", price: 149.9, priceFrom: true, category: "eventos", image: casamento },
];

export type Occasion = { id: string; title: string; description: string; image: string; productIds: string[] };

export const occasions: Occasion[] = [
  { id: "aniversarios", title: "Aniversários", description: "Cores e alegria para celebrar mais um ano.", image: aniversario, productIds: ["aniversario", "girassois", "primavera", "cesta"] },
  { id: "namoro", title: "Namoro e Dia dos Namorados", description: "Rosas e gestos que falam por você.", image: rosas, productIds: ["classico-rosas", "caixa-rosas", "romantico"] },
  { id: "casamentos", title: "Casamentos", description: "Buquês de noiva e decoração sob medida.", image: casamento, productIds: ["personalizado", "romantico", "tulipas"] },
  { id: "aniv-namoro", title: "Aniversários de namoro", description: "Para lembrar cada capítulo da história.", image: caixa, productIds: ["caixa-rosas", "romantico", "tulipas"] },
  { id: "agradecimentos", title: "Agradecimentos", description: "Um obrigado que floresce.", image: delicado, productIds: ["delicado", "girassois", "orquidea"] },
  { id: "maternidade", title: "Maternidade", description: "Delicadeza para receber quem chegou.", image: tulipas, productIds: ["tulipas", "delicado", "orquidea", "cesta"] },
  { id: "datas", title: "Datas comemorativas", description: "Dia das Mães, Natal e outras datas.", image: primavera, productIds: ["primavera", "cesta", "vaso", "orquidea"] },
  { id: "homenagens", title: "Homenagens e momentos especiais", description: "Arranjos sóbrios e respeitosos.", image: vaso, productIds: ["vaso", "orquidea", "personalizado"] },
];

export const gallery = [
  { src: rosas, alt: "Buquê de rosas vermelhas" },
  { src: primavera, alt: "Arranjo colorido em vaso de vidro" },
  { src: vaso, alt: "Hortênsias em vaso decorado" },
  { src: cesta, alt: "Cesta de presente com flores" },
  { src: decoracao, alt: "Decoração floral de mesa" },
  { src: casamento, alt: "Buquê de casamento branco" },
  { src: hero, alt: "Buquê de peônias e rosas" },
  { src: caixa, alt: "Caixa de rosas" },
];

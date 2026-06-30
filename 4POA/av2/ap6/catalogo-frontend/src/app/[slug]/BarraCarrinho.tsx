// src/app/[slug]/BarraCarrinho.tsx
"use client";

import { useCarrinho } from "@/context/CarrinhoContext";
import { useRouter, usePathname } from "next/navigation";

export default function BarraCarrinho() {
  const { totalItens, totalPreco } = useCarrinho();
  const router = useRouter();
  const pathname = usePathname();

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (totalItens === 0) return null;

  // Extrai o slug da URL atual para montar a rota do checkout
  const slug = pathname.split("/")[1];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
      <button
        onClick={() => router.push(`/${slug}/checkout`)}
        className="pointer-events-auto w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl active:scale-95 transition-all duration-200"
      >
        <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {totalItens} {totalItens === 1 ? "item" : "itens"}
        </span>
        <span className="text-sm font-bold">Ver carrinho</span>
        <span className="text-sm font-bold">{formatarPreco(totalPreco)}</span>
      </button>
    </div>
  );
}
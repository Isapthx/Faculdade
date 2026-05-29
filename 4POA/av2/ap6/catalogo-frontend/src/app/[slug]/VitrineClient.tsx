"use client";

import { useState } from "react";
import { Empresa } from "@/types";
import { CarrinhoProvider, useCarrinho } from "@/context/CarrinhoContext";
import HeaderEmpresa from "@/app/[slug]/HeaderEmpresa";
import AbasCategorias from "@/app/[slug]/AbasCategorias";
import CarrinhoDrawer from "@/app/[slug]/CarrinhoDrawer";

function BotaoCarrinho({ onClick }: { onClick: () => void }) {
  const { totalItens, totalPreco } = useCarrinho();

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (totalItens === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
      <button
        onClick={onClick}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-xl flex items-center justify-between px-5 transition-all duration-200"
      >
        <span className="bg-emerald-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {totalItens}
        </span>
        <span className="font-bold text-sm">Ver pedido</span>
        <span className="font-extrabold text-sm">{formatarPreco(totalPreco)}</span>
      </button>
    </div>
  );
}

export default function VitrineClient({ empresa }: { empresa: Empresa }) {
  const [drawerAberto, setDrawerAberto] = useState(false);

  return (
    <CarrinhoProvider>
      <main className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-emerald-500 selection:text-white">
        <div className="mx-auto max-w-md bg-white min-h-screen shadow-xl pb-32">
          <HeaderEmpresa empresa={empresa} />
          <AbasCategorias categorias={empresa.categorias || []} />
        </div>

        <BotaoCarrinho onClick={() => setDrawerAberto(true)} />

        <CarrinhoDrawer
          slug={empresa.slug}
          aberto={drawerAberto}
          onFechar={() => setDrawerAberto(false)}
        />
      </main>
    </CarrinhoProvider>
  );
}
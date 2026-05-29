"use client";

import { useState } from "react";
import CardProduto from "@/app/[slug]/CardProduto";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

interface Categoria {
  id: number;
  nome: string;
  produtos?: Produto[];
}


// Protegemos o parâmetro definindo uma lista vazia como fallback padrão caso venha undefined
export default function AbasCategorias({ categorias = [] }: { categorias?: Categoria[] }) {
  
  // Forçamos a garantia de que categorias seja tratado como array seguro
  const listaCategorias = categorias || [];

  // Estado para controlar qual categoria está ativa (Padrão: a primeira da lista)
  const [categoriaAtivaId, setCategoriaAtivaId] = useState<number | null>(
    listaCategorias[0]?.id ?? null
  );
  console.log(listaCategorias.length)

  // Se não houver categorias cadastradas ou se o array veio nulo
  if (listaCategorias.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 text-sm">
        Nenhum produto disponível nesta vitrine.
      </div>
    );
  }

  // Encontra a categoria selecionada para renderizar os seus produtos
  const categoriaSelecionada = listaCategorias.find((cat) => cat.id === categoriaAtivaId);
  
  // Garante que se a lista de produtos vier nula/undefined do backend, tratamos como uma lista vazia
  const produtosDaCategoria = categoriaSelecionada?.produtos || [];

  return (
    <div className="mt-6">
      {/* Menu de Abas Horizontal com Scroll Lateral Dinâmico */}
      <div className="flex overflow-x-auto px-4 gap-2 border-b border-gray-100 pb-3 scrollbar-none snap-x">
        {listaCategorias.map((cat) => {
          const isActive = cat.id === categoriaAtivaId;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtivaId(cat.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 snap-inside ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.nome}
            </button>
          );
        })}
      </div>

      console.log("ta ")

      {/* Listagem dos Produtos da Categoria Ativa */}
      <div className="p-4 space-y-3">
        {produtosDaCategoria.length > 0 ? (
          produtosDaCategoria.map((produto) => (
            <CardProduto key={produto.id} produto={produto} />
          ))
        ) : (
          <p className="text-center text-sm text-gray-400 py-8">
            Nenhum item nesta categoria ainda.
          </p>
        )}
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import { useCarrinho } from "@/context/CarrinhoContext";
import { Produto } from "@/types";

export default function CardProduto({ produto }: { produto: Produto }) {
  const { adicionarItem, itens, alterarQuantidade } = useCarrinho();

  const itemNoCarrinho = itens.find((i) => i.produto.id === produto.id);
  const quantidade = itemNoCarrinho?.quantidade ?? 0;

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow duration-200 gap-3">
      
      {/* Imagem do produto */}
      {produto.urlImagem && (
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={produto.urlImagem}
            alt={produto.nome}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      {/* Informações */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 truncate">{produto.nome}</h3>
        {produto.descricao && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
            {produto.descricao}
          </p>
        )}
        <span className="text-sm font-extrabold text-emerald-600 inline-block mt-2">
          {formatarPreco(produto.preco)}
        </span>
      </div>

      {/* Botão / controle de quantidade */}
      {quantidade === 0 ? (
        <button
          onClick={() => adicionarItem(produto)}
          className="h-9 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1 shadow-sm border border-emerald-100 shrink-0"
        >
          <span>+</span>
          <span>Adicionar</span>
        </button>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alterarQuantidade(produto.id, quantidade - 1)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600 transition-colors flex items-center justify-center font-bold text-sm"
          >
            −
          </button>
          <span className="text-sm font-bold text-gray-900 w-4 text-center">
            {quantidade}
          </span>
          <button
            onClick={() => adicionarItem(produto)}
            className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center font-bold text-sm"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
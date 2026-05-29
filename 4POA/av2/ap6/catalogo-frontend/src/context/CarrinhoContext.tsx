"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Produto, ItemCarrinho } from "@/types";

interface CarrinhoContextType {
  itens: ItemCarrinho[];
  adicionarItem: (produto: Produto) => void;
  removerItem: (produtoId: number) => void;
  alterarQuantidade: (produtoId: number, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  totalPreco: number;
}

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  const adicionarItem = useCallback((produto: Produto) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.produto.id === produto.id);
      if (existe) {
        return prev.map((i) =>
          i.produto.id === produto.id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  }, []);

  const removerItem = useCallback((produtoId: number) => {
    setItens((prev) => prev.filter((i) => i.produto.id !== produtoId));
  }, []);

  const alterarQuantidade = useCallback((produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      setItens((prev) => prev.filter((i) => i.produto.id !== produtoId));
    } else {
      setItens((prev) =>
        prev.map((i) =>
          i.produto.id === produtoId ? { ...i, quantidade } : i
        )
      );
    }
  }, []);

  const limparCarrinho = useCallback(() => setItens([]), []);

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalPreco = itens.reduce(
    (acc, i) => acc + i.produto.preco * i.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        limparCarrinho,
        totalItens,
        totalPreco,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
  return ctx;
}
// src/context/CarrinhoContext.tsx
"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Produto, ItemCarrinho } from "@/types";

interface CarrinhoContextType {
  itens: ItemCarrinho[];
  totalItens: number;
  totalPreco: number;
  adicionarItem: (produto: Produto) => void;
  removerItem: (produtoId: number) => void;
  diminuirItem: (produtoId: number) => void;
  limparCarrinho: () => void;
}

const CarrinhoContext = createContext<CarrinhoContextType | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
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

  const diminuirItem = useCallback((produtoId: number) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.produto.id === produtoId);
      if (existe && existe.quantidade === 1) {
        return prev.filter((i) => i.produto.id !== produtoId);
      }
      return prev.map((i) =>
        i.produto.id === produtoId
          ? { ...i, quantidade: i.quantidade - 1 }
          : i
      );
    });
  }, []);

  const removerItem = useCallback((produtoId: number) => {
    setItens((prev) => prev.filter((i) => i.produto.id !== produtoId));
  }, []);

  const limparCarrinho = useCallback(() => setItens([]), []);

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const totalPreco = itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0);

  return (
    <CarrinhoContext.Provider value={{
      itens,
      totalItens,
      totalPreco,
      adicionarItem,
      removerItem,
      diminuirItem,
      limparCarrinho,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  const context = useContext(CarrinhoContext);
  if (!context) throw new Error("useCarrinho deve ser usado dentro de CarrinhoProvider");
  return context;
}
"use client";

import { useState } from "react";
import { useCarrinho } from "@/context/CarrinhoContext";
import { enviarOrcamento } from "@/services/api";

interface CarrinhoDrawerProps {
  slug: string;
  aberto: boolean;
  onFechar: () => void;
}

export default function CarrinhoDrawer({ slug, aberto, onFechar }: CarrinhoDrawerProps) {
  const { itens, removerItem, alterarQuantidade, limparCarrinho, totalPreco } = useCarrinho();
  const [nomeCliente, setNomeCliente] = useState("");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  async function handleEnviar() {
    if (!nomeCliente.trim()) {
      setErro("Por favor, informe seu nome.");
      return;
    }
    if (itens.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      const resultado = await enviarOrcamento(slug, {
        nomeCliente: nomeCliente.trim(),
        observacao: observacao.trim(),
        itens: itens.map((i) => ({
          produtoId: i.produto.id,
          quantidade: i.quantidade,
        })),
      });

      if (resultado?.url) {
        limparCarrinho();
        onFechar();
        window.open(resultado.url, "_blank");
      }
    } catch {
      setErro("Erro ao gerar o pedido. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          aberto ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onFechar}
      />

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white z-50 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out ${
          aberto ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Seu Pedido</h2>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-sm">Nenhum item adicionado ainda.</p>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-3">
              {/* Lista de itens */}
              {itens.map((item) => (
                <div
                  key={item.produto.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.produto.nome}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">
                      {formatarPreco(item.produto.preco * item.quantidade)}
                    </p>
                  </div>

                  {/* Controle de quantidade */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alterarQuantidade(item.produto.id, item.quantidade - 1)}
                      className="w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors flex items-center justify-center text-sm font-bold shadow-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-4 text-center">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => alterarQuantidade(item.produto.id, item.quantidade + 1)}
                      className="w-7 h-7 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm font-bold shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-500">Total estimado</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {formatarPreco(totalPreco)}
                </span>
              </div>

              {/* Formulário */}
              <div className="pt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Seu nome *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Observações (opcional)
                  </label>
                  <textarea
                    placeholder="Ex: Sem cebola, entrega no portão..."
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {erro && (
                  <p className="text-xs text-red-500 font-medium">{erro}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão fixo no rodapé */}
        {itens.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-3xl">
            <button
              onClick={handleEnviar}
              disabled={enviando}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-60 text-white font-bold text-sm rounded-2xl transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {enviando ? (
                <span>Gerando pedido...</span>
              ) : (
                <>
                  <span>📲</span>
                  <span>Enviar pelo WhatsApp</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
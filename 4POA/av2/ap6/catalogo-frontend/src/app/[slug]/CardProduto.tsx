// src/app/[slug]/CardProduto.tsx
interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
}

export default function CardProduto({ produto }: { produto: Produto }) {
  // Função auxiliar para formatar a moeda local
  const formatarPreco = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow duration-200 gap-4">
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

      {/* Botão Adicionar (A ser conectado ao carrinho global) */}
      <button 
        onClick={() => alert(`Adicionou: ${produto.nome}`)}
        className="h-9 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 flex items-center gap-1 shadow-sm border border-emerald-100"
      >
        <span>+</span>
        <span>Adicionar</span>
      </button>
    </div>
  );
}
// src/types/index.ts

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  urlImagem?: string; // Opcional, caso queiras colocar fotos depois
  disponivel: boolean;
  categoria: Categoria;
}

export interface Categoria {
  id: number,
  nome: string;
  empresa: Empresa;
  produtos: Produto[];
}

export interface Empresa {
  id: number;
  nome: string;
  slug: string;
  whatsapp: string;
  categorias: Categoria[];
}

// Representação de um item dentro do carrinho de compras do cliente
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}
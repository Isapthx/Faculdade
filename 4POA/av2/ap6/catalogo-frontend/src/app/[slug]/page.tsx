// src/app/[slug]/page.tsx
import { getEmpresaBySlug } from "@/services/api";
import HeaderEmpresa from "@/app/[slug]/HeaderEmpresa";
import AbasCategorias from "@/app/[slug]/AbasCategorias";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VitrinePage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Log para ver se o Next.js está capturando o slug correto da URL
  console.log("=== SLUG DA URL ===", slug);

  // 1. Fetch dos dados diretamente no servidor (Excelente para SEO!)
  const empresa = await getEmpresaBySlug(slug);

  // 2. Log para ver se o fetch realmente trouxe o objeto do Backend
  console.log("=== DADOS RECEBIDOS DO BACKEND ===\n");
  console.log("Empresa: ", empresa);
  console.log("ID: ", empresa?.id);
  console.log("Nome: ", empresa?.nome);
  console.log("Whatsapp: ", empresa?.whatsapp);
  console.log("Categorias: ", empresa?.categorias);

  // Se o lojista digitou um slug que não existe no banco, manda para a página 404 padrão do Next.js
  if (!empresa) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="mx-auto max-w-md bg-white min-h-screen shadow-xl pb-24">
        {/* Cabeçalho da Loja */}
        <HeaderEmpresa empresa={empresa} />

        {/* Listagem de Categorias e Produtos com lógica de Carrinho */}
        <AbasCategorias categorias={empresa.categorias || []} />
      </div>
    </main>
  );
}
import { Empresa } from "@/types";

// Função para buscar os dados da empresa e catálogo pelo slug
export async function getEmpresaBySlug(slug: string): Promise<Empresa | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/empresas/${slug}`, {
      // revalidate: 60 // Opcional: faz o Next.js guardar um cache por 60 segundos
      next: { revalidate: 10 } 
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Falha ao buscar dados do servidor");
    }

    return res.json();
  } catch (error) {
    console.error("Erro na requisição da API:", error);
    return null;
  }
}
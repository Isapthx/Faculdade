import { Empresa } from "@/types";

export const dynamic = "force-dynamic";

// Função para buscar os dados da empresa e catálogo pelo slug
export async function getEmpresaBySlug(slug: string): Promise<Empresa | null> {
  try {
    const res = await fetch(`http://localhost:8080/api/empresas/${slug}`, {
      // revalidate: 60 // Opcional: faz o Next.js guardar um cache por 60 segundos
      cache: "no-store"
    });

    if (!res.ok) {
        console.error("Status do Backend: ", res.status, res.statusText);
        const body = await res.text();
        console.error("Corpo do erro: ", body);
      if (res.status === 404) return null;
      throw new Error("Falha ao buscar dados do servidor");
    }

    return res.json();
  } catch (error) {
    console.error("Erro na requisição da API:", error);
    return null;
  }
}

interface ItemOrcamento {
  produtoId: number;
  quantidade: number;
}

interface EnviarOrcamentoPayload {
  nomeCliente: string;
  observacao: string;
  itens: ItemOrcamento[];
}

export async function enviarOrcamento(
  slug: string,
  payload: EnviarOrcamentoPayload
): Promise<{ url: string } | null> {
  try {
    const res = await fetch(
      `http://localhost:8080/api/empresas/${slug}/orcamento`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error("Falha ao enviar orçamento");
    return res.json();
  } catch (error) {
    console.error("Erro ao enviar orçamento:", error);
    return null;
  }
}
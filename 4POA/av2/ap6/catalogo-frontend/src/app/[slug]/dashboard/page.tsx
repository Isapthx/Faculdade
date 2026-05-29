import DashboardClient from "./DashboardClient";
import { getEmpresaBySlug } from "@/services/api";

interface Props {
  params: { slug: string };
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params;

  const empresa = await getEmpresaBySlug(slug);

  // 🚨 CORREÇÃO AQUI
  if (!empresa) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Empresa não encontrada</h1>
      </div>
    );
  }

  return <DashboardClient empresa={empresa} slug={slug} />;
}
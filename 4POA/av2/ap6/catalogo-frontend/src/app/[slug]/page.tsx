import { getEmpresaBySlug } from "@/services/api";
import { notFound } from "next/navigation";
import VitrineClient from "@/app/[slug]/VitrineClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function VitrinePage({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await getEmpresaBySlug(slug);

  if (!empresa) notFound();

  return <VitrineClient empresa={empresa} />;
}
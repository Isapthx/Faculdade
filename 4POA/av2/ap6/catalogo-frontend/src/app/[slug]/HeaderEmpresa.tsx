// src/app/[slug]/HeaderEmpresa.tsx
interface Empresa {
  nome: string;
  descricao?: string;
  whatsapp?: string;
}

export default function HeaderEmpresa({ empresa }: { empresa: Empresa }) {
  return (
    <header className="relative bg-emerald-600 pt-12 pb-6 px-4 text-white rounded-b-3xl shadow-md">
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Avatar/Logótipo Padrão */}
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-3xl font-bold shadow-inner border-2 border-emerald-500/20">
          {empresa.nome.charAt(0).toUpperCase()}
        </div>
        
        <h1 className="text-xl font-bold tracking-tight">{empresa.nome}</h1>
        
        {empresa.descricao && (
          <p className="text-xs text-emerald-100 max-w-xs">{empresa.descricao}</p>
        )}

        {empresa.whatsapp && (
          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-700/50 px-2.5 py-1 rounded-full font-medium text-emerald-200 border border-emerald-500/30">
            🟢 Atendimento via WhatsApp
          </span>
        )}
      </div>
    </header>
  );
}
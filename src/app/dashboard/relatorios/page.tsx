"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  FileText, FileSpreadsheet, Download, FileArchive, 
  TrendingUp, Users, PackageSearch, ShieldCheck,
  Loader2, CheckCircle2, AlertCircle
} from "lucide-react";

export default function RelatoriosPage() {
  // Estado genérico para simular o loading de qualquer botão de exportação
  const [exportando, setExportando] = useState<string | null>(null);

  const handleExportar = (tipo: string, formato: string) => {
    setExportando(tipo);
    
    // Simula o tempo de geração de um arquivo pesado no servidor
    setTimeout(() => {
      setExportando(null);
      toast.success(`Relatório de ${tipo} gerado!`, {
        description: `O arquivo .${formato} foi salvo na sua pasta de downloads.`
      });
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <FileArchive size={14} /> Central de Dados
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Relatórios & Exportações</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Extraia balanços fiscais, dados de inventário e logs de conformidade.
          </p>
        </div>
      </div>

      {/* 📊 ESTATÍSTICAS DE EXTRAÇÃO (AGORA COM EFEITOS HOVER!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white dark:bg-stone-800 p-6 rounded-[1.5rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20">
            <Download size={20} strokeWidth={3}/>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-0.5">Arquivos Gerados</p>
            <h3 className="text-2xl font-black text-stone-900 dark:text-white group-hover:translate-x-1 transition-transform">128 <span className="text-sm font-medium text-stone-400">este mês</span></h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-stone-800 p-6 rounded-[1.5rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20">
            <CheckCircle2 size={20} strokeWidth={3}/>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-0.5">Status do Banco</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">Sincronizado</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-[1.5rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 flex items-center gap-4 group cursor-default">
          <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-500 flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10 group-hover:text-amber-500">
            <AlertCircle size={20} strokeWidth={3}/>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-0.5">Último Backup Global</p>
            <h3 className="text-lg font-black text-stone-900 dark:text-white mt-1 group-hover:translate-x-1 transition-transform">Hoje, 02:00 AM</h3>
          </div>
        </div>
      </div>

      {/* 🗂️ GRID DE EXTRAÇÃO (MÓDULOS COM EFEITOS REFINADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MÓDULO 1: DRE E FINANCEIRO */}
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col justify-between group hover:border-[#A67B5B]/30 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-700 flex items-center justify-center text-[#A67B5B] mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2 group-hover:translate-x-1 transition-transform">Balanço DRE & Caixa</h3>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-6 line-clamp-2">
              Relatório contábil completo com lucros, despesas fixas, comissões e fechamento de caixa do período selecionado.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-100 dark:border-stone-700 group-hover:border-[#A67B5B]/30 transition-colors">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Período</span>
                <select className="bg-transparent text-sm font-bold text-stone-900 dark:text-white focus:outline-none cursor-pointer">
                  <option>Mês Atual</option>
                  <option>Mês Anterior</option>
                  <option>Últimos 3 Meses</option>
                  <option>Ano Completo</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button 
              onClick={() => handleExportar("DRE Financeiro", "pdf")}
              disabled={exportando !== null}
              className="flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-sm py-3.5 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              {exportando === "DRE Financeiro" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />} PDF
            </button>
            <button 
              onClick={() => handleExportar("DRE Financeiro Excel", "csv")}
              disabled={exportando !== null}
              className="flex items-center justify-center gap-2 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-bold text-sm py-3.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              <FileSpreadsheet size={16} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" /> Excel / CSV
            </button>
          </div>
        </div>

        {/* MÓDULO 2: ESTOQUE E INVENTÁRIO */}
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col justify-between group hover:border-emerald-500/30 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-700 flex items-center justify-center text-emerald-500 mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <PackageSearch size={24} />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2 group-hover:translate-x-1 transition-transform">Inventário e Produtos</h3>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-6 line-clamp-2">
              Extração completa de todos os SKUs, valores de custo, quantidade física e alertas de validade/esgotamento.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-100 dark:border-stone-700 group-hover:border-emerald-500/30 transition-colors">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Filtro de Status</span>
                <select className="bg-transparent text-sm font-bold text-stone-900 dark:text-white focus:outline-none cursor-pointer">
                  <option>Todos os Produtos</option>
                  <option>Apenas Esgotados</option>
                  <option>Abaixo do Mínimo</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button 
              disabled={true}
              className="flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-900 text-stone-400 font-bold text-sm py-3.5 rounded-xl cursor-not-allowed border border-transparent dark:border-stone-800"
            >
              <FileText size={16} /> PDF (Indisponível)
            </button>
            <button 
              onClick={() => handleExportar("Inventário Geral", "csv")}
              disabled={exportando !== null}
              className="flex items-center justify-center gap-2 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-bold text-sm py-3.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              {exportando === "Inventário Geral" ? <Loader2 size={16} className="animate-spin text-emerald-500" /> : <FileSpreadsheet size={16} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />} Planilha CSV
            </button>
          </div>
        </div>

        {/* MÓDULO 3: INADIMPLÊNCIA CRM */}
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col justify-between group hover:border-rose-500/30 hover:shadow-lg transition-all duration-300">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-700 flex items-center justify-center text-rose-500 mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-black text-stone-900 dark:text-white mb-2 group-hover:translate-x-1 transition-transform">Relatório de Inadimplência</h3>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-6 line-clamp-2">
              Lista de clientes com parcelas do Sweet Flex atrasadas. Inclui telefones e cálculo de juros atualizados para a equipe de cobrança.
            </p>
          </div>
          
          <div className="mt-auto">
            <button 
              onClick={() => handleExportar("Devedores CRM", "pdf")}
              disabled={exportando !== null}
              className="w-full flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-bold text-sm py-3.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              {exportando === "Devedores CRM" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="group-hover/btn:-translate-y-1 transition-transform" />} Extrair Lista para Cobrança
            </button>
          </div>
        </div>

        {/* MÓDULO 4: AUDITORIA DE SEGURANÇA */}
        <div className="bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 shadow-xl p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center text-indigo-400 mb-6 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-white mb-2 group-hover:translate-x-1 transition-transform">Log de Auditoria Global</h3>
            <p className="text-sm font-medium text-stone-400 mb-6 line-clamp-2">
              Exportação do Cofre de Segurança (Quem acessou, quem estornou vendas e quem apagou produtos no sistema).
            </p>
          </div>
          
          <div className="mt-auto relative z-10">
            <button 
              onClick={() => handleExportar("Auditoria de Seguranca", "csv")}
              disabled={exportando !== null}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 group/btn"
            >
              {exportando === "Auditoria de Seguranca" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="group-hover/btn:-translate-y-1 transition-transform" />} Fazer Download do Log (CSV)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
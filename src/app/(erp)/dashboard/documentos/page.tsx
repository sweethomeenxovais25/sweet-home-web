"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  FolderOpen, FileText, UploadCloud, Link as LinkIcon, 
  Search, MoreVertical, Download, ExternalLink, ShieldCheck,
  FolderClosed, FileSpreadsheet, FileImage, Plus, X, Server
} from "lucide-react";

// 🚀 MOCK DO BANCO DE DADOS (GED - Gestão Eletrônica de Documentos)
const PASTAS_MOCK = [
  { id: "contabilidade", nome: "Fiscal & Contábil", icon: FileText, cor: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { id: "contratos", nome: "Contratos Jurídicos", icon: ShieldCheck, cor: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { id: "rh", nome: "Recursos Humanos", icon: FolderOpen, cor: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
];

const ARQUIVOS_MOCK = [
  { id: "DOC-001", nome: "Contrato_Aluguel_Loja.pdf", tipo: "pdf", tamanho: "2.4 MB", data: "15/03/2026", pasta: "contratos", origem: "supabase", autor: "Admin" },
  { id: "DOC-002", nome: "Guia_DAS_Fevereiro.pdf", tipo: "pdf", tamanho: "1.1 MB", data: "10/03/2026", pasta: "contabilidade", origem: "supabase", autor: "Contabilidade" },
  { id: "DOC-003", nome: "Planilha de Precificação Dinâmica", tipo: "link", tamanho: "Nuvem", data: "18/03/2026", pasta: "contabilidade", origem: "google_drive", link: "https://docs.google.com/spreadsheets/d/...", autor: "Jean" },
  { id: "DOC-004", nome: "Regulamento Interno 2026.docx", tipo: "doc", tamanho: "800 KB", data: "01/01/2026", pasta: "rh", origem: "supabase", autor: "Admin" },
];

export default function BaplyDrivePage() {
  const [pastaAtiva, setPastaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");
  
  // Estados do Modal Inteligente
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoUpload, setTipoUpload] = useState("arquivo"); // "arquivo" | "link"

  // Filtro de Arquivos
  const arquivosExibidos = ARQUIVOS_MOCK.filter(arq => {
    const matchPasta = pastaAtiva === "todos" || arq.pasta === pastaAtiva;
    const matchBusca = arq.nome.toLowerCase().includes(busca.toLowerCase());
    return matchPasta && matchBusca;
  });

  const getIconeArquivo = (tipo: string, origem: string) => {
    if (origem === "google_drive" || tipo === "link") return <LinkIcon size={20} className="text-blue-500" />;
    if (tipo === "pdf") return <FileText size={20} className="text-rose-500" />;
    if (tipo === "xls" || tipo === "csv") return <FileSpreadsheet size={20} className="text-emerald-500" />;
    if (tipo === "png" || tipo === "jpg") return <FileImage size={20} className="text-amber-500" />;
    return <FileText size={20} className="text-stone-500" />;
  };

  const handleSalvarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Documento indexado no cofre Baply!", {
      description: "Ele já está disponível para toda a equipe com permissão."
    });
    setModalAberto(false);
  };

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <Server size={14} className="animate-pulse" /> Supabase Storage / Hub
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Cofre de Documentos</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            O hub centralizado para PDFs, guias fiscais e planilhas do Google Workspace.
          </p>
        </div>
        
        <button 
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-900/20 hover:shadow-[#A67B5B]/30 hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] dark:hover:text-white active:scale-95 group"
        >
          <Plus size={18} className="group-hover:scale-110 transition-transform" /> Indexar Documento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================== */}
        {/* LADO ESQUERDO: NAVEGAÇÃO DE PASTAS */}
        {/* ========================================== */}
        <div className="lg:col-span-3 space-y-2">
          <button 
            onClick={() => setPastaAtiva("todos")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              pastaAtiva === "todos" 
                ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" 
                : "bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <FolderClosed size={18} /> Meu Drive (Todos)
          </button>

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-4">Setores da Empresa</p>
          </div>

          {PASTAS_MOCK.map((pasta) => (
            <button 
              key={pasta.id}
              onClick={() => setPastaAtiva(pasta.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                pastaAtiva === pasta.id 
                  ? "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm text-stone-900 dark:text-white" 
                  : "bg-transparent border border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pasta.bg} ${pasta.cor}`}>
                  <pasta.icon size={16} />
                </div>
                {pasta.nome}
              </div>
            </button>
          ))}
        </div>

        {/* ========================================== */}
        {/* LADO DIREITO: LISTA DE ARQUIVOS (O DRIVE) */}
        {/* ========================================== */}
        <div className="lg:col-span-9 bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30 shrink-0">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquisar por nome do documento..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all text-stone-900 dark:text-white font-medium shadow-sm" 
              />
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {arquivosExibidos.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <FolderOpen size={48} className="mb-4 opacity-20" />
                  <p className="font-bold text-lg">Cofre Vazio</p>
                  <p className="text-sm mt-1 opacity-70">Nenhum documento encontrado neste setor.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {arquivosExibidos.map((arq) => (
                  <div key={arq.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4 rounded-2xl hover:border-[#A67B5B]/50 hover:shadow-md transition-all group flex flex-col justify-between">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        {getIconeArquivo(arq.tipo, arq.origem)}
                      </div>
                      <button className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-1"><MoreVertical size={16}/></button>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1 line-clamp-2" title={arq.nome}>{arq.nome}</h4>
                      <p className="text-xs font-medium text-stone-500 mb-3">{arq.data} • Autor: {arq.autor}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100 dark:border-stone-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                        {arq.tamanho}
                      </span>
                      
                      {arq.origem === "google_drive" ? (
                        <button className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                          Abrir Nuvem <ExternalLink size={12} />
                        </button>
                      ) : (
                        <button className="text-xs font-bold text-[#A67B5B] hover:text-[#8e694d] flex items-center gap-1 transition-colors">
                          Baixar PDF <Download size={12} />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 🚀 MODAL DE UPLOAD / INDEXAÇÃO INTELIGENTE */}
      {/* ========================================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={() => setModalAberto(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-xl rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-xl">Indexar Novo Documento</h3>
                <p className="text-xs text-stone-500 font-medium">Faça upload de um arquivo ou cole um link externo.</p>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 p-2.5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8">
              <form id="form-doc" onSubmit={handleSalvarDocumento} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800">
                  <button type="button" onClick={() => setTipoUpload("arquivo")} className={`py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${tipoUpload === "arquivo" ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                    <UploadCloud size={16} /> Arquivo Físico
                  </button>
                  <button type="button" onClick={() => setTipoUpload("link")} className={`py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${tipoUpload === "link" ? "bg-white dark:bg-stone-800 text-blue-600 dark:text-blue-400 shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                    <LinkIcon size={16} /> Link Externo (Drive)
                  </button>
                </div>

                {tipoUpload === "arquivo" ? (
                  <div className="w-full h-40 bg-stone-50 dark:bg-stone-900/50 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:border-[#A67B5B]/50 hover:bg-[#A67B5B]/5 transition-all cursor-pointer group">
                    <UploadCloud size={32} className="mb-2 group-hover:scale-110 group-hover:text-[#A67B5B] transition-transform" />
                    <p className="text-sm font-bold text-stone-600 dark:text-stone-300">Clique ou arraste o PDF aqui</p>
                    <p className="text-[10px] mt-1 uppercase tracking-widest">Protegido no Supabase Vault</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">URL do Google Workspace / Nuvem</label>
                    <input type="url" required placeholder="https://docs.google.com/..." className="w-full px-4 py-3.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white font-medium" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome de Exibição</label>
                    <input type="text" required placeholder="Ex: Contrato de Fornecimento 2026" className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all dark:text-white font-bold" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Setor / Pasta</label>
                    <select required className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all appearance-none font-bold text-stone-700 dark:text-stone-300">
                      <option value="">Selecione o destino...</option>
                      {PASTAS_MOCK.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end shrink-0">
               <button form="form-doc" type="submit" className="px-8 py-3 rounded-xl font-bold text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] hover:text-white transition-all shadow-lg active:scale-95">
                 Salvar Documento
               </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
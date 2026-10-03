"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { 
  PackageSearch, Plus, Search, MoreVertical, 
  Image as ImageIcon, AlertOctagon, TrendingUp, TrendingDown, MonitorSmartphone,
  UploadCloud, FileText, Bot, Layers, Edit3, Trash2, RefreshCw, X,
  CheckCircle2, Globe, Tag, DollarSign, ListOrdered, Palette, Sparkles,
  Filter, ShieldCheck, Loader2, History, Truck, Calculator, Tags,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

// ============================================================================
// 🚀 MOCKS (Preparados para a futura integração com Supabase)
// ============================================================================
const PRODUTOS_MOCK = [
  { 
    id: "P001", cod: "789101", nome: "Jogo de Lençol Casal 400 Fios", 
    preco_venda: 189.90, custo: 90.00, estoque: 15, estoque_minimo: 5, 
    categoria: "Cama", fornecedor: "Buddemeyer", localizacao: "Corredor A",
    imagem: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=200&h=200",
    status_site: "Publicado", variacoes: ["Branco", "Bege", "Azul Marinho"]
  },
  { 
    id: "P002", cod: "789102", nome: "Toalha de Banho Algodão Egípcio", 
    preco_venda: 89.90, custo: 35.00, estoque: 2, estoque_minimo: 10, 
    categoria: "Banho", fornecedor: "Karsten", localizacao: "Prateleira B2",
    imagem: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=200&h=200",
    status_site: "Rascunho", variacoes: ["Branco", "Cinza"]
  },
  { 
    id: "P004", cod: "789104", nome: "Manta Microfibra Solteiro", 
    preco_venda: 79.90, custo: 30.00, estoque: 0, estoque_minimo: 5, 
    categoria: "Cama", fornecedor: "Avulso", localizacao: "Estoque Fundo",
    imagem: "", 
    status_site: "Oculto", variacoes: []
  },
];

const LOG_MOCK = [
  { id: 1, data: "Hoje, 14:30", tipo: "Saída (PDV)", produto: "Jogo de Lençol Casal 400 Fios", qtd: "-2", user: "Bia" },
  { id: 2, data: "Ontem, 09:15", tipo: "Entrada (Nota Fiscal)", produto: "Toalha de Banho Algodão Egípcio", qtd: "+50", user: "Sistema (IA)" },
  { id: 3, data: "Há 3 dias", tipo: "Ajuste Manual", produto: "Manta Microfibra Solteiro", qtd: "-1 (Avaria)", user: "Jean Dias" },
];

export default function EstoqueInteligentePage() {
  // 🛡️ ESTADOS DA TELA
  const [loading, setLoading] = useState(true);
  const [isInicializado, setIsInicializado] = useState(false);
  const [busca, setBusca] = useState("");
  const [abaGeral, setAbaGeral] = useState("lista"); // "lista" | "ia" | "historico"
  const [estoque, setEstoque] = useState(PRODUTOS_MOCK);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // 🚀 ESTADOS DO SUPER MODAL OMNI
  const [modalAberto, setModalAberto] = useState(false);
  const [abaModal, setAbaModal] = useState("geral"); 
  const [processando, setProcessando] = useState(false);
  
  const estadoProdutoVazio = {
    id: "", cod: "", nome: "", categoria: "", fornecedor: "", localizacao: "",
    preco_venda: "", custo: "", estoque: "", estoque_minimo: "5", 
    descricao_site: "", status_site: "Rascunho",
  };
  const [produtoEditando, setProdutoEditando] = useState(estadoProdutoVazio);

  // 🤖 ESTADOS DA I.A. (Leitura de Notas)
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [lendoIA, setLendoIA] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<any | null>(null);

  // 🧮 CÁLCULOS DO DASHBOARD
  const capitalParado = estoque.reduce((acc, p) => acc + (p.custo * p.estoque), 0);
  const produtosEsgotados = estoque.filter(p => p.estoque <= 0).length;
  const produtosRisco = estoque.filter(p => p.estoque > 0 && p.estoque <= p.estoque_minimo).length;
  const produtosNoSite = estoque.filter(p => p.status_site === "Publicado").length;

  const produtosFiltrados = useMemo(() => {
    return estoque.filter(p => 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      p.cod.includes(busca)
    );
  }, [busca, estoque]);

  // ==========================================================================
  // 🛡️ MEMÓRIA MUSCULAR DO MODAL DE PRODUTOS (DRAFT)
  // ==========================================================================
  useEffect(() => {
    const draftProduto = localStorage.getItem("@baply_estoque_draft_prod");
    const isModalDraftOpen = localStorage.getItem("@baply_estoque_draft_modal_open");

    if (draftProduto) setProdutoEditando(JSON.parse(draftProduto));
    if (isModalDraftOpen === "true") setModalAberto(true);

    setLoading(false);
    setIsInicializado(true);
  }, []);

  useEffect(() => {
    if (isInicializado) {
      if (modalAberto) {
        localStorage.setItem("@baply_estoque_draft_prod", JSON.stringify(produtoEditando));
        localStorage.setItem("@baply_estoque_draft_modal_open", "true");
      } else {
        localStorage.removeItem("@baply_estoque_draft_prod");
        localStorage.setItem("@baply_estoque_draft_modal_open", "false");
      }
    }
  }, [produtoEditando, modalAberto, isInicializado]);

  const handleAbrirModal = (prod: any = null) => {
    if (prod) {
      setProdutoEditando({
        id: prod.id, cod: prod.cod, nome: prod.nome, categoria: prod.categoria,
        fornecedor: prod.fornecedor || "", localizacao: prod.localizacao || "",
        preco_venda: prod.preco_venda.toString(), custo: prod.custo.toString(),
        estoque: prod.estoque.toString(), estoque_minimo: prod.estoque_minimo.toString(),
        descricao_site: prod.descricao_site || "", status_site: prod.status_site
      });
    } else {
      setProdutoEditando(estadoProdutoVazio);
    }
    setAbaModal("geral");
    setModalAberto(true);
    setMenuAbertoId(null);
  };

  const handleSalvarProduto = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessando(true);
    setTimeout(() => {
      toast.success("Produto salvo com sucesso!", { description: "Matriz de dados e E-commerce atualizados." });
      setProcessando(false);
      setModalAberto(false);
      setProdutoEditando(estadoProdutoVazio);
    }, 1500);
  };

  // 🤖 SIMULAÇÃO DO MOTOR MULTI-MODELO DE IA E INTEROPERABILIDADE
  const handleProcessarNotaIA = () => {
    if (!arquivoUpload) return toast.error("Anexe uma imagem ou PDF da nota fiscal primeiro.");
    setLendoIA(true);
    toast.info("Iniciando Motor de Visão Computacional...", { id: "ia-toast" });
    
    setTimeout(() => {
      setResultadoIA({
        fornecedor: "Indústria Têxtil Buddemeyer S.A.",
        cnpj: "00.000.000/0001-00",
        valor_total_nota: 2070.00,
        vencimento_boleto: "15/04/2026",
        itens: [
          { cod: "789456", nome: "Toalha Rosto Algodão", qtd: 50, custo: 18.50 },
          { cod: "789457", nome: "Fronha Algodão Premium", qtd: 50, custo: 22.90 }
        ]
      });
      setLendoIA(false);
      toast.success("Documento estruturado com sucesso!", { id: "ia-toast" });
    }, 2500);
  };

  const integrarFinanceiroEstoque = () => {
    toast.success("Integração 360º Concluída!", { 
      description: "100 itens adicionados ao estoque físico e Conta a Pagar gerada no Financeiro." 
    });
    setResultadoIA(null);
    setArquivoUpload(null);
  };

  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <PackageSearch size={14} /> Centro Logístico Baply
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Estoque Omni 360º</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Gerencie SKUs, rastreie movimentações e sincronize tudo com o Financeiro e o E-commerce.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setAbaGeral("ia")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm active:scale-95 group"
          >
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> Entrada Inteligente (I.A.)
          </button>
          <button 
            onClick={() => handleAbrirModal()}
            className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-900/20 hover:shadow-[#A67B5B]/30 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" /> Novo SKU
          </button>
        </div>
      </div>

      {/* 📊 DASHBOARD DE ESTOQUE (BENTO GRID) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm transition-colors group cursor-default">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Capital Parado</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign size={14}/></div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-white">R$ {capitalParado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
          <p className="text-[10px] font-medium text-stone-400 mt-1">Custo total das mercadorias (CMV)</p>
        </div>

        <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-2xl border border-red-100 dark:border-red-500/20 transition-colors relative overflow-hidden group cursor-default">
          <AlertOctagon size={80} className="absolute -right-4 -bottom-4 text-red-200 dark:text-red-900/30 opacity-50 group-hover:scale-110 transition-transform duration-700" />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Rupturas de Estoque</p>
          </div>
          <div className="text-3xl font-black text-red-700 dark:text-red-300 relative z-10">{produtosEsgotados} SKUs</div>
          <p className="text-[10px] font-bold text-red-500 mt-1 relative z-10 uppercase tracking-wider">Perda de vendas! Reponha já.</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-500/20 transition-colors group cursor-default">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest">Estoque de Risco</p>
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform"><TrendingDown size={14}/></div>
          </div>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-400">{produtosRisco} SKUs</div>
          <p className="text-[10px] font-medium text-amber-600/70 mt-1">Atingiram o limite de segurança</p>
        </div>

        <div className="bg-stone-900 dark:bg-stone-950 p-5 rounded-2xl border border-stone-800 shadow-xl transition-colors group cursor-default relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Sincronia E-commerce</p>
            <div className="w-8 h-8 rounded-full bg-white/10 text-blue-400 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700"><Globe size={14}/></div>
          </div>
          <div className="text-2xl font-black text-white relative z-10">{produtosNoSite} <span className="text-sm font-medium text-stone-400">Ativos no Site</span></div>
          <p className="text-[10px] font-bold text-blue-400 mt-1 relative z-10 uppercase tracking-wider">WordPress Sync: ONLINE</p>
        </div>
      </div>

      {/* 🧭 NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-stone-200 dark:border-stone-700 mb-8 transition-colors overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button onClick={() => setAbaGeral("lista")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaGeral === "lista" ? "border-[#A67B5B] text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <ListOrdered size={18} className={`transition-all ${abaGeral === "lista" ? "text-[#A67B5B] drop-shadow-[0_0_8px_rgba(166,123,91,0.5)] scale-110" : ""}`} /> Catálogo & Inventário
        </button>
        <button onClick={() => setAbaGeral("historico")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaGeral === "historico" ? "border-[#A67B5B] text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <History size={18} className={`transition-all ${abaGeral === "historico" ? "text-[#A67B5B] drop-shadow-[0_0_8px_rgba(166,123,91,0.5)] scale-110" : ""}`} /> Logística (Auditoria)
        </button>
        <button onClick={() => setAbaGeral("ia")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaGeral === "ia" ? "border-indigo-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Bot size={18} className={`transition-all ${abaGeral === "ia" ? "text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] scale-110" : ""}`} /> Compras Integradas (NFe I.A.)
        </button>
      </div>

      {/* ====================================================================== */}
      {/* --- ABA 1: A MASTER TABELA DE ESTOQUE --- */}
      {/* ====================================================================== */}
      {abaGeral === "lista" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors animate-in fade-in duration-300">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-stone-50/50 dark:bg-stone-900/30">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input 
                type="text" 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar SKU, Produto ou Categoria..." 
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all text-stone-900 dark:text-white font-medium shadow-sm" 
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors w-full md:w-auto justify-center">
              <Filter size={16} /> Filtros Avançados
            </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700 text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                  <th className="p-6">Produto & Ficha</th>
                  <th className="p-6">Fornecedor / Loc.</th>
                  <th className="p-6">Finanças</th>
                  <th className="p-6 w-48">Termômetro Físico</th>
                  <th className="p-6 text-center">Status Omni</th>
                  <th className="p-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-stone-500 dark:text-stone-400">
                      <PackageSearch size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="font-bold text-lg">Nenhum SKU encontrado no catálogo.</p>
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((prod) => {
                    const pctEstoque = Math.min((prod.estoque / (prod.estoque_minimo * 3)) * 100, 100);
                    const corBarra = prod.estoque <= 0 ? "bg-red-500" : prod.estoque <= prod.estoque_minimo ? "bg-amber-500" : "bg-emerald-500";
                    
                    return (
                      <tr key={prod.id} className="group hover:bg-stone-50 dark:hover:bg-stone-700/20 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden shrink-0 relative group-hover:border-[#A67B5B]/50 transition-colors">
                              {prod.imagem ? (
                                <img src={prod.imagem} alt={prod.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              ) : (
                                <ImageIcon size={20} className="text-stone-300 dark:text-stone-600" />
                              )}
                              {prod.variacoes.length > 0 && (
                                <div className="absolute bottom-0 right-0 bg-stone-900/80 text-white text-[8px] font-black px-1.5 py-0.5 rounded-tl-lg backdrop-blur-sm">
                                  +{prod.variacoes.length}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white group-hover:text-[#A67B5B] transition-colors leading-tight line-clamp-1">{prod.nome}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                                <span>{prod.categoria}</span> • <span className="font-mono">SKU: {prod.cod}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="p-6">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck size={12} className="text-stone-400" /> 
                            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">{prod.fornecedor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Layers size={12} className="text-stone-400" /> 
                            <span className="text-[10px] font-medium text-stone-500">{prod.localizacao}</span>
                          </div>
                        </td>

                        <td className="p-6">
                           <p className="text-sm font-black text-stone-900 dark:text-white">R$ {prod.preco_venda.toFixed(2).replace('.', ',')}</p>
                           <p className="text-xs font-medium text-stone-400">Custo: R$ {prod.custo.toFixed(2).replace('.', ',')}</p>
                        </td>
                        
                        <td className="p-6">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className={`text-sm font-black ${prod.estoque <= 0 ? 'text-red-500' : prod.estoque <= prod.estoque_minimo ? 'text-amber-500' : 'text-stone-900 dark:text-white'}`}>
                              {prod.estoque} un
                            </span>
                            <span className="text-[10px] font-bold text-stone-400">Mín: {prod.estoque_minimo}</span>
                          </div>
                          <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div className={`h-full ${corBarra} rounded-full transition-all duration-1000`} style={{ width: `${pctEstoque}%` }}></div>
                          </div>
                        </td>
                        
                        <td className="p-6 text-center">
                          {prod.status_site === "Publicado" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-shadow">
                              <Globe size={12} /> WP Sync
                            </span>
                          )}
                          {prod.status_site === "Rascunho" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-500 border border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700">
                              <Edit3 size={12} /> Draft
                            </span>
                          )}
                          {prod.status_site === "Oculto" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20">
                              <MonitorSmartphone size={12} /> Off-line
                            </span>
                          )}
                        </td>
                        
                        <td className="p-6 text-center relative z-10">
                          <button onClick={(e) => { e.stopPropagation(); setMenuAbertoId(menuAbertoId === prod.id ? null : prod.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-[#A67B5B] hover:bg-[#A67B5B]/10 dark:hover:text-[#A67B5B] dark:hover:bg-[#A67B5B]/10 transition-colors mx-auto group-hover:scale-110">
                            <MoreVertical size={18} />
                          </button>
                          {menuAbertoId === prod.id && (
                            <div className="absolute right-12 top-10 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl shadow-stone-900/10 border border-stone-100 dark:border-stone-700 z-[60] animate-in fade-in zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                              <div className="py-1">
                                <button onClick={() => handleAbrirModal(prod)} className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">
                                  <Edit3 size={14} /> Editar Omni
                                </button>
                                <div className="h-px bg-stone-100 dark:bg-stone-700 my-1"></div>
                                <button className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                  <Trash2 size={14} /> Excluir SKU
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* --- ABA 2: LOGÍSTICA E AUDITORIA (HISTÓRICO) --- */}
      {/* ====================================================================== */}
      {abaGeral === "historico" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors animate-in fade-in duration-300 min-h-[500px]">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30">
             <h3 className="font-black text-stone-900 dark:text-white flex items-center gap-2">
               <History size={18} className="text-[#A67B5B]" /> Log de Movimentações
             </h3>
             <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">Rastreie quem mexeu em qual produto e quando.</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {LOG_MOCK.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-stone-700/50 bg-stone-50 dark:bg-stone-900/30">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.qtd.includes('+') ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                       {log.qtd.includes('+') ? <ArrowUpRight size={16}/> : <ArrowDownRight size={16}/>}
                     </div>
                     <div>
                       <p className="font-bold text-stone-900 dark:text-white text-sm">{log.produto}</p>
                       <p className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                         <span>{log.data}</span> • <span>Via {log.tipo}</span> • <span className="font-bold">Usuário: {log.user}</span>
                       </p>
                     </div>
                  </div>
                  <div className={`font-black text-lg ${log.qtd.includes('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {log.qtd}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* --- ABA 3: O MOTOR DE IA E INTEGRAÇÃO FINANCEIRA --- */}
      {/* ====================================================================== */}
      {abaGeral === "ia" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-8 duration-500">
          
          <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <Bot size={32} />
            </div>
            
            <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Motor de Visão Computacional</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium max-w-sm mb-8">
              Anexe a Nota Fiscal. O sistema estruturará os produtos para o estoque e gerará a fatura a pagar no Módulo Financeiro automaticamente.
            </p>

            <div className="w-full max-w-md border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-8 bg-stone-50 dark:bg-stone-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group mb-6">
               <UploadCloud size={40} className="mx-auto text-indigo-300 dark:text-indigo-600 mb-3 group-hover:text-indigo-500 group-hover:-translate-y-1 transition-all" />
               <p className="text-sm font-bold text-stone-600 dark:text-stone-300 mb-1">Clique para anexar XML/PDF</p>
               <input 
                  type="file" className="hidden" id="fileUpload" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setArquivoUpload(e.target.files[0]);
                      toast.success("Arquivo anexado!");
                    }
                  }} 
                />
                <button onClick={() => document.getElementById('fileUpload')?.click()} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"></button>
            </div>

            {arquivoUpload && (
              <div className="flex items-center gap-3 bg-stone-100 dark:bg-stone-900 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 mb-6">
                <FileText size={16} className="text-indigo-500" />
                <span className="text-sm font-bold text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{arquivoUpload.name}</span>
                <button onClick={() => setArquivoUpload(null)} className="text-stone-400 hover:text-red-500"><X size={14}/></button>
              </div>
            )}

            <button 
              onClick={handleProcessarNotaIA} disabled={lendoIA || !arquivoUpload}
              className="w-full max-w-md flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {lendoIA ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="group-hover:scale-110 transition-transform" />} 
              {lendoIA ? "Lendo Pixels e Dados..." : "Extrair Informações e Custos"}
            </button>
          </div>

          {/* Resultado da Leitura e Integração */}
          <div className="bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 shadow-xl overflow-hidden flex flex-col relative min-h-[500px]">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-white/5">
              <h3 className="font-black text-white flex items-center gap-2">
                <Layers size={18} className="text-indigo-400" /> Integração 360º
              </h3>
              {resultadoIA && (
                <button onClick={() => {setResultadoIA(null); setArquivoUpload(null);}} className="text-xs font-bold text-stone-500 hover:text-red-400 transition-colors">Limpar Buffer</button>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col">
              {!resultadoIA ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-stone-500">
                    <MonitorSmartphone size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm text-center">Aguardando NFe do fornecedor.</p>
                 </div>
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Resumo Contábil</p>
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Fornecedor Identificado</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{resultadoIA.fornecedor}</h3>
                    <p className="text-sm text-stone-400 mb-3">CNPJ: {resultadoIA.cnpj}</p>
                    
                    <div className="flex justify-between items-end pt-3 border-t border-indigo-500/20">
                      <div>
                        <p className="text-xs text-stone-400">Total da Nota (Fatura a Pagar)</p>
                        <p className="text-sm font-bold text-rose-400">Vence em: {resultadoIA.vencimento_boleto}</p>
                      </div>
                      <p className="text-2xl font-black text-white">R$ {resultadoIA.valor_total_nota.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  
                  <div className="bg-stone-800/50 rounded-xl border border-stone-700 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-stone-800 border-b border-stone-700 text-[10px] uppercase tracking-widest text-stone-400">
                          <th className="p-4">SKU / Item para Estoque</th>
                          <th className="p-4 text-center">Qtd Entrando</th>
                          <th className="p-4 text-right">Custo Un.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-700/50">
                        {resultadoIA.itens.map((item: any, idx: number) => (
                          <tr key={idx} className="text-sm text-white">
                            <td className="p-4"><span className="text-xs font-bold text-stone-500 mr-2">#{item.cod}</span>{item.nome}</td>
                            <td className="p-4 text-center font-bold text-emerald-400">+{item.qtd}</td>
                            <td className="p-4 text-right text-stone-300">R$ {item.custo.toFixed(2).replace('.', ',')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button onClick={integrarFinanceiroEstoque} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-sm py-4 rounded-xl hover:bg-emerald-500 transition-all shadow-lg active:scale-[0.98]">
                    <CheckCircle2 size={18} /> Sincronizar Estoque & Lançar Despesa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 O SUPER MODAL OMNICHANNEL (CADASTRO/EDIÇÃO COM DRAFT) */}
      {/* ====================================================================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={() => setModalAberto(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-4xl h-[85vh] md:h-auto md:max-h-[90vh] rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-stone-900 dark:bg-stone-100 text-[#A67B5B] flex items-center justify-center shadow-lg">
                  <PackageSearch size={20} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 dark:text-white text-xl flex items-center gap-2">
                    {produtoEditando.id ? "Editar SKU Omnichannel" : "Cadastrar Novo Produto"}
                    {/* Badge de Rascunho se não tiver ID e já tiver nome digitado */}
                    {!produtoEditando.id && produtoEditando.nome && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Draft Salvo</span>}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Preencha e sincronize direto com a nuvem.</p>
                </div>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 p-2.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex overflow-x-auto border-b border-stone-100 dark:border-stone-800 px-6 bg-white dark:bg-stone-900 shrink-0 scrollbar-hide">
              <button onClick={() => setAbaModal("geral")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "geral" ? "border-[#A67B5B] text-[#A67B5B]" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <Tag size={16} /> Identidade & Relacionamento
              </button>
              <button onClick={() => setAbaModal("precos")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "precos" ? "border-[#A67B5B] text-[#A67B5B]" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <DollarSign size={16} /> Finanças & Logística Física
              </button>
              <button onClick={() => setAbaModal("ecommerce")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "ecommerce" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <Globe size={16} /> Loja Virtual (WooCommerce)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-stone-50/30 dark:bg-stone-900/10">
              <form id="form-produto" onSubmit={handleSalvarProduto}>
                
                {/* 🏷️ ABA 1: IDENTIDADE & FORNECEDOR */}
                {abaModal === "geral" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-2 block">Foto Principal</label>
                      <div className="w-full aspect-square bg-stone-100 dark:bg-stone-800 rounded-3xl border-2 border-dashed border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800/80 transition-all cursor-pointer group">
                        <UploadCloud size={32} className="mb-2 group-hover:scale-110 group-hover:text-[#A67B5B] transition-transform" />
                        <span className="text-xs font-bold">Upload Capa JPG</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-8 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome do Produto</label>
                        <input type="text" required value={produtoEditando.nome} onChange={(e) => setProdutoEditando({...produtoEditando, nome: e.target.value})} className="w-full px-4 py-3.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-base focus:outline-none focus:border-[#A67B5B] font-bold" placeholder="Ex: Jogo de Lençol Casal 400 Fios" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Cód. Fábrica (SKU)</label>
                          <input type="text" required value={produtoEditando.cod} onChange={(e) => setProdutoEditando({...produtoEditando, cod: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Categoria Principal</label>
                          <select value={produtoEditando.categoria} onChange={(e) => setProdutoEditando({...produtoEditando, categoria: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]">
                            <option value="">Selecione...</option><option value="Cama">Cama</option><option value="Banho">Banho</option><option value="Decoração">Decoração</option>
                          </select>
                        </div>
                      </div>
                      {/* 👇 NOVO: INTEROPERABILIDADE COM FORNECEDORES */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><Truck size={14}/> Fornecedor Pai (Integração Financeira)</label>
                        <select value={produtoEditando.fornecedor} onChange={(e) => setProdutoEditando({...produtoEditando, fornecedor: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]">
                          <option value="">Buscar na carteira de parceiros...</option>
                          <option value="Buddemeyer">Indústria Buddemeyer</option>
                          <option value="Karsten">Karsten S.A.</option>
                        </select>
                        <p className="text-[10px] text-stone-400">Vincular permite ao sistema deduzir contas a pagar automaticamente na leitura de NFes deste SKU.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 💰 ABA 2: FINANÇAS & ESTOQUE */}
                {abaModal === "precos" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Precificação Estratégica</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Custo Declarado (R$)</label>
                          <input type="number" step="0.01" required value={produtoEditando.custo} onChange={(e) => setProdutoEditando({...produtoEditando, custo: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-mono" placeholder="0.00" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><Calculator size={12}/> Sugestão I.A. (Mark-up)</label>
                          {/* Placeholder para sugestão de preço */}
                          <div className="w-full px-4 py-3 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-mono text-stone-400 cursor-not-allowed flex justify-between">
                            <span>Sugerido (2x):</span>
                            <span className="font-bold text-stone-500">R$ {Number(produtoEditando.custo) > 0 ? (Number(produtoEditando.custo) * 2).toFixed(2).replace('.', ',') : "0,00"}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Preço de Venda Final (R$)</label>
                          <input type="number" step="0.01" required value={produtoEditando.preco_venda} onChange={(e) => setProdutoEditando({...produtoEditando, preco_venda: e.target.value})} className="w-full px-4 py-3 bg-stone-900 text-[#A67B5B] border border-stone-800 rounded-xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-[#A67B5B] shadow-sm font-mono" placeholder="0.00" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Logística Física</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Estoque Real</label>
                          <input type="number" required value={produtoEditando.estoque} onChange={(e) => setProdutoEditando({...produtoEditando, estoque: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-base font-black" placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><AlertOctagon size={12}/> Alerta Mínimo</label>
                          <input type="number" required value={produtoEditando.estoque_minimo} onChange={(e) => setProdutoEditando({...produtoEditando, estoque_minimo: e.target.value})} className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-bold text-amber-900 dark:text-amber-100" />
                        </div>
                        {/* 👇 NOVO: LOCALIZAÇÃO FÍSICA PARA FACILITAR EXPEDIÇÃO */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Localização (Galpão/Loja)</label>
                          <input type="text" value={produtoEditando.localizacao} onChange={(e) => setProdutoEditando({...produtoEditando, localizacao: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:border-[#A67B5B]" placeholder="Ex: Corredor C, Prat. 4" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🌐 ABA 3: E-COMMERCE */}
                {abaModal === "ecommerce" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
                       <Globe size={24} className="text-blue-500 shrink-0 mt-1" />
                       <div>
                         <h4 className="font-bold text-blue-800 dark:text-blue-300">Hub WooCommerce Ativo</h4>
                         <p className="text-sm text-blue-600 dark:text-blue-400/80 mt-1">Ao marcar o status como "Publicado", as informações abaixo serão despachadas via API para a sua loja virtual instantaneamente.</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Descrição Rica (SEO Otimizado)</label>
                        <textarea 
                          value={produtoEditando.descricao_site} 
                          onChange={(e) => setProdutoEditando({...produtoEditando, descricao_site: e.target.value})} 
                          className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white resize-none" 
                          rows={6}
                          placeholder="Ex: Lençol luxuoso fabricado com fios de algodão egípcio para noites de sono inesquecíveis..."
                        ></textarea>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Sincronia Automática</label>
                          <select value={produtoEditando.status_site} onChange={(e) => setProdutoEditando({...produtoEditando, status_site: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold text-stone-900 dark:text-white">
                            <option value="Rascunho">📝 Draft Interno (Apenas Baply)</option>
                            <option value="Publicado">🌐 Sincronizar e Publicar no Site</option>
                            <option value="Oculto">👁️‍🗨️ Pausar Sincronização (Ocultar)</option>
                          </select>
                        </div>
                        
                        {/* 💡 VARIAÇÕES AVANÇADAS PRONTAS PARA O FUTURO */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><Tags size={12} /> Matriz de Variações</label>
                          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700 flex flex-col gap-2">
                             <div className="flex gap-2 flex-wrap">
                               <span className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded text-[10px] font-bold shadow-sm">Cor: Branco (8 un)</span>
                               <span className="px-2 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded text-[10px] font-bold shadow-sm">Cor: Bege (7 un)</span>
                             </div>
                             <button type="button" className="w-full py-2 bg-stone-200 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white rounded-md text-xs font-bold flex items-center justify-center gap-1 border border-dashed border-stone-400 dark:border-stone-600 transition-colors mt-1">
                               <Plus size={10} /> Adicionar Grade (Tamanho/Cor)
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex justify-between items-center shrink-0">
              <p className="text-xs font-medium text-stone-400 hidden md:block">Sistema Baply Omni: O salvamento atualiza o PDV, o Caixa e o E-commerce simultaneamente.</p>
              <div className="flex gap-3 w-full md:w-auto">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                  Fechar
                </button>
                <button form="form-produto" type="submit" disabled={processando} className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">
                  {processando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {processando ? "Sincronizando..." : "Salvar no Servidor"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
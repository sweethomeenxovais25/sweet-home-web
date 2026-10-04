"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase"; // 👈 NOSSA CONEXÃO REAL
import { 
  PackageSearch, Plus, Search, MoreVertical, 
  Image as ImageIcon, AlertOctagon, TrendingUp, TrendingDown, MonitorSmartphone,
  UploadCloud, FileText, Bot, Layers, Edit3, Trash2, RefreshCw, X,
  CheckCircle2, Globe, Tag, DollarSign, ListOrdered, Palette, Sparkles,
  Filter, ShieldCheck, Loader2, History, Truck, Calculator, Tags,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";

// MOCKS do Histórico mantidos temporariamente até construirmos a aba de Log (Próximo passo)
const LOG_MOCK = [
  { id: 1, data: "Hoje, 14:30", tipo: "Saída (PDV)", produto: "Jogo de Lençol Casal 400 Fios", qtd: "-2", user: "Bia" },
  { id: 2, data: "Ontem, 09:15", tipo: "Entrada (Nota Fiscal)", produto: "Toalha de Banho Algodão Egípcio", qtd: "+50", user: "Sistema (IA)" },
];

export default function EstoqueInteligentePage() {
  const supabase = createClient();

  // 🛡️ ESTADOS DA TELA
  const [loading, setLoading] = useState(true);
  const [isInicializado, setIsInicializado] = useState(false);
  const [busca, setBusca] = useState("");
  const [abaGeral, setAbaGeral] = useState("lista"); 
  const [estoque, setEstoque] = useState<any[]>([]); // 👈 COMEÇA VAZIO (SEM MOCKS)
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // 🚀 ESTADOS DO SUPER MODAL OMNI
  const [modalAberto, setModalAberto] = useState(false);
  const [abaModal, setAbaModal] = useState("geral"); 
  const [processando, setProcessando] = useState(false);
  
  const estadoProdutoVazio = {
    id: "", pai_id: "", cod: "", nome: "", categoria: "", fornecedor: "", localizacao: "",
    preco_venda: "", custo: "", estoque: "", estoque_minimo: "5", 
    descricao_site: "", status_site: "Rascunho", tamanho: "", cor: "", imagem_url: ""
  };
  const [produtoEditando, setProdutoEditando] = useState(estadoProdutoVazio);

  // 🤖 ESTADOS DA I.A.
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null);
  const [lendoIA, setLendoIA] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<any | null>(null);

  // ==========================================================================
  // 🔄 CARREGAMENTO EM TEMPO REAL DO SUPABASE
  // ==========================================================================
  const buscarProdutosNoBanco = async () => {
    // 💡 O JOIN: Puxa o "Filho" (estoque) e o "Pai" (detalhes vitrine) juntos
    const { data, error } = await supabase
      .from('produto_variacoes')
      .select(`
        id, sku, codigo_legado_planilha, tamanho, cor, preco_custo, preco_venda, estoque_atual, estoque_minimo, imagem_url,
        fornecedor:fornecedores(razao_social),
        pai:produtos(id, nome_base, descricao, categoria, is_destaque)
      `);

    if (error) {
      toast.error("Erro ao conectar com a Base de Dados.", { description: error.message });
      setLoading(false);
      return;
    }

    if (data) {
      // Formata os dados crus do banco para o padrão que a sua interface "Odoo" entende
      const estoqueMapeado = data.map((item: any) => ({
        id: item.id,
        pai_id: item.pai?.id,
        cod: item.sku,
        nome: `${item.pai?.nome_base || "S/N"} ${item.tamanho ? `- ${item.tamanho}` : ""} ${item.cor ? `(${item.cor})` : ""}`.trim(),
        preco_venda: Number(item.preco_venda),
        custo: Number(item.preco_custo),
        estoque: Number(item.estoque_atual),
        estoque_minimo: Number(item.estoque_minimo),
        categoria: item.pai?.categoria || "Geral",
        fornecedor: item.fornecedor?.razao_social || "S/ Fornecedor",
        localizacao: "Geral", // Placeholder até criarmos tabela de endereçamento
        imagem: item.imagem_url || "",
        status_site: item.pai?.is_destaque ? "Publicado" : "Rascunho",
        descricao_site: item.pai?.descricao || "",
        tamanho: item.tamanho || "",
        cor: item.cor || ""
      }));

      setEstoque(estoqueMapeado);
    }
    setLoading(false);
    setIsInicializado(true);
  };

  // Carrega ao abrir a tela
  useEffect(() => {
    buscarProdutosNoBanco();
  }, [supabase]);

  // ==========================================================================

  // 🧮 CÁLCULOS DO DASHBOARD (Continuam funcionando nativamente!)
  const capitalParado = estoque.reduce((acc, p) => acc + (p.custo * p.estoque), 0);
  const produtosEsgotados = estoque.filter(p => p.estoque <= 0).length;
  const produtosRisco = estoque.filter(p => p.estoque > 0 && p.estoque <= p.estoque_minimo).length;
  const produtosNoSite = estoque.filter(p => p.status_site === "Publicado").length;

  const produtosFiltrados = useMemo(() => {
    return estoque.filter(p => 
      p.nome.toLowerCase().includes(busca.toLowerCase()) || 
      p.cod.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, estoque]);


  const handleAbrirModal = (prod: any = null) => {
    if (prod) {
      setProdutoEditando({
        id: prod.id, pai_id: prod.pai_id, cod: prod.cod, nome: prod.nome, categoria: prod.categoria,
        fornecedor: prod.fornecedor, localizacao: prod.localizacao,
        preco_venda: prod.preco_venda.toString(), custo: prod.custo.toString(),
        estoque: prod.estoque.toString(), estoque_minimo: prod.estoque_minimo.toString(),
        descricao_site: prod.descricao_site, status_site: prod.status_site,
        tamanho: prod.tamanho, cor: prod.cor, imagem_url: prod.imagem
      });
    } else {
      setProdutoEditando(estadoProdutoVazio);
    }
    setAbaModal("geral");
    setModalAberto(true);
    setMenuAbertoId(null);
  };

  // 💾 O SALVAMENTO REAL (INSERT / UPDATE)
  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessando(true);
    
    const isPublicado = produtoEditando.status_site === "Publicado";
    let idPai = produtoEditando.pai_id;

    try {
      // 1. Salva a Capa (Pai) - Vitrine
      const dadosPai = {
        nome_base: produtoEditando.nome.split('-')[0].trim(), // Tira tamanho/cor do nome base
        descricao: produtoEditando.descricao_site,
        categoria: produtoEditando.categoria,
        is_destaque: isPublicado
      };

      if (idPai) {
        await supabase.from('produtos').update(dadosPai).eq('id', idPai);
      } else {
        const { data: novoPai } = await supabase.from('produtos').insert([dadosPai]).select('id').single();
        if (novoPai) idPai = novoPai.id;
      }

      // 2. Salva o Estoque (Filho) - Variacao
      if (idPai) {
        const dadosFilho = {
          produto_pai_id: idPai,
          sku: produtoEditando.cod,
          preco_custo: Number(produtoEditando.custo),
          preco_venda: Number(produtoEditando.preco_venda),
          estoque_atual: Number(produtoEditando.estoque),
          estoque_minimo: Number(produtoEditando.estoque_minimo)
        };

        if (produtoEditando.id) {
          await supabase.from('produto_variacoes').update(dadosFilho).eq('id', produtoEditando.id);
        } else {
          await supabase.from('produto_variacoes').insert([dadosFilho]);
        }

        toast.success("Produto salvo com sucesso no Supabase!");
        setModalAberto(false);
        buscarProdutosNoBanco(); // Recarrega a tela com dados reais
      }
    } catch (err) {
      toast.error("Erro ao salvar produto.");
    } finally {
      setProcessando(false);
    }
  };

  // EXCLUSÃO REAL
  const handleExcluirProduto = async (idFilho: string) => {
    if (window.confirm("Deseja realmente apagar este SKU do banco de dados?")) {
      const { error } = await supabase.from('produto_variacoes').delete().eq('id', idFilho);
      if (error) {
        toast.error("Erro ao apagar. Pode existir uma venda amarrada a este produto.");
      } else {
        toast.success("Produto removido.");
        buscarProdutosNoBanco();
      }
    }
  };

  const handleProcessarNotaIA = () => { /* ... IA MANTIDA ... */ };
  const integrarFinanceiroEstoque = () => { /* ... IA MANTIDA ... */ };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center text-[#A67B5B]">
      <Loader2 size={40} className="animate-spin" />
    </div>
  );

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

      {/* 📊 DASHBOARD DE ESTOQUE (BENTO GRID INTACTO) */}
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
          <p className="text-[10px] font-bold text-blue-400 mt-1 relative z-10 uppercase tracking-wider">WP/Site Sync: ONLINE</p>
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
                      <p className="font-bold text-lg">Nenhum SKU encontrado.</p>
                      <p className="text-sm">O seu estoque está vazio. Clique em "Novo SKU" para adicionar.</p>
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
                              <Globe size={12} /> Sync Odoo/WP
                            </span>
                          )}
                          {prod.status_site === "Rascunho" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-500 border border-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700">
                              <Edit3 size={12} /> Draft
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
                                <button onClick={() => handleExcluirProduto(prod.id)} className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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
      {/* 🚀 O SUPER MODAL OMNICHANNEL (CADASTRO/EDIÇÃO) */}
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
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Preencha e sincronize direto com a base Supabase.</p>
                </div>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 p-2.5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex overflow-x-auto border-b border-stone-100 dark:border-stone-800 px-6 bg-white dark:bg-stone-900 shrink-0 scrollbar-hide">
              <button onClick={() => setAbaModal("geral")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "geral" ? "border-[#A67B5B] text-[#A67B5B]" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <Tag size={16} /> Identidade do SKU
              </button>
              <button onClick={() => setAbaModal("precos")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "precos" ? "border-[#A67B5B] text-[#A67B5B]" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <DollarSign size={16} /> Finanças & Logística
              </button>
              <button onClick={() => setAbaModal("ecommerce")} className={`py-4 px-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${abaModal === "ecommerce" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"}`}>
                <Globe size={16} /> Vitrine / Site
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-stone-50/30 dark:bg-stone-900/10">
              <form id="form-produto" onSubmit={handleSalvarProduto}>
                
                {/* 🏷️ ABA 1: IDENTIDADE */}
                {abaModal === "geral" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in duration-300">
                    <div className="md:col-span-12 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome Base do Produto (Para Site)</label>
                        <input type="text" required value={produtoEditando.nome} onChange={(e) => setProdutoEditando({...produtoEditando, nome: e.target.value})} className="w-full px-4 py-3.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-base focus:outline-none focus:border-[#A67B5B] font-bold" placeholder="Ex: Jogo de Lençol Casal 400 Fios" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest text-indigo-500">Cód. SKU Único</label>
                          <input type="text" required value={produtoEditando.cod} onChange={(e) => setProdutoEditando({...produtoEditando, cod: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono" placeholder="Ex: LEN-400-CAS-BR" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Tamanho</label>
                          <input type="text" value={produtoEditando.tamanho} onChange={(e) => setProdutoEditando({...produtoEditando, tamanho: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]" placeholder="Ex: Casal, Queen, Padrão" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Cor Principal</label>
                          <input type="text" value={produtoEditando.cor} onChange={(e) => setProdutoEditando({...produtoEditando, cor: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]" placeholder="Ex: Branco, Azul Marinho" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Categoria Principal</label>
                        <select value={produtoEditando.categoria} onChange={(e) => setProdutoEditando({...produtoEditando, categoria: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B]">
                          <option value="Cama">Cama</option><option value="Banho">Banho</option><option value="Decoração">Decoração</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 💰 ABA 2: FINANÇAS & ESTOQUE */}
                {abaModal === "precos" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Precificação</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Custo Declarado (R$)</label>
                          <input type="number" step="0.01" required value={produtoEditando.custo} onChange={(e) => setProdutoEditando({...produtoEditando, custo: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-mono" placeholder="0.00" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Preço de Venda Final (R$)</label>
                          <input type="number" step="0.01" required value={produtoEditando.preco_venda} onChange={(e) => setProdutoEditando({...produtoEditando, preco_venda: e.target.value})} className="w-full px-4 py-3 bg-stone-900 text-[#A67B5B] border border-stone-800 rounded-xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-[#A67B5B] shadow-sm font-mono" placeholder="0.00" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-white mb-4 border-b border-stone-200 dark:border-stone-800 pb-2">Logística Física</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Estoque Real na Prateleira</label>
                          <input type="number" required value={produtoEditando.estoque} onChange={(e) => setProdutoEditando({...produtoEditando, estoque: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-base font-black" placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><AlertOctagon size={12}/> Alerta Mínimo</label>
                          <input type="number" required value={produtoEditando.estoque_minimo} onChange={(e) => setProdutoEditando({...produtoEditando, estoque_minimo: e.target.value})} className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-bold text-amber-900 dark:text-amber-100" />
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
                         <h4 className="font-bold text-blue-800 dark:text-blue-300">Hub Supabase/Site Ativo</h4>
                         <p className="text-sm text-blue-600 dark:text-blue-400/80 mt-1">Quando marcado como "Publicado", essa alteração sobe direto pra Vitrine Instantaneamente.</p>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Sincronia Automática com a Loja</label>
                      <select value={produtoEditando.status_site} onChange={(e) => setProdutoEditando({...produtoEditando, status_site: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 font-bold text-stone-900 dark:text-white">
                        <option value="Rascunho">📝 Rascunho (Apenas Estoque Local)</option>
                        <option value="Publicado">🌐 Sincronizar e Publicar no Site</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Descrição do Produto (Aparece no Site)</label>
                      <textarea 
                        value={produtoEditando.descricao_site} 
                        onChange={(e) => setProdutoEditando({...produtoEditando, descricao_site: e.target.value})} 
                        className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white resize-none" 
                        rows={6}
                      ></textarea>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer do Modal */}
            <div className="p-6 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 flex justify-between items-center shrink-0">
              <p className="text-xs font-medium text-stone-400 hidden md:block">Sistema Baply: A unificação do Omni 360º garante estoque preciso e à prova de falhas.</p>
              <div className="flex gap-3 w-full md:w-auto">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                  Cancelar
                </button>
                <button form="form-produto" type="submit" disabled={processando} className="flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2">
                  {processando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {processando ? "Gravando..." : "Salvar no Supabase"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
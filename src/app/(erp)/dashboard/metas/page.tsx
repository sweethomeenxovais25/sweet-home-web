"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Target, TrendingUp, Zap, Calendar, 
  CheckCircle2, Trophy, Loader2, X, History, ChevronRight,
  Plus, AlignLeft, BarChart3, Clock, Users, ShieldAlert
} from "lucide-react";

// 👇 Importando a Linha Mágica do Coração Baply!
import { usePerfil } from "@/contexts/PerfilContext"; 

// 🚀 O NOVO CHASSI ENTERPRISE DE DADOS (Pronto para o Supabase)
const METAS_ENTERPRISE = [
  { 
    id: "okr-001", 
    colaborador_id: "uuid-user-1",
    titulo: "Receita Recorrente (MRR)", 
    descricao: "Aumentar a base de assinaturas ativas na plataforma.",
    atual: 35000, 
    alvo: 50000, 
    tipo: "financeiro", 
    peso: 5, 
    prazo: "2026-03-31",
    cor: "bg-emerald-500", 
    glow: "group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
  },
  { 
    id: "okr-002", 
    colaborador_id: "uuid-user-1",
    titulo: "Novos Clientes B2B", 
    descricao: "Fechamento de contratos enterprise na região Sul.",
    atual: 18, 
    alvo: 40, 
    tipo: "quantitativo", 
    peso: 4, 
    prazo: "2026-03-31",
    cor: "bg-blue-500", 
    glow: "group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]" 
  },
  { 
    id: "okr-003", 
    colaborador_id: "uuid-user-1",
    titulo: "Satisfação do Cliente (NPS)", 
    descricao: "Manter a qualidade e tempo de resposta do suporte.",
    atual: 92, 
    alvo: 95, 
    tipo: "percentual", 
    peso: 3, 
    prazo: "2026-03-31",
    cor: "bg-indigo-500", 
    glow: "group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]" 
  },
];

export default function MinhasMetasPage() {
  const supabase = createClient();
  
  // 🪄 Puxando quem está logado para saber se é Chefe (Admin)
  const { nivel } = usePerfil();
  const isAdmin = nivel === "Admin";

  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<any[]>([]);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);

  // 🚀 ESTADOS DO NOVO MODAL DO GESTOR
  const [modalNovaMetaAberto, setModalNovaMetaAberto] = useState(false);
  const [processandoNovaMeta, setProcessandoNovaMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState({
    titulo: "",
    descricao: "",
    tipo: "financeiro",
    alvo: "",
    peso: "3",
    prazo: "",
    colaborador_id: "todos" // Mock: Na vida real seria um select com a equipe
  });

  useEffect(() => {
    async function carregarMetas() {
      // Futuro código Supabase:
      // const { data } = await supabase.from('metas_colaborador').select('*').eq('colaborador_id', user.id);
      
      setTimeout(() => {
        setMetas(METAS_ENTERPRISE);
        setLoading(false);
      }, 600);
    }
    carregarMetas();
  }, [supabase]);

  // 🚀 FUNÇÃO PARA O GESTOR LANÇAR A META
  const handleLancarMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessandoNovaMeta(true);
    
    try {
      // Simula o tempo de salvar no Supabase
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Meta delegada com sucesso!", {
        description: `O objetivo "${novaMeta.titulo}" foi ativado no painel da equipe.`
      });
      
      setModalNovaMetaAberto(false);
      setNovaMeta({ titulo: "", descricao: "", tipo: "financeiro", alvo: "", peso: "3", prazo: "", colaborador_id: "todos" });
    } catch (erro) {
      toast.error("Erro ao delegar meta.");
    } finally {
      setProcessandoNovaMeta(false);
    }
  };

  // Funções de formatação visual
  const formatarValor = (valor: number, tipo: string) => {
    if (tipo === "financeiro") return `R$ ${valor.toLocaleString('pt-BR')}`;
    if (tipo === "percentual") return `${valor}%`;
    return `${valor} un`;
  };

  const calcularDiasRestantes = (dataPrazo: string) => {
    const hoje = new Date();
    const prazo = new Date(dataPrazo);
    const diffTime = prazo.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Calculando matriz de performance...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🎯 CABEÇALHO DO MÓDULO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold mb-4 border border-amber-100 dark:border-amber-500/20 shadow-sm">
            <Target size={14} className="animate-pulse" /> Ciclo de Março/2026
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Matriz de OKRs</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Acompanhe a evolução estratégica, pontuação e metas do ciclo atual.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setIsHistoricoOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all shadow-sm active:scale-95 group"
          >
            <History size={16} className="text-stone-400 group-hover:text-[#A67B5B] transition-colors" /> Histórico
          </button>

          {/* 👇 BOTÃO EXCLUSIVO DO GESTOR */}
          {isAdmin && (
            <button 
              onClick={() => setModalNovaMetaAberto(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 dark:bg-stone-100 text-[#A67B5B] dark:text-stone-900 border border-stone-900 dark:border-stone-100 rounded-xl text-sm font-black hover:bg-stone-800 dark:hover:bg-white transition-all shadow-lg shadow-stone-900/20 hover:shadow-[#A67B5B]/30 active:scale-95 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Delegar Nova Meta
            </button>
          )}
        </div>
      </div>

      {/* 🏆 PLACAR GERAL (Scorecard Bento Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        <div className="xl:col-span-2 bg-stone-900 dark:bg-stone-950 rounded-[2rem] p-8 border border-stone-800 shadow-xl relative overflow-hidden group flex flex-col md:flex-row items-center gap-8 justify-between cursor-default">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity duration-700"></div>
          
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-lg font-black text-white flex items-center justify-center md:justify-start gap-2 mb-1">
              <Trophy className="text-amber-400 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-300" size={20} /> 
              Score de Performance
            </h2>
            <p className="text-stone-400 text-sm mb-6">Você está entre os 10% melhores da equipe este mês!</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2 group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-6xl font-black text-white tracking-tighter">845</span>
              <span className="text-amber-400 font-bold text-sm uppercase tracking-widest">Pontos</span>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end">
            <div className="w-32 h-32 rounded-full border-8 border-white/10 flex items-center justify-center relative group-hover:drop-shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all duration-500">
               <div className="absolute inset-0 border-8 border-amber-400 rounded-full border-t-transparent border-l-transparent rotate-45 group-hover:rotate-90 transition-transform duration-1000"></div>
               <div className="text-center">
                 <Zap size={24} className="text-amber-400 mx-auto mb-1 animate-pulse" />
                 <span className="text-white font-black text-xl"> Nv. 4</span>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-[2rem] p-8 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-center items-center text-center group cursor-default transition-colors">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-all duration-500">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-1 group-hover:-translate-y-1 transition-transform duration-300">12 Dias</h3>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Batendo a meta diária</p>
        </div>

      </div>

      {/* 📊 BARRAS DE PROGRESSO DAS METAS ENTERPRISE */}
      <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center">
          <h3 className="font-black text-stone-900 dark:text-white text-xl flex items-center gap-2">
            Objetivos Principais (OKRs)
          </h3>
          <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest hidden md:flex gap-8">
            <span>Peso Estratégico</span>
            <span>Prazo Final</span>
          </div>
        </div>
        
        <div className="p-8 space-y-10">
          {metas.map((meta) => {
            const porcentagem = Math.min(Math.round((meta.atual / meta.alvo) * 100), 100);
            const diasRestantes = calcularDiasRestantes(meta.prazo);
            
            return (
              <div key={meta.id} className="group cursor-default relative">
                {/* Meta Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-3 gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-stone-900 dark:text-white text-lg flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                      {meta.titulo} 
                      {porcentagem >= 100 && <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 font-medium group-hover:translate-x-1 transition-transform mt-0.5">
                      {meta.descricao}
                    </p>
                  </div>

                  {/* Informações Extras (Visão Enterprise) */}
                  <div className="flex items-end gap-6">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-400 mb-1 justify-end">
                        <Target size={12} /> Peso {meta.peso}x
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-bold justify-end ${diasRestantes < 5 ? 'text-red-500' : 'text-stone-400'}`}>
                        <Clock size={12} /> {diasRestantes} dias restantes
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-stone-900 dark:text-white group-hover:text-stone-700 dark:group-hover:text-stone-300 transition-colors">
                        {formatarValor(meta.atual, meta.tipo)}
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 font-medium ml-1">
                        / {formatarValor(meta.alvo, meta.tipo)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* A Barra de Progresso Animada */}
                <div className="h-4 w-full bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full ${meta.cor} rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-inner`}
                    style={{ width: `${porcentagem}%` }}
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs font-bold transition-all duration-500 ${meta.glow.replace('group-hover:', '')} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 ${meta.cor.replace('bg-', 'text-')}`}>
                    +{porcentagem}% Concluído
                  </span>
                  <span className="text-xs font-medium text-stone-400 group-hover:text-stone-500 dark:group-hover:text-stone-300 transition-colors md:hidden">
                    Restam {diasRestantes} dias
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🚀 O NOVO MODAL DO GESTOR: LANÇAR NOVA META */}
      {modalNovaMetaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalNovaMetaAberto(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-2xl rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-100 text-[#A67B5B] flex items-center justify-center shadow-lg">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 dark:text-white text-lg">Delegar Nova Meta (OKR)</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Defina alvos estratégicos para a sua tropa.</p>
                </div>
              </div>
              <button onClick={() => setModalNovaMetaAberto(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLancarMeta} className="p-8 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Título do Objetivo</label>
                <div className="relative">
                  <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" required value={novaMeta.titulo} onChange={(e) => setNovaMeta({...novaMeta, titulo: e.target.value})} 
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all dark:text-white" 
                    placeholder="Ex: Aquisição de Novos Clientes" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Descrição Estratégica</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-stone-400" size={18} />
                  <textarea 
                    required value={novaMeta.descricao} onChange={(e) => setNovaMeta({...novaMeta, descricao: e.target.value})} 
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all dark:text-white resize-none" 
                    placeholder="Qual o propósito dessa meta?" rows={2}
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex justify-between">
                    Delegar Para <span className="text-[#A67B5B] font-black"><ShieldAlert size={10} className="inline mr-1"/>Admin</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <select value={novaMeta.colaborador_id} onChange={(e) => setNovaMeta({...novaMeta, colaborador_id: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all appearance-none font-medium text-stone-700 dark:text-stone-300">
                      <option value="todos">Toda a Equipe (Meta Global)</option>
                      <option value="user-1">Maria Silva (Vendas)</option>
                      <option value="user-2">Carlos Mendes (Financeiro)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Peso Estratégico (1 a 5)</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                    <select value={novaMeta.peso} onChange={(e) => setNovaMeta({...novaMeta, peso: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all appearance-none font-black text-amber-600 dark:text-amber-500">
                      <option value="1">1x - Opcional / Bônus</option>
                      <option value="2">2x - Relevante</option>
                      <option value="3">3x - Importante</option>
                      <option value="4">4x - Alta Prioridade</option>
                      <option value="5">5x - Missão Crítica</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Tipo de Métrica</label>
                  <select value={novaMeta.tipo} onChange={(e) => setNovaMeta({...novaMeta, tipo: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all appearance-none font-medium text-stone-700 dark:text-stone-300">
                    <option value="financeiro">Monetário (R$)</option>
                    <option value="percentual">Porcentagem (%)</option>
                    <option value="quantitativo">Unidades (Qtd)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Alvo a Atingir</label>
                  <input type="number" required value={novaMeta.alvo} onChange={(e) => setNovaMeta({...novaMeta, alvo: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all dark:text-white" placeholder="Ex: 50000" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalNovaMetaAberto(false)} className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
                <button type="submit" disabled={processandoNovaMeta} className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  {processandoNovaMeta ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {processandoNovaMeta ? "Calculando..." : "Salvar no Banco (Mock)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 SLIDE-OVER: PAINEL DE HISTÓRICO MANTIDO INTACTO */}
      {isHistoricoOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsHistoricoOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/50">
              <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <History size={20} className="text-[#A67B5B]" /> Histórico de Metas
              </h2>
              <button onClick={() => setIsHistoricoOpen(false)} className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-8 before:bottom-[-32px] before:w-[2px] before:bg-stone-100 dark:before:bg-stone-800">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white dark:border-stone-900"><CheckCircle2 size={12} /></div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-widest">Fevereiro / 2026</h3>
                </div>
                <div className="ml-9 p-5 rounded-[1rem] border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-sm group hover:border-[#A67B5B]/50 transition-colors">
                  <div className="flex justify-between items-center mb-3"><span className="font-bold text-stone-900 dark:text-white">Score Final</span><span className="text-emerald-500 font-black text-lg">920 pts</span></div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">Você atingiu 105% da meta de vendas e foi o destaque do mês.</p>
                  <button className="text-xs font-bold text-[#A67B5B] flex items-center gap-1 hover:gap-2 transition-all">Ver relatório <ChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
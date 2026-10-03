"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { 
  CheckCircle2, Clock, Target, Fingerprint, ShieldAlert, 
  LogOut, Loader2, LayoutDashboard, TrendingUp, DollarSign, 
  ShoppingCart, Package, AlertTriangle, ArrowRight, User, 
  Bell, Activity, CreditCard, CalendarDays
} from "lucide-react";
import { toast } from "sonner";
// 👇 IMPORTAMOS A LINHA MÁGICA DO NOSSO CORAÇÃO
import { usePerfil } from "@/contexts/PerfilContext"; 

export default function DashboardPage() {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [processandoPonto, setProcessandoPonto] = useState(false);
  const [pontoBatido, setPontoBatido] = useState(false);
  const [pontoId, setPontoId] = useState<string | null>(null);

  // 🪄 A LINHA MÁGICA: O Crachá agora pega os dados vivos do Coração
  const { nome, cargo, nivel, avatar_url } = usePerfil();

  // (Mock) Mantemos o código fixo por enquanto
  const codigoFuncionario = "ID: BPL-001";

  // Saudação Dinâmica
  const [saudacao, setSaudacao] = useState("Olá");

  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) setSaudacao("Bom dia");
    else if (hora < 18) setSaudacao("Boa tarde");
    else setSaudacao("Boa noite");

    // 🚀 LÓGICA ANTI-TRAVAMENTO (Lê o cache instantâneo em vez de ir ao servidor)
    async function carregarDados() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Busca o último ponto
          const { data: historicoPonto, error } = await supabase
            .from("registro_ponto")
            .select("*")
            .eq("user_id", session.user.id)
            .order("hora_entrada", { ascending: false })
            .limit(1);

          if (!error && historicoPonto && historicoPonto.length > 0) {
            if (historicoPonto[0].hora_saida === null) {
              setPontoBatido(true);
              setPontoId(historicoPonto[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Erro silencioso ao buscar ponto:", error);
      } finally {
        // Aconteça o que acontecer, libera a tela! Fim do bug do F5.
        setLoading(false);
      }
    }
    
    carregarDados();
  }, [supabase]);

  const handlePonto = async () => {
    setProcessandoPonto(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      setProcessandoPonto(false);
      return;
    }

    if (!pontoBatido) {
      // ENTRADA
      const { data, error } = await supabase.from("registro_ponto").insert([
        { user_id: user.id, status: 'Em Operação' }
      ]).select();

      if (error) {
        toast.error(`Erro ao bater ponto: ${error.message}`);
      } else {
        toast.success("Ponto digital registrado com sucesso!", {
          description: "Seu turno foi iniciado no banco de dados."
        });
        setPontoBatido(true);
        if (data && data.length > 0) setPontoId(data[0].id);
      }
    } else if (pontoId) {
      // SAÍDA
      const horaAgora = new Date().toISOString();
      const { error } = await supabase
        .from("registro_ponto")
        .update({ hora_saida: horaAgora, status: 'Turno Encerrado' })
        .eq("id", pontoId);

      if (error) {
        toast.error(`Erro ao encerrar expediente: ${error.message}`);
      } else {
        toast.success("Expediente encerrado com sucesso!", {
          description: "Bom descanso."
        });
        setPontoBatido(false);
        setPontoId(null);
      }
    }
    setProcessandoPonto(false);
  };

  // 🚀 MOCKS DO DASHBOARD OPERACIONAL
  const faturamentoHoje = 1450.90;
  const ticketMedio = 145.09;
  const vendasHoje = 10;
  
  const alertas = [
    { id: 1, msg: "Manta Microfibra Solteiro esgotou.", icone: Package, cor: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
    { id: 2, msg: "Aluguel da Loja vence em 3 dias.", icone: AlertTriangle, cor: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p>Conectando ao Cérebro Baply...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO GLOBAL */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <Activity size={14} className="animate-pulse" /> Status do Sistema: Online
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">
            {saudacao}, {nome ? nome.split(' ')[0] : 'Gestor'}! 👋
          </h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors flex items-center gap-2">
            <CalendarDays size={16} /> Resumo operacional de hoje, {new Date().toLocaleDateString('pt-BR')}.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors shadow-sm">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-stone-800"></span>
          </button>
          <Link href="/dashboard/vendas" className="flex items-center gap-2 bg-[#A67B5B] hover:bg-[#8e694d] text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-lg shadow-[#A67B5B]/30 active:scale-95 group">
            <ShoppingCart size={18} className="group-hover:-translate-x-1 transition-transform" /> Abrir PDV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* ========================================== */}
        {/* COLUNA 1: O CRACHÁ VIRTUAL (INTACTO E PERFEITO) */}
        {/* ========================================== */}
        <div className="col-span-1 space-y-6">
          <div className="bg-stone-900 rounded-[2rem] shadow-2xl shadow-stone-900/40 overflow-hidden relative border border-stone-800 group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#A67B5B] rounded-full blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
            
            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div className="w-24 h-24 rounded-3xl bg-stone-100 border-4 border-[#A67B5B]/30 shadow-xl flex items-center justify-center text-5xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                  {avatar_url ? (
                    <img src={avatar_url} alt="Avatar do Crachá" className="w-full h-full object-cover" />
                  ) : (
                    "👨‍💼"
                  )}
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800/80 border border-stone-700 text-[10px] font-black text-[#A67B5B] uppercase tracking-[0.2em] backdrop-blur-md">
                    <Fingerprint size={12} /> {codigoFuncionario}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">{nome ? nome : "Carregando..."}</h2>
                <p className="text-[#A67B5B] font-bold text-xs uppercase tracking-widest pb-6">{cargo}</p>
                
                <div className="space-y-3 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-stone-400 font-medium">Credencial</span>
                    <span className="font-bold text-stone-100 flex items-center gap-2">
                      <ShieldAlert size={14} className="text-[#A67B5B]" /> {nivel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[13px]">
                    <span className="text-stone-400 font-medium">Status</span>
                    <span className={`font-bold flex items-center gap-2 ${pontoBatido ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {pontoBatido ? <CheckCircle2 size={14} /> : <Clock size={14} />} 
                      {pontoBatido ? "Em Operação" : "Aguardando Ponto"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePonto}
            disabled={processandoPonto}
            className={`w-full py-5 px-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              processandoPonto ? "opacity-50 cursor-not-allowed" : ""
            } ${
              pontoBatido 
                ? "bg-stone-200 text-stone-500 shadow-stone-200/20 hover:bg-stone-300" 
                : "bg-stone-950 text-white shadow-stone-950/40 hover:bg-stone-800 hover:scale-[1.02] active:scale-95"
            }`}
          >
            {processandoPonto ? <Loader2 size={18} className="animate-spin" /> : pontoBatido ? <LogOut size={18} /> : <Fingerprint size={18} />}
            {processandoPonto ? "Sincronizando..." : pontoBatido ? "Encerrar Expediente" : "Bater Ponto Digital"}
          </button>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 E 3: A ÁREA DE PERFORMANCE VIVA! */}
        {/* ========================================== */}
        <div className="col-span-1 xl:col-span-2 space-y-6">
          
          {/* Topo: Cards de Venda e Ticket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-stone-800 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <TrendingUp size={24} strokeWidth={2.5}/>
                </div>
                <span className="px-3 py-1 bg-stone-100 dark:bg-stone-900 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Faturamento Hoje</span>
              </div>
              <div>
                <h3 className="text-4xl font-black text-stone-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">
                  R$ {faturamentoHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </h3>
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1"><ArrowRight size={12} className="-rotate-45"/> +15% vs ontem</p>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-default">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                  <CreditCard size={24} strokeWidth={2.5}/>
                </div>
                <span className="px-3 py-1 bg-stone-100 dark:bg-stone-900 text-stone-500 text-[10px] font-black uppercase tracking-widest rounded-lg">Ticket Médio</span>
              </div>
              <div>
                <h3 className="text-4xl font-black text-stone-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">
                  R$ {ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </h3>
                <p className="text-xs font-bold text-stone-500">Qualidade de vendas ({vendasHoje} pedidos)</p>
              </div>
            </div>
          </div>

          {/* Base: Alertas e Atalhos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Alertas */}
            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-6 flex flex-col">
              <h3 className="font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell size={18} className="text-amber-500" /> Radar Operacional
              </h3>
              <div className="space-y-3 flex-1">
                {alertas.map((alerta) => (
                  <div key={alerta.id} className={`p-4 rounded-xl border border-stone-100 dark:border-stone-700/50 flex items-center gap-3 ${alerta.bg} bg-opacity-50 dark:bg-opacity-20`}>
                    <alerta.icone size={18} className={`shrink-0 ${alerta.cor}`} />
                    <p className={`text-sm font-bold text-stone-700 dark:text-stone-300 leading-snug`}>{alerta.msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Atalhos Rápidos */}
            <div className="bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 shadow-lg p-6 relative overflow-hidden flex flex-col">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
              <h3 className="font-black text-white mb-4 flex items-center gap-2 relative z-10">
                <LayoutDashboard size={18} className="text-blue-400" /> Acesso Rápido
              </h3>
              
              <div className="grid grid-cols-2 gap-3 relative z-10 flex-1 content-start">
                <Link href="/dashboard/estoque" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                  <Package size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-300">Inventário</span>
                </Link>
                <Link href="/dashboard/financeiro" className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center justify-center text-center gap-2 group">
                  <DollarSign size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-stone-300">Financeiro</span>
                </Link>
                <Link href="/dashboard/marketing" className="col-span-2 p-4 rounded-xl bg-[#A67B5B]/20 border border-[#A67B5B]/30 hover:bg-[#A67B5B]/30 transition-colors flex items-center justify-center text-center gap-2 group">
                  <span className="text-sm font-black text-[#A67B5B] group-hover:scale-105 transition-transform flex items-center gap-2">Abrir Estúdio de Marketing <ArrowRight size={14}/></span>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
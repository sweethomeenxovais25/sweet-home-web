"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  Megaphone, LayoutGrid, CalendarDays, Wand2, 
  BarChart2, Share2, Plus, Instagram, Youtube, 
  CheckCircle2, Loader2, PlaySquare, Image as ImageIcon,
  MoreVertical, Clock, TrendingUp, Users, Link2, Sparkles,
  FileText, Music, Hash, Trash2, Edit3, Type, Timer, Search // 👈 A Lupa do Google voltou para casa!
} from "lucide-react";

// 🚀 BANCO DE DADOS DO KANBAN (Refatorado para o Drag & Drop funcionar)
const TAREFAS_INICIAIS = [
  { id: "MKT-101", titulo: "Roteiro Reels: Lençol 400 Fios", formato: "Reels", rede: "Instagram", prazo: "22/03/2026", coluna: "fila", autor: "Bia" },
  { id: "MKT-102", titulo: "Bastidores da Loja (Tour)", formato: "Shorts", rede: "YouTube", prazo: "25/03/2026", coluna: "fila", autor: "Bia" },
  { id: "MKT-100", titulo: "Carrossel: Como cuidar da Toalha", formato: "Feed", rede: "Instagram", prazo: "21/03/2026", coluna: "producao", autor: "Jean" },
  { id: "MKT-099", titulo: "Promoção Dia das Mães", formato: "Story", rede: "Instagram", prazo: "20/03/2026", coluna: "agendado", autor: "Bia" }
];

export default function MarketingStudioPage() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard"); // "dashboard" | "kanban" | "ia" | "conexoes"
  
  // Estados do Kanban (Drag & Drop)
  const [tarefas, setTarefas] = useState(TAREFAS_INICIAIS);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  // Estados da IA
  const [loadingIA, setLoadingIA] = useState(false);
  const [resultadoIA, setResultadoIA] = useState("");
  const [plataformaIA, setPlataformaIA] = useState("Instagram Reels");
  const [tempoIA, setTempoIA] = useState("15 Segundos");
  const [objetivoIA, setObjetivoIA] = useState("Venda Direta / Desejo");

  // 🚀 LÓGICA DE DRAG AND DROP NATIVO
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
    e.currentTarget.classList.add('opacity-50'); // Efeito visual ao arrastar
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessário para permitir o drop
  };

  const handleDrop = (e: React.DragEvent, novaColuna: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("taskId");
    
    // Atualiza a coluna da tarefa arrastada
    setTarefas(prev => prev.map(t => {
      if (t.id === id && t.coluna !== novaColuna) {
        toast.success(`Tarefa movida para ${novaColuna === 'producao' ? 'Produção' : novaColuna === 'agendado' ? 'Agendado' : 'Fila'}!`);
        return { ...t, coluna: novaColuna };
      }
      return t;
    }));
  };

  // Ações do Menu de 3 Pontinhos
  const moverTarefaMenu = (id: string, novaColuna: string) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, coluna: novaColuna } : t));
    setMenuAbertoId(null);
    toast.success("Status atualizado!");
  };

  const excluirTarefa = (id: string) => {
    if(window.confirm("Deseja realmente excluir esta pauta?")) {
      setTarefas(prev => prev.filter(t => t.id !== id));
      setMenuAbertoId(null);
      toast.warning("Tarefa excluída do Kanban.");
    }
  };

  // 🚀 MOTOR DE IA TURBINADO
  const simularGeracaoIA = () => {
    setLoadingIA(true);
    setTimeout(() => {
      setResultadoIA(`
**🎬 Roteiro Estratégico: ${plataformaIA}**
*⏱️ Duração Alvo: ${tempoIA}*
*🎯 Objetivo: ${objetivoIA}*
*🎵 Áudio em Alta Sugerido: "Aesthetic Lofi" ou Viral do TikTok atual.*

**[0:00 - 0:03] - O Gancho (Retenção de Atenção)**
*Câmera filma um lençol comum, amassado e áspero. Transição rápida com estalo de dedos.*
**Texto na tela:** "Acordando cansada mesmo depois de 8h de sono? 😴"

**[0:03 - 0:08] - A Solução (Apresentação Visual)**
*Alguém joga o Lençol 400 Fios Algodão Egípcio Baply sobre a cama em câmera lenta. Ele cai perfeitamente liso.*
**Texto na tela:** "O segredo dos hotéis 5 estrelas agora no seu quarto. ✨"

**[0:08 - ${tempoIA === '15 Segundos' ? '0:12' : '0:20'}] - Prova Social / Detalhe ASMR**
*Close-up extremo da mão deslizando suavemente pelo tecido (ASMR).*
**Locução (Voz natural):** "400 fios reais. Um toque acetinado que abraça a sua pele a noite toda."

**[Últimos 3 Segundos] - Chamada para Ação (CTA)**
*Vídeo da cama luxuosa arrumada. Aparece um botão de clique fictício.*
**Texto na tela:** "Transforme suas noites. Link na bio! 🛒👇"

---
**📝 Legenda Otimizada (SEO para Algoritmo):**
Você sabia que a qualidade do seu lençol impacta diretamente na sua energia no dia seguinte? 😱 Pare de brigar com tecidos ásperos. Conheça nosso campeão de vendas: Jogo de Lençol 400 Fios. Toque de seda, durabilidade extrema e conforto de hotel luxuoso. 
Toque no link da nossa BIO e garanta o seu antes que o lote esgote! 🌙✨

**Hashtags Estratégicas:** #EnxovalDeLuxo #QuartoDecorado #SonoPerfeito #ArquiteturaDeInteriores #SweetHome
      `);
      setLoadingIA(false);
      toast.success("Conteúdo de alta performance gerado!");
    }, 2500);
  };

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold mb-4 border border-fuchsia-100 dark:border-fuchsia-500/20 shadow-sm">
            <Megaphone size={14} className="animate-pulse" /> Marketing Studio
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Growth & Redes Sociais</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Gerencie seu funil de conteúdo, crie roteiros virais e conecte suas contas (APIs).
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setAbaAtiva("ia")}
            className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-900/20 hover:shadow-[#A67B5B]/30 hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] dark:hover:text-white active:scale-95 group"
          >
            <Wand2 size={18} className="group-hover:scale-110 transition-transform" /> Copywriter I.A.
          </button>
        </div>
      </div>

      {/* MENU DE NAVEGAÇÃO INTERNO */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-stone-200 dark:border-stone-700 mb-8 transition-colors">
        <button onClick={() => setAbaAtiva("dashboard")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "dashboard" ? "border-fuchsia-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <BarChart2 size={18} className={`transition-all ${abaAtiva === "dashboard" ? "text-fuchsia-500 scale-110" : ""}`} /> Performance & Trends
        </button>
        <button onClick={() => setAbaAtiva("kanban")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "kanban" ? "border-fuchsia-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <LayoutGrid size={18} className={`transition-all ${abaAtiva === "kanban" ? "text-fuchsia-500 scale-110" : ""}`} /> Estúdio de Produção
        </button>
        <button onClick={() => setAbaAtiva("ia")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "ia" ? "border-fuchsia-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Sparkles size={18} className={`transition-all ${abaAtiva === "ia" ? "text-fuchsia-500 scale-110" : ""}`} /> Copywriter (I.A.)
        </button>
        <button onClick={() => setAbaAtiva("conexoes")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "conexoes" ? "border-blue-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Share2 size={18} className={`transition-all ${abaAtiva === "conexoes" ? "text-blue-500 scale-110" : ""}`} /> Hub Omnichannel
        </button>
      </div>

      {/* ========================================== */}
      {/* ABA 1: PERFORMANCE E TRENDS (NOVO!) */}
      {/* ========================================== */}
      {abaAtiva === "dashboard" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-4 right-4 bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Instagram size={28} />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Instagram Alcance</h3>
              <div className="text-4xl font-black mb-4">124.5K <span className="text-sm font-medium opacity-80">contas</span></div>
              <div className="flex items-center gap-2 text-sm font-bold bg-white/20 w-max px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <TrendingUp size={16} /> +12% vs mês anterior
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-[2rem] p-6 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Link2 size={20} strokeWidth={3}/></div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg">Conversão Web</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1">Cliques no Link da Bio</p>
                <h3 className="text-3xl font-black text-stone-900 dark:text-white group-hover:translate-x-1 transition-transform">1.432</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-[2rem] p-6 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Users size={20} strokeWidth={3}/></div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-lg">Google/Meta Ads</span>
              </div>
              <div>
                <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1">Custo de Aquisição (CAC)</p>
                <h3 className="text-3xl font-black text-stone-900 dark:text-white group-hover:translate-x-1 transition-transform">R$ 14,50</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* WIDGET DE TRENDS (NOVO!) */}
            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 p-8 shadow-sm">
              <h3 className="text-lg font-black text-stone-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-fuchsia-500"/> Trend Analyzer (Seu Nicho)
              </h3>
              
              <div className="space-y-4">
                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center"><Music size={18}/></div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">Lo-fi Chill Decor Beat</p>
                      <p className="text-xs font-medium text-stone-500">Áudio em alta no Instagram Reels</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">⬆️ Viralizando</span>
                </div>

                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-500 flex items-center justify-center"><Hash size={18}/></div>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">#CamaDeHotel</p>
                      <p className="text-xs font-medium text-stone-500">3.2M visualizações no TikTok</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-md">Use Hoje</span>
                </div>
              </div>
            </div>

            <div className="bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 relative z-10"><PlaySquare className="text-fuchsia-500"/> Top Perfomance (Vídeos)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-20 h-28 bg-stone-800 rounded-lg overflow-hidden shrink-0 relative">
                    <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=100&h=150" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center"><PlaySquare size={24} className="text-white drop-shadow-md"/></div>
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 mb-1 block">Reels • Dicas</span>
                      <h4 className="text-sm font-bold text-white line-clamp-2">Como dobrar lençol de elástico em 10 segundos!</h4>
                    </div>
                    <div className="flex gap-4 text-xs font-bold text-stone-400">
                      <span>👁️ 45.2K</span>
                      <span>❤️ 3.1K</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="w-20 h-28 bg-stone-800 rounded-lg overflow-hidden shrink-0 relative">
                    <img src="https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=100&h=150" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center"><PlaySquare size={24} className="text-white drop-shadow-md"/></div>
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1 block">Shorts • Produto</span>
                      <h4 className="text-sm font-bold text-white line-clamp-2">Toalha de Algodão Egípcio: O segredo da absorção.</h4>
                    </div>
                    <div className="flex gap-4 text-xs font-bold text-stone-400">
                      <span>👁️ 12.8K</span>
                      <span>❤️ 980</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ABA 2: O ESTÚDIO (KANBAN ARRASTÁVEL REAL) */}
      {/* ========================================== */}
      {abaAtiva === "kanban" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-stone-900 dark:text-white">Linha de Produção Visual</h2>
            <button className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95">
              <Plus size={16} /> Nova Pauta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Coluna 1: Ideias / Fila */}
            <div 
              className="bg-stone-50 dark:bg-stone-900/50 rounded-[2rem] p-4 border border-stone-200 dark:border-stone-800 flex flex-col h-[600px] transition-colors hover:border-fuchsia-200 dark:hover:border-fuchsia-900/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "fila")}
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400"></div> Ideias (Fila)
                </h3>
                <span className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {tarefas.filter(t => t.coluna === "fila").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-hide">
                {tarefas.filter(t => t.coluna === "fila").map((task) => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${task.rede === 'Instagram' ? 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {task.formato}
                      </span>
                      <button onClick={() => setMenuAbertoId(menuAbertoId === task.id ? null : task.id)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-1"><MoreVertical size={14}/></button>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white leading-tight mb-3">{task.titulo}</h4>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500">
                        <Clock size={12} /> {task.prazo}
                      </div>
                      <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white dark:border-stone-800 flex items-center justify-center text-[8px] font-bold text-stone-600 dark:text-stone-300" title={`Responsável: ${task.autor}`}>
                        {task.autor.substring(0, 2).toUpperCase()}
                      </div>
                    </div>

                    {/* MENU DE 3 PONTINHOS ATIVO */}
                    {menuAbertoId === task.id && (
                      <div className="absolute top-10 right-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl z-50 overflow-hidden py-1 animate-in zoom-in-95">
                        <button className="w-full text-left px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"><Edit3 size={14}/> Editar Pauta</button>
                        <button onClick={() => moverTarefaMenu(task.id, 'producao')} className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2"><LayoutGrid size={14}/> Mover para Produção</button>
                        <div className="h-px bg-stone-100 dark:bg-stone-800 my-1"></div>
                        <button onClick={() => excluirTarefa(task.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"><Trash2 size={14}/> Excluir Pauta</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2: Em Produção */}
            <div 
              className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] p-4 border border-indigo-100 dark:border-indigo-900/30 flex flex-col h-[600px] transition-colors hover:border-indigo-300 dark:hover:border-indigo-700"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "producao")}
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div> Em Produção
                </h3>
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {tarefas.filter(t => t.coluna === "producao").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-hide">
                {tarefas.filter(t => t.coluna === "producao").map((task) => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 shadow-md cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${task.rede === 'Instagram' ? 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {task.formato}
                      </span>
                      <button onClick={() => setMenuAbertoId(menuAbertoId === task.id ? null : task.id)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-1"><MoreVertical size={14}/></button>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white leading-tight mb-3">{task.titulo}</h4>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border-2 border-white dark:border-stone-800 flex items-center justify-center text-[8px] font-bold text-indigo-700 dark:text-indigo-400" title={`Responsável: ${task.autor}`}>
                          {task.autor.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">Editando...</span>
                    </div>

                     {/* MENU DE 3 PONTINHOS ATIVO */}
                     {menuAbertoId === task.id && (
                      <div className="absolute top-10 right-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl z-50 overflow-hidden py-1 animate-in zoom-in-95">
                        <button onClick={() => moverTarefaMenu(task.id, 'agendado')} className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2"><CheckCircle2 size={14}/> Concluir Arte</button>
                        <button onClick={() => moverTarefaMenu(task.id, 'fila')} className="w-full text-left px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"><LayoutGrid size={14}/> Voltar para Fila</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 3: Agendado */}
            <div 
              className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] p-4 border border-emerald-100 dark:border-emerald-900/30 flex flex-col h-[600px] transition-colors hover:border-emerald-300 dark:hover:border-emerald-700"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "agendado")}
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Pronto / Agendado
                </h3>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {tarefas.filter(t => t.coluna === "agendado").length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-hide">
                {tarefas.filter(t => t.coluna === "agendado").map((task) => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 shadow-sm cursor-grab active:cursor-grabbing group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${task.rede === 'Instagram' ? 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {task.formato}
                      </span>
                      <button onClick={() => setMenuAbertoId(menuAbertoId === task.id ? null : task.id)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-1"><MoreVertical size={14}/></button>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-white leading-tight mb-3">{task.titulo}</h4>
                    <div className="bg-stone-50 dark:bg-stone-900 p-2 rounded-lg border border-stone-100 dark:border-stone-700 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-stone-500">Auto-Post:</span>
                       <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{task.prazo} 18:00</span>
                    </div>

                    {/* MENU DE 3 PONTINHOS ATIVO */}
                    {menuAbertoId === task.id && (
                      <div className="absolute top-10 right-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl rounded-xl z-50 overflow-hidden py-1 animate-in zoom-in-95">
                        <button onClick={() => moverTarefaMenu(task.id, 'producao')} className="w-full text-left px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 flex items-center gap-2"><LayoutGrid size={14}/> Reabrir Edição</button>
                        <div className="h-px bg-stone-100 dark:bg-stone-800 my-1"></div>
                        <button onClick={() => excluirTarefa(task.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"><Trash2 size={14}/> Excluir Arte</button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* ZONA DE DROP FAKE PARA MOSTRAR QUE É ARRASTÁVEL */}
                {tarefas.filter(t => t.coluna === "agendado").length === 0 && (
                  <div className="h-24 border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-400/50 text-xs font-bold uppercase tracking-widest">
                    Arraste a arte pronta para cá
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ABA 3: A MÁQUINA DE COPY (I.A. EXPANDIDA) */}
      {/* ========================================== */}
      {abaAtiva === "ia" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-right-8 duration-500">
          
          <div className="xl:col-span-5 bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-fuchsia-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
            
            <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2 flex items-center gap-2 relative z-10">
              <Sparkles size={24} className="text-fuchsia-500" /> Copywriter A.I.
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mb-8 relative z-10">
              Transforme um produto comum em um vídeo magnético. Defina o formato, o tempo e o gatilho mental para a I.A. criar.
            </p>

            <div className="space-y-5 relative z-10 flex-1">
              <div>
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 block">Produto Alvo do Estoque</label>
                <select className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold focus:outline-none focus:border-fuchsia-500 text-stone-900 dark:text-white appearance-none cursor-pointer">
                  <option>Jogo de Lençol Casal 400 Fios</option>
                  <option>Toalha de Banho Algodão Egípcio</option>
                  <option>Kit Lavabo Luxo (Difusor)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><LayoutGrid size={12}/> Plataforma Alvo</label>
                  <select 
                    value={plataformaIA}
                    onChange={(e) => setPlataformaIA(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold focus:outline-none focus:border-fuchsia-500 text-stone-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option>Instagram Reels</option>
                    <option>TikTok Video</option>
                    <option>YouTube Shorts</option>
                    <option>Pinterest Idea Pin</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Timer size={12}/> Duração (Vídeos)</label>
                  <select 
                    value={tempoIA}
                    onChange={(e) => setTempoIA(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold focus:outline-none focus:border-fuchsia-500 text-stone-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option>15 Segundos (Curto/Viral)</option>
                    <option>30 Segundos (Padrão)</option>
                    <option>60 Segundos (Educacional)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Type size={12}/> Estratégia de Copy (Tom de Voz)</label>
                <select 
                  value={objetivoIA}
                  onChange={(e) => setObjetivoIA(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-fuchsia-500 text-stone-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option>Venda Direta / Desejo (Foco em Luxo)</option>
                  <option>Escassez & Urgência (Promoção Relâmpago)</option>
                  <option>Storytelling (Bastidores/Processo)</option>
                  <option>Educacional (Dicas de Cama Posta)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={simularGeracaoIA}
              disabled={loadingIA}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-fuchsia-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative z-10"
            >
              {loadingIA ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />} 
              {loadingIA ? "A IA está escrevendo..." : "Gerar Roteiro Mágico"}
            </button>
          </div>

          {/* Resultado do Criador */}
          <div className="xl:col-span-7 bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 shadow-xl overflow-hidden flex flex-col relative min-h-[500px]">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-black text-white flex items-center gap-2">
                <FileText size={18} className="text-fuchsia-400" /> Editor de Copy
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">Copiar</button>
                <button className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-xs font-bold transition-colors">Criar Card no Kanban</button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {!resultadoIA ? (
                 <div className="h-full flex flex-col items-center justify-center text-stone-500">
                    <Wand2 size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm text-center">A tela está em branco.</p>
                    <p className="text-xs mt-1 opacity-70 text-center max-w-xs">Selecione as variáveis ao lado e aperte o botão para a mágica acontecer.</p>
                 </div>
              ) : (
                <div className="text-stone-300 text-sm leading-relaxed space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div dangerouslySetInnerHTML={{ 
                    __html: resultadoIA
                      .replace(/\n\n/g, '</p><p className="mt-2">')
                      .replace(/\n/g, '<br/>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>')
                  }} />
                </div>
              )}
            </div>
          </div>
          
        </div>
      )}

      {/* ========================================== */}
      {/* ABA 4: HUB DE INTEGRAÇÕES (NOVA ARQUITETURA OMNICHANNEL) */}
      {/* ========================================== */}
      {abaAtiva === "conexoes" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 p-12 animate-in fade-in duration-300">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100 dark:border-blue-500/20">
              <Share2 size={32} />
            </div>
            <h2 className="text-3xl font-black text-stone-900 dark:text-white mb-3">Integrações Globais (API)</h2>
            <p className="text-stone-500 dark:text-stone-400 font-medium">
              Vincule suas contas de redes sociais e anúncios. O Baply cuidará da publicação automática e da leitura de métricas (ROAS e CAC) para o seu CEO Artificial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* META APP (Instagram / Facebook) */}
            <div className="p-6 rounded-2xl border-2 border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:border-[#E1306C] transition-colors relative overflow-hidden">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-[#E1306C] to-yellow-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Instagram size={32} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-center mb-1 gap-2 flex-wrap">
                  <h3 className="font-black text-lg text-stone-900 dark:text-white">Meta for Business</h3>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Conectado
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">
                  Permite postagem automática de Reels/Feed via Graph API e sincronização do catálogo.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="text-[10px] font-bold bg-stone-100 dark:bg-stone-900 text-stone-500 px-2 py-1 rounded">@sweethomeoficial</span>
                </div>
              </div>
            </div>

            {/* TIKTOK API */}
            <div className="p-6 rounded-2xl border-2 border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:border-black dark:hover:border-stone-500 transition-colors relative overflow-hidden">
              <div className="w-16 h-16 bg-stone-950 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-1.535 4.759 4.759 0 0 1-1.214-3.111h-3.486V14.64a2.915 2.915 0 0 1-2.915 2.915 2.915 2.915 0 0 1-2.915-2.915 2.915 2.915 0 0 1 2.915-2.915c.162 0 .319.014.471.04v-3.52A6.386 6.386 0 0 0 4.56 14.64a6.4 6.4 0 0 0 6.4 6.4 6.4 6.4 0 0 0 6.4-6.4V7.24a8.214 8.214 0 0 0 3.228 1.485V5.205a4.762 4.762 0 0 1-1.001-1.48Z"/>
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-center mb-1 gap-2 flex-wrap">
                  <h3 className="font-black text-lg text-stone-900 dark:text-white">TikTok Creator API</h3>
                  <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">Off-line</span>
                </div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">
                  Publique vídeos curtos diretamente do Baply. Requer conta Business.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-auto">
                  <button className="text-[10px] font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white px-4 py-2 rounded-lg transition-colors">Autenticar Conta</button>
                </div>
              </div>
            </div>

            {/* PINTEREST API (NOVO) */}
            <div className="p-6 rounded-2xl border-2 border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:border-[#E60023] transition-colors relative overflow-hidden">
              <div className="w-16 h-16 bg-[#E60023] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/>
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-center mb-1 gap-2 flex-wrap">
                  <h3 className="font-black text-lg text-stone-900 dark:text-white">Pinterest API</h3>
                  <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">Off-line</span>
                </div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">
                  Crie Pins diretamente do catálogo de produtos do Baply. Otimizado para nichos de decoração e enxovais.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-auto">
                  <button className="text-[10px] font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white px-4 py-2 rounded-lg transition-colors">Conectar Pinterest</button>
                </div>
              </div>
            </div>

            {/* GOOGLE ADS API (NOVO) */}
            <div className="p-6 rounded-2xl border-2 border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:border-[#4285F4] transition-colors relative overflow-hidden">
              <div className="w-16 h-16 bg-white dark:bg-stone-900 rounded-2xl flex items-center justify-center text-[#4285F4] shrink-0 shadow-lg border border-stone-100 dark:border-stone-800 group-hover:scale-110 transition-transform">
                <Search size={32} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex justify-center sm:justify-between items-center mb-1 gap-2 flex-wrap">
                  <h3 className="font-black text-lg text-stone-900 dark:text-white">Google Ads & Analytics</h3>
                  <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1">Off-line</span>
                </div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-4 line-clamp-2">
                  Importe dados de custo (ROAS) e tráfego pago para que o CEO Artificial calcule o seu Lucro Real no painel Financeiro.
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-auto">
                  <button className="text-[10px] font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white px-4 py-2 rounded-lg transition-colors">Vincular Conta Google</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
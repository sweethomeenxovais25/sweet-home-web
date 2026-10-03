"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase"; 
import { 
  Radar, ShieldCheck, AlertTriangle, Activity, Users, 
  FileText, Search, CheckCircle2, ChevronDown, Download, Loader2,
  Store, CreditCard, Plus, Trash2, Save, QrCode, SmartphoneNfc, 
  Banknote, CalendarClock, ShieldAlert, X, ImagePlus, UploadCloud, Link as LinkIcon, ImageIcon
} from "lucide-react";

const LOGS_MOCK = [
  { id: 1, usuario: "Maria Silva", acao: "Aprovou o relatório financeiro Q1", tempo: "Há 5 min", status: "success" },
  { id: 2, usuario: "Sistema", acao: "Backup automático do banco de dados concluído", tempo: "Há 12 min", status: "info" },
  { id: 3, usuario: "Carlos Mendes", acao: "Tentativa de login falha (Senha incorreta)", tempo: "Há 45 min", status: "warning" },
  { id: 4, usuario: "Ana Costa", acao: "Alterou as permissões do grupo 'Vendas'", tempo: "Há 2 horas", status: "info" },
  { id: 5, usuario: "Jean Batista", acao: "Delegou nova meta estratégica (OKR)", tempo: "Há 3 horas", status: "success" },
  { id: 6, usuario: "Roberto Alves", acao: "Acessou a Gestão de Tropa fora do expediente", tempo: "Há 5 horas", status: "warning" },
];

export default function GovernancaPage() {
  const supabase = createClient();
  const [abaAtiva, setAbaAtiva] = useState("loja"); 
  
  // 🛡️ ESTADOS: AUDITORIA
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [buscaLogs, setBuscaLogs] = useState("");
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  // ⚙️ ESTADOS: DADOS DA EMPRESA
  const [configId, setConfigId] = useState<string | null>(null);
  const [dadosLoja, setDadosLoja] = useState({ nome: "", slogan: "", cnpj: "", telefone: "", logo: "", bg_login: "" });
  const [metodos, setMetodos] = useState<any[]>([]);
  const [salvandoLoja, setSalvandoLoja] = useState(false);
  const [isInicializado, setIsInicializado] = useState(false); // 👈 Nova trava para o Rascunho

  // 💳 ESTADOS: PAGAMENTOS
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoMetodo, setNovoMetodo] = useState({ nome: "", tipo: "avista", desc: "" });

  // 🖼️ ESTADOS: MODAL DE IMAGENS
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [tempLogoUrl, setTempLogoUrl] = useState("");
  const [tipoUpload, setTipoUpload] = useState<"logo" | "bg">("logo");

  // 🚀 LÓGICA DE RASCUNHO E SUPABASE (O Fim da Amnésia)
  useEffect(() => {
    // 1. Tenta puxar o Rascunho do Cache instantaneamente (Zero delay)
    const rascunho = localStorage.getItem("@baply_draft_loja");
    if (rascunho) {
      setDadosLoja(JSON.parse(rascunho));
    }

    async function carregarDados() {
      setLogs(LOGS_MOCK);
      const { data, error } = await supabase.from('loja_config').select('*').limit(1).single();
      
      if (data) {
        setConfigId(data.id);
        setMetodos(data.metodos_pagamento || []);
        
        // 2. Só substitui os dados pelo banco se NÃO houver um rascunho pendente
        if (!rascunho) {
          setDadosLoja({
            nome: data.nome_fantasia || "",
            slogan: data.slogan || "",
            cnpj: data.cnpj || "",
            telefone: data.telefone || "",
            logo: data.logo_url || "",
            bg_login: data.bg_login || ""
          });
        }
      } else if (error) {
        console.error("Erro ao buscar config da loja:", error);
      }
      
      setLoading(false);
      setIsInicializado(true); // Autoriza o sistema a começar a salvar rascunhos novos
    }
    carregarDados();
  }, [supabase]);

  // 📝 AUTO-SAVE DO RASCUNHO (Salva cada letra que você digita no Cache do navegador)
  useEffect(() => {
    if (isInicializado) {
      localStorage.setItem("@baply_draft_loja", JSON.stringify(dadosLoja));
    }
  }, [dadosLoja, isInicializado]);


  const handleGerarRelatorio = async () => {
    setGerandoRelatorio(true);
    setTimeout(() => {
      setGerandoRelatorio(false);
      toast.success("Relatório de Auditoria gerado!", { description: "O arquivo .CSV foi enviado para o seu e-mail corporativo." });
    }, 2000);
  };

  const logsFiltrados = logs.filter((log) => {
    const termo = buscaLogs.toLowerCase();
    return (
      log.usuario.toLowerCase().includes(termo) ||
      log.acao.toLowerCase().includes(termo) ||
      log.status.toLowerCase().includes(termo)
    );
  });

  const handleSalvarLoja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configId) return;

    setSalvandoLoja(true);
    const { error } = await supabase
      .from('loja_config')
      .update({ 
        nome_fantasia: dadosLoja.nome,
        slogan: dadosLoja.slogan,
        cnpj: dadosLoja.cnpj,
        telefone: dadosLoja.telefone,
        logo_url: dadosLoja.logo,
        bg_login: dadosLoja.bg_login
      })
      .eq('id', configId);

    if (error) {
      toast.error("Erro ao salvar configurações.");
    } else {
      // 🚀 SUCESSO! O Rascunho não é mais necessário. Limpamos o Cache.
      localStorage.removeItem("@baply_draft_loja");
      toast.success("Identidade da loja atualizada!", { description: "As mudanças já refletem no PDV e Login." });
    }
    setSalvandoLoja(false);
  };

  const abrirModalLogo = (tipo: "logo" | "bg") => {
    setTipoUpload(tipo);
    setTempLogoUrl("");
    setIsLogoModalOpen(true);
  };

  const confirmarLogoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempLogoUrl) {
      if (tipoUpload === "logo") setDadosLoja({...dadosLoja, logo: tempLogoUrl});
      if (tipoUpload === "bg") setDadosLoja({...dadosLoja, bg_login: tempLogoUrl});
      setIsLogoModalOpen(false);
      toast.success("Imagem importada com sucesso!", { description: "Clique em 'Salvar Identidade' para aplicar ao sistema."});
    }
  };

  const handleRemoverImagem = (tipo: "logo" | "bg") => {
    if(window.confirm("Remover esta imagem? O sistema voltará ao padrão.")) {
      if (tipo === "logo") setDadosLoja({...dadosLoja, logo: ""});
      if (tipo === "bg") setDadosLoja({...dadosLoja, bg_login: ""});
      toast.info("Imagem removida. Lembre-se de salvar.");
    }
  };

  const renderIcone = (nomeIcone: string, className = "") => {
    switch (nomeIcone) {
      case "QrCode": return <QrCode className={className} />;
      case "SmartphoneNfc": return <SmartphoneNfc className={className} />;
      case "Banknote": return <Banknote className={className} />;
      case "CalendarClock": return <CalendarClock className={className} />;
      default: return <CreditCard className={className} />;
    }
  };

  const handleAdicionarMetodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoMetodo.nome || !configId) { toast.error("Dê um nome para a forma de pagamento."); return; }

    const idGerado = `metodo_${Math.random().toString(36).substr(2, 9)}`;
    const metodoCompleto = {
      id: idGerado,
      nome: novoMetodo.nome,
      tipo: novoMetodo.tipo,
      icone: novoMetodo.tipo === "avista" ? "QrCode" : novoMetodo.tipo === "cartao" ? "SmartphoneNfc" : novoMetodo.tipo === "dinheiro" ? "Banknote" : "CalendarClock",
      desc: novoMetodo.desc || "Novo Método"
    };

    const novosMetodos = [...metodos, metodoCompleto];
    const { error } = await supabase.from('loja_config').update({ metodos_pagamento: novosMetodos }).eq('id', configId);

    if (!error) {
      setMetodos(novosMetodos);
      setIsModalOpen(false);
      setNovoMetodo({ nome: "", tipo: "avista", desc: "" });
      toast.success(`${novoMetodo.nome} adicionado!`, { description: "Já está disponível no PDV." });
    } else {
      toast.error("Erro ao salvar método.");
    }
  };

  const handleExcluirMetodo = async (id: string, nome: string) => {
    if (!configId) return;
    if (window.confirm(`Deseja excluir o método "${nome}"? Ele sumirá do PDV imediatamente.`)) {
      const novosMetodos = metodos.filter(m => m.id !== id);
      const { error } = await supabase.from('loja_config').update({ metodos_pagamento: novosMetodos }).eq('id', configId);
      
      if (!error) {
        setMetodos(novosMetodos);
        toast.warning(`Método ${nome} removido.`);
      }
    }
  };

  // ❌ REMOVEMOS a tela preta bloqueante de "Loading" para acabar com as piscadas!

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* CABEÇALHO DO MÓDULO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <ShieldAlert size={14} className="animate-pulse" /> Acesso Nível Diretoria
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">Governança</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Motor de regras do ERP, auditoria de processos e controle interno.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* MENU INTERNO */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <button onClick={() => setAbaAtiva("auditoria")} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${abaAtiva === "auditoria" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-500/20" : "bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700"}`}>
            <Radar size={18} /> Auditoria & Logs
          </button>
          <button onClick={() => setAbaAtiva("loja")} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${abaAtiva === "loja" ? "bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md" : "bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700"}`}>
            <Store size={18} /> Dados da Empresa
          </button>
          <button onClick={() => setAbaAtiva("pagamentos")} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${abaAtiva === "pagamentos" ? "bg-[#A67B5B] text-white shadow-md shadow-[#A67B5B]/20" : "bg-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700"}`}>
            <CreditCard size={18} /> Formas de Pagamento
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="lg:col-span-9 rounded-[2rem] min-h-[600px] relative">
          
          {/* Se estiver carregando, mostra um overlay suave transparente em vez de piscar a tela toda */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm z-50 rounded-[2rem] flex items-center justify-center pointer-events-none">
              <Loader2 className="animate-spin text-[#A67B5B]" size={32} />
            </div>
          )}

          {abaAtiva === "auditoria" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-end">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input type="text" value={buscaLogs} onChange={(e) => setBuscaLogs(e.target.value)} placeholder="Auditar logs..." className="pl-9 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white w-full shadow-sm" />
                </div>
                <button onClick={handleGerarRelatorio} disabled={gerandoRelatorio} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-sm rounded-xl hover:bg-stone-800 transition-all shadow-md active:scale-95 disabled:opacity-70 group">
                  {gerandoRelatorio ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />}
                  {gerandoRelatorio ? "Extraindo..." : "Gerar Relatório"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[
                  { titulo: "Índice de Conformidade", valor: "98.5%", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", glowClass: "group-hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] group-hover:scale-110" },
                  { titulo: "Alertas Críticos", valor: "2", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", glowClass: "drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse scale-110" },
                  { titulo: "Sessões Ativas", valor: "18", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", glowClass: "group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] group-hover:scale-110" },
                  { titulo: "Logs (24h)", valor: "1.432", icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", glowClass: "group-hover:drop-shadow-[0_0_12px_rgba(99,102,241,0.8)] group-hover:scale-110" }
                ].map((metrica, i) => (
                  <div key={i} className="group bg-white dark:bg-stone-800 rounded-[1.5rem] p-6 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 flex items-center gap-4 cursor-default">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${metrica.bg} ${metrica.color} shrink-0 transition-colors`}>
                      <metrica.icon size={24} className={`transition-all duration-500 ${metrica.glowClass}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-0.5">{metrica.titulo}</p>
                      <h3 className="text-2xl font-black text-stone-900 dark:text-white group-hover:translate-x-1 transition-transform duration-300">{metrica.valor}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden flex flex-col transition-colors">
                  <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/30">
                    <h3 className="font-black text-stone-900 dark:text-white text-lg flex items-center gap-2"><Activity className="text-indigo-500" size={20} /> Feed de Operações</h3>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">Histórico Completo</span>
                  </div>
                  <div className="flex-1 p-6 h-[400px] overflow-y-auto">
                    <div className="space-y-6">
                      {logsFiltrados.length === 0 ? (
                        <div className="text-center py-8 text-stone-500 dark:text-stone-400 font-medium">Nenhum registro encontrado para "{buscaLogs}".</div>
                      ) : (
                        logsFiltrados.map((atividade) => (
                          <div key={atividade.id} className="group flex gap-4 items-start relative before:absolute before:left-[11px] before:top-8 before:bottom-[-24px] before:w-[2px] before:bg-stone-100 dark:before:bg-stone-700 last:before:hidden cursor-default">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white dark:border-stone-800 transition-all duration-500 ${atividade.status === 'success' ? 'bg-emerald-500 group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]' : atividade.status === 'warning' ? 'bg-amber-500 scale-125 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-indigo-400 group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]'}`}>
                              {atividade.status === 'success' && <CheckCircle2 size={10} className="text-white" />}
                              {atividade.status === 'warning' && <AlertTriangle size={10} className="text-white" />}
                            </div>
                            <div className="group-hover:translate-x-1 transition-transform duration-300 w-full">
                              <p className="text-sm font-medium text-stone-900 dark:text-white leading-tight mb-1"><span className="font-bold">{atividade.usuario}</span> {atividade.acao}</p>
                              <span className="text-xs font-medium text-stone-400 group-hover:text-indigo-500 transition-colors duration-300">{atividade.tempo}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-1 space-y-6">
                  <div className="bg-stone-900 dark:bg-stone-950 rounded-[2rem] p-8 border border-stone-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <h3 className="text-xl font-black text-white mb-2 relative z-10">Central de Conformidade</h3>
                    <p className="text-stone-400 text-sm mb-6 relative z-10">Execute varreduras de segurança e emita relatórios com um clique.</p>
                    <div className="space-y-3 relative z-10">
                      <button onClick={() => toast.info("Iniciando varredura...", { description: "Verificando anomalias na rede." })} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left group/btn">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-transform" /> Varredura de Acessos</span>
                        <ChevronDown size={14} className="text-stone-500 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => toast.info("Compilando DRE...", { description: "O documento será gerado em breve." })} className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left group/btn">
                        <span className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16} className="text-blue-400 group-hover/btn:scale-110 transition-transform" /> Relatório DRE & Fiscal</span>
                        <ChevronDown size={14} className="text-stone-500 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 2: DADOS DA EMPRESA E UPLOAD DE LOGO */}
          {/* ========================================== */}
          {abaAtiva === "loja" && (
            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm animate-in fade-in duration-300 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30">
                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Store size={22} className="text-[#A67B5B]" /> Identidade da Loja
                </h2>
                <p className="text-sm font-medium text-stone-500 mt-1">Configure o Co-Branding. Personalize a logo, fundo e slogan da tela de Login.</p>
              </div>
              
              <form onSubmit={handleSalvarLoja} className="p-6 md:p-8">
                
                {/* 📸 SEÇÃO DUPLA: UPLOAD DE LOGO E FUNDO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* LOGO */}
                  <div>
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest block mb-4">Logotipo Principal</label>
                    <div className="flex items-start gap-4">
                      {dadosLoja.logo ? (
                        <div className="relative group w-24 h-24 shrink-0">
                          <div className="w-full h-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-white overflow-hidden shadow-sm flex items-center justify-center p-2">
                            <img src={dadosLoja.logo} alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                          <button type="button" onClick={() => handleRemoverImagem("logo")} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white shadow-md transition-all"><Trash2 size={12} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => abrirModalLogo("logo")} className="w-24 h-24 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#A67B5B] flex flex-col items-center justify-center text-stone-400 hover:text-[#A67B5B] shrink-0 transition-all group">
                          <ImagePlus size={20} className="mb-1 group-hover:scale-110 transition-transform" /><span className="text-[9px] font-bold uppercase">Inserir</span>
                        </button>
                      )}
                      <div>
                        <p className="text-xs font-medium text-stone-500">Tamanho ideal: 400x400px. Não se preocupe com o fundo branco, nós cuidamos dele.</p>
                      </div>
                    </div>
                  </div>

                  {/* IMAGEM DE FUNDO */}
                  <div>
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest block mb-4">Fundo da Tela de Login</label>
                    <div className="flex items-start gap-4">
                      {dadosLoja.bg_login ? (
                        <div className="relative group w-32 h-24 shrink-0">
                          <div className="w-full h-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-900 overflow-hidden shadow-sm">
                            <img src={dadosLoja.bg_login} alt="Fundo" className="w-full h-full object-cover" />
                          </div>
                          <button type="button" onClick={() => handleRemoverImagem("bg")} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white shadow-md transition-all"><Trash2 size={12} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => abrirModalLogo("bg")} className="w-32 h-24 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#A67B5B] flex flex-col items-center justify-center text-stone-400 hover:text-[#A67B5B] shrink-0 transition-all group">
                          <ImageIcon size={20} className="mb-1 group-hover:scale-110 transition-transform" /><span className="text-[9px] font-bold uppercase">Inserir BG</span>
                        </button>
                      )}
                      <div>
                        <p className="text-xs font-medium text-stone-500">Imagem de alta qualidade para o painel esquerdo. Ela será escurecida automaticamente.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-stone-100 dark:bg-stone-800 w-full mb-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome Comercial (Fantasia)</label>
                    <input type="text" value={dadosLoja.nome} onChange={e => setDadosLoja({...dadosLoja, nome: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-bold text-stone-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Slogan / Frase de Impacto</label>
                    <input type="text" value={dadosLoja.slogan} onChange={e => setDadosLoja({...dadosLoja, slogan: e.target.value})} placeholder="Ex: Conforto e luxo para o seu lar." className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">CNPJ (Opcional)</label>
                    <input type="text" value={dadosLoja.cnpj} onChange={e => setDadosLoja({...dadosLoja, cnpj: e.target.value})} placeholder="Para emissão de DRE" className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-bold text-stone-900 dark:text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">WhatsApp de Contato</label>
                    <input type="text" value={dadosLoja.telefone} onChange={e => setDadosLoja({...dadosLoja, telefone: e.target.value})} placeholder="Para envio de recibos" className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-bold text-stone-900 dark:text-white" />
                  </div>
                </div>
                
                <div className="pt-6 border-t border-stone-100 dark:border-stone-700 flex justify-end">
                  <button type="submit" disabled={salvandoLoja} className="flex items-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-8 py-3.5 rounded-xl font-black text-sm hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50">
                    {salvandoLoja ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />} Salvar Identidade
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================== */}
          {/* ABA 3: FORMAS DE PAGAMENTO */}
          {/* ========================================== */}
          {abaAtiva === "pagamentos" && (
            <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm animate-in fade-in duration-300 h-full flex flex-col">
              <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2"><CreditCard size={22} className="text-[#A67B5B]" /> Carteira do PDV</h2>
                  <p className="text-sm font-medium text-stone-500 mt-1">Ative ou crie crediários próprios para o caixa.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-[#A67B5B] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#8e694d] transition-all active:scale-95 shadow-md shadow-[#A67B5B]/20 shrink-0">
                  <Plus size={18} /> Adicionar Método
                </button>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                {metodos.map((metodo) => (
                  <div key={metodo.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-5 rounded-2xl flex flex-col justify-between group hover:border-[#A67B5B]/50 hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-stone-100 dark:bg-stone-800 text-stone-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-bl-lg">Motor: {metodo.tipo}</div>
                    <div className="flex items-start gap-4 mb-4 mt-2">
                      <div className="w-12 h-12 rounded-xl bg-[#A67B5B]/10 text-[#A67B5B] flex items-center justify-center shrink-0 border border-[#A67B5B]/20">{renderIcone(metodo.icone, "w-6 h-6")}</div>
                      <div>
                        <h3 className="font-black text-stone-900 dark:text-white leading-tight">{metodo.nome}</h3>
                        <p className="text-xs font-medium text-stone-500">{metodo.desc}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center mt-auto">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ativo no PDV
                      </span>
                      <button onClick={() => handleExcluirMetodo(metodo.id, metodo.nome)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 MODAL 1: NOVO MÉTODO DE PAGAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-xl">Novo Pagamento</h3>
                <p className="text-xs text-stone-500 font-medium">Crie um botão customizado para o Caixa.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAdicionarMetodo} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome do Botão (Ex: Sweet Flex)</label>
                <input required autoFocus type="text" value={novoMetodo.nome} onChange={e => setNovoMetodo({...novoMetodo, nome: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-bold text-stone-900 dark:text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Motor / Comportamento no PDV</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNovoMetodo({...novoMetodo, tipo: "avista"})} className={`p-3 border-2 rounded-xl text-left flex flex-col gap-1 transition-all ${novoMetodo.tipo === "avista" ? "border-[#A67B5B] bg-[#A67B5B]/5" : "border-stone-100 dark:border-stone-800 hover:border-stone-200"}`}>
                    <QrCode size={16} className={novoMetodo.tipo === "avista" ? "text-[#A67B5B]" : "text-stone-400"} />
                    <span className={`text-xs font-bold ${novoMetodo.tipo === "avista" ? "text-stone-900 dark:text-white" : "text-stone-500"}`}>À Vista / Pix</span>
                  </button>
                  <button type="button" onClick={() => setNovoMetodo({...novoMetodo, tipo: "dinheiro"})} className={`p-3 border-2 rounded-xl text-left flex flex-col gap-1 transition-all ${novoMetodo.tipo === "dinheiro" ? "border-[#A67B5B] bg-[#A67B5B]/5" : "border-stone-100 dark:border-stone-800 hover:border-stone-200"}`}>
                    <Banknote size={16} className={novoMetodo.tipo === "dinheiro" ? "text-[#A67B5B]" : "text-stone-400"} />
                    <span className={`text-xs font-bold ${novoMetodo.tipo === "dinheiro" ? "text-stone-900 dark:text-white" : "text-stone-500"}`}>Dinheiro (+Troco)</span>
                  </button>
                  <button type="button" onClick={() => setNovoMetodo({...novoMetodo, tipo: "cartao"})} className={`p-3 border-2 rounded-xl text-left flex flex-col gap-1 transition-all ${novoMetodo.tipo === "cartao" ? "border-[#A67B5B] bg-[#A67B5B]/5" : "border-stone-100 dark:border-stone-800 hover:border-stone-200"}`}>
                    <SmartphoneNfc size={16} className={novoMetodo.tipo === "cartao" ? "text-[#A67B5B]" : "text-stone-400"} />
                    <span className={`text-xs font-bold ${novoMetodo.tipo === "cartao" ? "text-stone-900 dark:text-white" : "text-stone-500"}`}>Cartão (Maquininha)</span>
                  </button>
                  <button type="button" onClick={() => setNovoMetodo({...novoMetodo, tipo: "crediario"})} className={`p-3 border-2 rounded-xl text-left flex flex-col gap-1 transition-all ${novoMetodo.tipo === "crediario" ? "border-[#A67B5B] bg-[#A67B5B]/5" : "border-stone-100 dark:border-stone-800 hover:border-stone-200"}`}>
                    <CalendarClock size={16} className={novoMetodo.tipo === "crediario" ? "text-[#A67B5B]" : "text-stone-400"} />
                    <span className={`text-xs font-bold ${novoMetodo.tipo === "crediario" ? "text-stone-900 dark:text-white" : "text-stone-500"}`}>Crediário (+Parcelas)</span>
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Pequena Descrição</label>
                <input type="text" value={novoMetodo.desc} onChange={e => setNovoMetodo({...novoMetodo, desc: e.target.value})} placeholder="Ex: Promissória em até 12x" className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>
              <button type="submit" className="w-full mt-2 py-3.5 rounded-xl font-black text-sm bg-[#A67B5B] text-white hover:bg-[#8e694d] transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2">
                <Plus size={18} /> Salvar e Ativar no PDV
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 2: IMPORTAR IMAGEM (NOVO) */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsLogoModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-xl">Importar {tipoUpload === "logo" ? "Logotipo" : "Fundo"}</h3>
                <p className="text-xs text-stone-500 font-medium">Cole o link (URL) da imagem.</p>
              </div>
              <button onClick={() => setIsLogoModalOpen(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={confirmarLogoUrl} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Link da Imagem Segura (HTTPS)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    required autoFocus type="url" 
                    value={tempLogoUrl} onChange={e => setTempLogoUrl(e.target.value)} 
                    placeholder="https://..." 
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" 
                  />
                </div>
              </div>

              {/* Preview Dinâmico */}
              {tempLogoUrl && (
                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 flex flex-col items-center justify-center animate-in zoom-in-95">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Preview da Imagem</p>
                  <img 
                    src={tempLogoUrl} 
                    alt="Preview" 
                    className={`w-32 h-32 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 bg-white ${tipoUpload === 'logo' ? 'object-contain mix-blend-multiply' : 'object-cover'}`} 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}

              <button type="submit" disabled={!tempLogoUrl} className="w-full py-3.5 rounded-xl font-black text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] hover:text-white transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                Confirmar Imagem
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
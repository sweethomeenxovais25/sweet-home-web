"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { usePerfil } from "@/contexts/PerfilContext";
import confetti from "canvas-confetti"; // 🎉 A MAGIA DA DOPAMINA
import { 
  GraduationCap, Trophy, BookOpen, Star, 
  PlayCircle, CheckCircle2, UploadCloud, FileText, 
  ExternalLink, Award, X, Loader2, Sparkles, Target, 
  TrendingUp, BrainCircuit, ShieldAlert, Link as LinkIcon, 
  Image as ImageIcon, Check, Filter, Search, Info, HelpCircle, Gift, PlusCircle
} from "lucide-react";

// ============================================================================
// 🚀 MOCKS DA ACADEMY 3.0 
// ============================================================================
const TRILHAS_EXISTENTES = ["🎯 Vendas", "📈 Finanças", "👑 Liderança", "🚀 Gestão Ágil"];

const CURSOS_MOCK = [
  { id: "C-101", trilha: "🎯 Vendas", titulo: "Atendimento ao Cliente de Alto Impacto", instituicao: "Sebrae", carga: 4, xp: 150, url: "https://sebrae.com.br", imagem: "https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=400&h=250" },
  { id: "C-102", trilha: "🎯 Vendas", titulo: "Gatilhos Mentais no WhatsApp", instituicao: "Baply", carga: 2, xp: 100, url: "https://youtube.com", imagem: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400&h=250" },
  { id: "C-201", trilha: "📈 Finanças", titulo: "Gestão de Fluxo de Caixa", instituicao: "ENAP", carga: 10, xp: 300, url: "https://enap.gov.br", imagem: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400&h=250" },
  { id: "C-301", trilha: "👑 Liderança", titulo: "Gestão de Pessoas", instituicao: "Harvard ManageMentor", carga: 20, xp: 500, url: "https://harvard.edu", imagem: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400&h=250" }
];

const PROGRESSO_MOCK = [
  { id: "P-001", curso_id: "C-101", titulo: "Atendimento ao Cliente de Alto Impacto", status: "Em Andamento", xp_ganho: 0, user: "Bia" },
  { id: "P-002", curso_id: "C-202", titulo: "Precificação Inteligente", status: "Concluído", xp_ganho: 200, certificado: "url_do_supabase.pdf", user: "Bia" }
];

const APROVACOES_PENDENTES_MOCK = [
  { id: "AP-001", aluno: "João (Estoque)", curso: "Gestão de Estoque Avançado", instituicao: "ENAP", carga_requisitada: "10h", data_envio: "Hoje, 14:30", certificado: "link.pdf" }
];

export default function BaplyAcademyPage() {
  const supabase = createClient();
  const { nivel } = usePerfil();
  const isAdmin = nivel === "Admin" || nivel === "CEO" || nivel === "Gerente";

  const [abaAtiva, setAbaAtiva] = useState("trilhas"); 
  const [subAbaAdmin, setSubAbaAdmin] = useState("fabrica"); // "fabrica" | "aprovacoes" | "trilhas"
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  
  const [nomeAcademy, setNomeAcademy] = useState("Baply Academy");
  const [modalRecompensas, setModalRecompensas] = useState(false);
  
  // MODAL UPLOAD ALUNO
  const [modalUpload, setModalUpload] = useState(false);
  const [cursoAlvo, setCursoAlvo] = useState<any>(null);
  const [ficheiroCertificado, setFicheiroCertificado] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  // ROBÔ EXTRAÇÃO
  const [urlCurso, setUrlCurso] = useState("");
  const [extraindoUrl, setExtraindoUrl] = useState(false);
  const [dadosExtraidos, setDadosExtraidos] = useState<{titulo: string, imagem: string, instituicao: string} | null>(null);
  const [novoCurso, setNovoCurso] = useState({ carga: "", xp: "", trilha: "🎯 Vendas" });

  // NOVA TRILHA (ADMIN)
  const [novaTrilhaEmoji, setNovaTrilhaEmoji] = useState("🌟");
  const [novaTrilhaNome, setNovaTrilhaNome] = useState("");

  const xpTotal = PROGRESSO_MOCK.reduce((acc, curr) => acc + curr.xp_ganho, 0);
  const nivelAtual = Math.floor(xpTotal / 500) + 1; 
  const xpProximoNivel = nivelAtual * 500;
  const pctProgresso = Math.min((xpTotal / xpProximoNivel) * 100, 100);

  // MEMÓRIA MUSCULAR
  const [isInicializado, setIsInicializado] = useState(false);

  useEffect(() => {
    const nomeLojaSalvo = localStorage.getItem("@baply_nome_loja");
    if (nomeLojaSalvo) {
      const primeiroNome = nomeLojaSalvo.split(' ')[0];
      setNomeAcademy(`${primeiroNome} Academy`);
    }
    const abaSalva = localStorage.getItem("@baply_academy_aba");
    const subAbaSalva = localStorage.getItem("@baply_academy_subaba");
    const urlSalva = localStorage.getItem("@baply_academy_url");

    if (abaSalva) setAbaAtiva(abaSalva);
    if (subAbaSalva) setSubAbaAdmin(subAbaSalva);
    if (urlSalva) setUrlCurso(urlSalva);

    setIsInicializado(true);
  }, []);

  useEffect(() => {
    if (isInicializado) {
      localStorage.setItem("@baply_academy_aba", abaAtiva);
      localStorage.setItem("@baply_academy_subaba", subAbaAdmin);
      localStorage.setItem("@baply_academy_url", urlCurso);
    }
  }, [abaAtiva, subAbaAdmin, urlCurso, isInicializado]);


  const abrirModalCertificado = (curso: any) => {
    setCursoAlvo(curso);
    setFicheiroCertificado(null);
    setModalUpload(true);
  };

  const enviarCertificadoSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ficheiroCertificado) return toast.error("Anexe o PDF ou imagem do certificado.");
    setEnviando(true);
    setTimeout(() => {
      toast.success("Certificado enviado para a Mesa de Aprovação! 🎉", { description: "Assim que a gerência aprovar, os seus XP serão creditados." });
      setEnviando(false);
      setModalUpload(false);
    }, 2000);
  };

  const extrairMetadadosDoCurso = async () => {
    if (!urlCurso || !urlCurso.includes("http")) return toast.error("Cole um link válido (com https://).");
    setExtraindoUrl(true);
    toast.info("A investigar a URL...", { description: "Buscando capa e título oficiais do site."});

    try {
      const resposta = await fetch(`https://api.microlink.io?url=${encodeURIComponent(urlCurso)}`);
      const dados = await resposta.json();
      if (dados.status === "success") {
        setDadosExtraidos({
          titulo: dados.data.title || "Título não encontrado",
          imagem: dados.data.image?.url || dados.data.logo?.url || "",
          instituicao: dados.data.publisher || new URL(urlCurso).hostname.replace('www.', '').split('.')[0].toUpperCase()
        });
        toast.success("✨ Dados extraídos com sucesso!");
      } else {
        toast.warning("Não foi possível extrair a imagem. Preencha manualmente.");
        setDadosExtraidos({ titulo: "", imagem: "", instituicao: "Instituição" });
      }
    } catch (erro) {
      toast.error("Erro ao contactar o site do curso.");
      setDadosExtraidos({ titulo: "", imagem: "", instituicao: "" });
    }
    setExtraindoUrl(false);
  };

  const salvarNovoCurso = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Curso adicionado ao catálogo oficial da empresa!");
    setUrlCurso("");
    setDadosExtraidos(null);
    setNovoCurso({ carga: "", xp: "", trilha: "🎯 Vendas" });
  };

  const salvarNovaTrilha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaTrilhaNome) return toast.error("Digite o nome da trilha.");
    toast.success(`Trilha ${novaTrilhaEmoji} ${novaTrilhaNome} criada com sucesso!`);
    setNovaTrilhaNome("");
  };

  const aprovarCertificadoComConfete = (id: string) => {
    // 💥 A EXPLOSÃO DE DOPAMINA 
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34D399', '#FBBF24', '#818CF8'] // Cores da aprovação (Esmeralda, Ouro, Índigo)
    });
    toast.success("Certificado Validado! 🎉", { description: "A XP foi injetada no perfil do colaborador com sucesso." });
  };

  const auditarComIA = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'A IA está a cruzar os dados do PDF com a base da ENAP...',
        success: '✅ Auditoria Concluída: O nome "João" consta no certificado. Carga Horária bate com o sistema (10h).',
        error: 'Erro na auditoria.',
      }
    );
  };

  const categorias = ["Todas", ...TRILHAS_EXISTENTES];
  const cursosFiltrados = filtroCategoria === "Todas" ? CURSOS_MOCK : CURSOS_MOCK.filter(c => c.trilha === filtroCategoria);

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 HEADER GAMIFICADO */}
      <div className="mb-10 bg-stone-900 dark:bg-stone-950 rounded-[2rem] p-8 md:p-10 border border-stone-800 shadow-xl relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 w-full xl:w-auto text-center xl:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-indigo-400 text-xs font-bold mb-4 backdrop-blur-sm shadow-inner">
            <GraduationCap size={14} /> Desenvolvimento Contínuo
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">{nomeAcademy}</h1>
          <p className="text-stone-400 font-medium mt-2 max-w-md mx-auto xl:mx-0">
            O conhecimento é o único ativo que escala infinitamente. Domine os processos e suba o nível da sua carreira.
          </p>
        </div>

        {/* MOTOR DE DOPAMINA (BARRA DE XP) */}
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-6 w-full xl:w-[450px] backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><Trophy size={14} className="text-amber-400"/> O Seu Nível</p>
              <h3 className="text-3xl font-black text-white mt-1">Lvl. {nivelAtual} <span className="text-sm font-medium text-stone-500">({xpTotal} XP)</span></h3>
            </div>
            
            {/* O BOTÃO MAGNÉTICO DE POLÍTICA DE RECOMPENSAS */}
            <button onClick={() => setModalRecompensas(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-stone-900 transition-colors group">
              <Gift size={12} className="group-hover:animate-bounce"/> Ver Recompensas
            </button>
          </div>
          
          <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden shadow-inner relative">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 relative" style={{ width: `${pctProgresso}%` }}>
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <p className="text-[10px] font-bold text-indigo-400 mt-2 text-right">Faltam {xpProximoNivel - xpTotal} XP para o Lvl. {nivelAtual + 1}</p>
        </div>
      </div>

      {/* 🧭 NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 dark:border-stone-700 mb-8 gap-x-8 gap-y-4">
        <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide whitespace-nowrap w-full md:w-auto">
          <button onClick={() => setAbaAtiva("trilhas")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "trilhas" ? "border-indigo-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
            <BookOpen size={18} className={`transition-all ${abaAtiva === "trilhas" ? "text-indigo-500 scale-110" : ""}`} /> Catálogo de Trilhas
          </button>
          <button onClick={() => setAbaAtiva("meu_progresso")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "meu_progresso" ? "border-emerald-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
            <Award size={18} className={`transition-all ${abaAtiva === "meu_progresso" ? "text-emerald-500 scale-110" : ""}`} /> Meu Cofre (XP)
          </button>
        </div>
        
        {/* ABA EXCLUSIVA DA GERÊNCIA */}
        {isAdmin && (
          <button onClick={() => setAbaAtiva("admin")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 w-full md:w-auto ${abaAtiva === "admin" ? "border-[#A67B5B] text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
            <ShieldAlert size={18} className={`transition-all ${abaAtiva === "admin" ? "text-[#A67B5B] scale-110 animate-pulse" : ""}`} /> Portal do Reitor
          </button>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 📚 ABA 1: A VITRINE DE CURSOS (VISÃO DO ALUNO) */}
      {/* ====================================================================== */}
      {abaAtiva === "trilhas" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 text-stone-400 mr-2"><Filter size={16}/> <span className="text-xs font-bold uppercase tracking-widest">Trilhas:</span></div>
            {categorias.map(cat => (
              <button 
                key={cat} onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${filtroCategoria === cat ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-indigo-300"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cursosFiltrados.map((curso) => (
              <div key={curso.id} className="group bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-3xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
                
                <div className="h-40 w-full bg-stone-100 dark:bg-stone-900 relative overflow-hidden">
                  {curso.imagem ? (
                    <img src={curso.imagem} alt={curso.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon size={40}/></div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-black text-amber-500 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                    <Star size={12}/> {curso.xp} XP
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-900/80 text-white backdrop-blur-md">
                    {curso.instituicao}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">{curso.trilha}</span>
                  <h4 className="font-black text-lg text-stone-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {curso.titulo}
                  </h4>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-100 dark:border-stone-700/50">
                    <p className="text-xs font-bold text-stone-400 flex items-center gap-1.5"><BrainCircuit size={14}/> {curso.carga}h de Carga</p>
                    <a href={curso.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95">
                      <PlayCircle size={20} className="ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🏆 ABA 2: O MEU PROGRESSO E PROVA DE TRABALHO */}
      {/* ====================================================================== */}
      {abaAtiva === "meu_progresso" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 p-8 shadow-sm animate-in fade-in duration-300 min-h-[400px]">
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2 mb-6">
            <Award size={20} className="text-emerald-500" /> Cofre de Conquistas Pessoais
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-700 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                  <th className="pb-4 pl-4">Formação Em Andamento / Concluída</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Recompensa</th>
                  <th className="pb-4 text-center pr-4">Ação / Prova</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                {PROGRESSO_MOCK.map((prog) => (
                  <tr key={prog.id} className="hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-colors group">
                    <td className="py-4 pl-4 font-bold text-stone-900 dark:text-white text-sm">
                      {prog.titulo}
                    </td>
                    <td className="py-4 text-center">
                      {prog.status === "Concluído" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                          <CheckCircle2 size={12} /> Aprovado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20 shadow-inner">
                          <Loader2 size={12} className="animate-spin" /> {prog.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      {prog.xp_ganho > 0 ? (
                        <span className="text-xs font-black text-amber-500 flex items-center justify-end gap-1"><Star size={12}/> +{prog.xp_ganho} XP</span>
                      ) : (
                        <span className="text-xs font-medium text-stone-400">Pendente</span>
                      )}
                    </td>
                    <td className="py-4 text-center pr-4">
                      {prog.status === "Concluído" ? (
                        <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 w-full bg-indigo-50 dark:bg-indigo-500/10 py-2 rounded-xl transition-colors">
                          <ExternalLink size={14}/> Ver Certificado
                        </button>
                      ) : (
                        <button onClick={() => abrirModalCertificado(prog)} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-[#A67B5B] text-white dark:text-stone-900 dark:hover:bg-[#A67B5B] dark:hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 w-full max-w-[160px] mx-auto">
                          <UploadCloud size={14}/> Anexar Prova
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 👑 ABA 3: GESTÃO ADMIN (PORTAL DO REITOR - 3 SUB-ABAS) */}
      {/* ====================================================================== */}
      {isAdmin && abaAtiva === "admin" && (
        <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-500 min-h-[600px] flex flex-col">
          
          <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50 dark:bg-stone-950 shrink-0">
            <div>
              <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                <ShieldAlert size={20} className="text-[#A67B5B]" /> Portal da Diretoria
              </h2>
              <p className="text-xs font-medium text-stone-500 mt-1">Gira o catálogo da academia e aprove os certificados da equipa.</p>
            </div>

            {/* NAVEGAÇÃO INTERNA DO ADMIN */}
            <div className="flex bg-stone-200 dark:bg-stone-800 p-1 rounded-xl border border-stone-300 dark:border-stone-700 overflow-x-auto w-full md:w-auto scrollbar-hide">
               <button onClick={() => setSubAbaAdmin("fabrica")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${subAbaAdmin === "fabrica" ? "bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                 <Sparkles size={16}/> Fábrica de Cursos
               </button>
               <button onClick={() => setSubAbaAdmin("trilhas")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${subAbaAdmin === "trilhas" ? "bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                 <PlusCircle size={16}/> Novas Trilhas
               </button>
               <button onClick={() => setSubAbaAdmin("aprovacoes")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${subAbaAdmin === "aprovacoes" ? "bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                 <CheckCircle2 size={16}/> Validações RH
                 {APROVACOES_PENDENTES_MOCK.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-stone-900"></span>}
               </button>
            </div>
          </div>

          <div className="flex-1 p-6 lg:p-10">
            
            {/* SUB-ABA: FÁBRICA MÁGICA */}
            {subAbaAdmin === "fabrica" && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="bg-stone-50 dark:bg-stone-950/50 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 mb-8">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5 mb-3"><LinkIcon size={14}/> Extrator Inteligente de Cursos (URL)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="url" value={urlCurso} onChange={e => setUrlCurso(e.target.value)}
                      placeholder="Cole o link do Sebrae, ENAP, etc..." 
                      className="w-full px-5 py-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl text-sm focus:outline-none focus:border-[#A67B5B] transition-all font-medium shadow-inner text-stone-900 dark:text-white"
                    />
                    <button onClick={extrairMetadadosDoCurso} disabled={extraindoUrl || !urlCurso} className="bg-[#A67B5B] text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-[#8d664a] transition-all shadow-xl active:scale-95 disabled:opacity-50 shrink-0 flex items-center justify-center gap-2">
                      {extraindoUrl ? <Loader2 size={18} className="animate-spin"/> : <Search size={18}/>}
                      {extraindoUrl ? "A extrair..." : "Extrair Capa OG"}
                    </button>
                  </div>
                </div>

                <form onSubmit={salvarNovoCurso} className={`transition-all duration-500 ${dadosExtraidos ? 'opacity-100 scale-100 block' : 'hidden'}`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
                      <div className="h-48 w-full relative">
                        {dadosExtraidos?.imagem ? (
                          <img src={dadosExtraidos.imagem} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><ImageIcon size={48}/></div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-1 text-xs font-black text-white bg-stone-900/80 px-3 py-1 rounded-full backdrop-blur-md">
                          {dadosExtraidos?.instituicao || "Instituição"}
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-[10px] font-bold text-indigo-500 mb-2 uppercase tracking-widest">Pré-visualização do Catálogo</p>
                        <h4 className="font-black text-lg text-stone-900 dark:text-white line-clamp-2">{dadosExtraidos?.titulo || "O título aparecerá aqui..."}</h4>
                      </div>
                    </div>

                    <div className="space-y-5 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Trilha de Destino</label>
                        <select value={novoCurso.trilha} onChange={e => setNovoCurso({...novoCurso, trilha: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-bold text-stone-700 dark:text-stone-300 focus:border-[#A67B5B]">
                          {TRILHAS_EXISTENTES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Carga Comprovada (Horas)</label>
                        <input type="number" required value={novoCurso.carga} onChange={e => setNovoCurso({...novoCurso, carga: e.target.value})} placeholder="Ex: 4" className="w-full px-5 py-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:border-[#A67B5B] font-mono" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-500 uppercase tracking-widest">Recompensa (XP Ofertado)</label>
                        <input type="number" required value={novoCurso.xp} onChange={e => setNovoCurso({...novoCurso, xp: e.target.value})} placeholder="Ex: 150" className="w-full px-5 py-3.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400 focus:border-amber-500 font-black" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-lg py-5 rounded-2xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xl active:scale-[0.98]">
                    <CheckCircle2 size={20} /> Publicar Curso para a Equipa
                  </button>
                </form>
              </div>
            )}

            {/* SUB-ABA: GESTÃO DE TRILHAS (EMOJIS) */}
            {subAbaAdmin === "trilhas" && (
              <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
                <div className="bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800 rounded-3xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white dark:bg-stone-900 rounded-full flex items-center justify-center text-3xl shadow-sm mx-auto mb-4 border border-stone-200 dark:border-stone-800">🚀</div>
                    <h3 className="text-2xl font-black text-stone-900 dark:text-white">Criar Nova Categoria (Trilha)</h3>
                    <p className="text-sm text-stone-500 mt-2">Escolha um emoji que represente o setor.</p>
                  </div>

                  <form onSubmit={salvarNovaTrilha} className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-24 space-y-2">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest text-center block">Ícone</label>
                        <select value={novaTrilhaEmoji} onChange={(e) => setNovaTrilhaEmoji(e.target.value)} className="w-full h-[52px] text-center text-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:border-indigo-500 appearance-none cursor-pointer">
                          <option value="🌟">🌟</option>
                          <option value="📊">📊</option>
                          <option value="🗣️">🗣️</option>
                          <option value="📦">📦</option>
                          <option value="📱">📱</option>
                          <option value="🛠️">🛠️</option>
                        </select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Nome da Trilha</label>
                        <input type="text" required value={novaTrilhaNome} onChange={e => setNovaTrilhaNome(e.target.value)} placeholder="Ex: Gestão de Estoque" className="w-full px-5 h-[52px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold text-stone-900 dark:text-white focus:border-indigo-500" />
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex items-center gap-3">
                      <Info size={20} className="text-indigo-500 shrink-0"/>
                      <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Resultado Final: A nova trilha aparecerá nos filtros do sistema como <strong className="font-black bg-white dark:bg-stone-950 px-2 py-0.5 rounded">{novaTrilhaEmoji} {novaTrilhaNome || "Nome"}</strong>.</p>
                    </div>

                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-sm py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]">
                      Salvar Estrutura
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SUB-ABA: MESA DE APROVAÇÃO (COM I.A.) */}
            {subAbaAdmin === "aprovacoes" && (
              <div className="animate-in fade-in duration-300">
                {APROVACOES_PENDENTES_MOCK.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-stone-500 py-20 bg-stone-50 dark:bg-stone-950/50 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800">
                    <CheckCircle2 size={64} className="mb-4 opacity-20 text-emerald-500" />
                    <p className="font-bold text-lg">Mesa Limpa!</p>
                    <p className="text-sm">Todos os certificados foram avaliados pelo RH.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {APROVACOES_PENDENTES_MOCK.map(pendente => (
                      <div key={pendente.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all">
                        
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">Pendente Validação</span>
                              <p className="text-[10px] font-bold text-stone-400">{pendente.data_envio}</p>
                            </div>
                            <h4 className="font-black text-stone-900 dark:text-white text-lg">{pendente.aluno}</h4>
                          </div>
                          
                          <button className="flex flex-col items-center justify-center gap-1 group/pdf" title="Abrir PDF Enviado">
                            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center justify-center group-hover/pdf:bg-indigo-50 group-hover/pdf:text-indigo-600 dark:group-hover/pdf:bg-indigo-500/20 dark:group-hover/pdf:text-indigo-400 transition-colors shadow-inner border border-stone-200 dark:border-stone-700">
                              <FileText size={20}/>
                            </div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">Abrir Prova</span>
                          </button>
                        </div>

                        <div className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-4 mb-6 border border-stone-100 dark:border-stone-800">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">Curso Reivindicado <span title="Regra: Verifique se a carga horária do certificado é igual ou maior que a exigida."><HelpCircle size={12} className="cursor-help" /></span></p>
                            <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded font-mono">{pendente.instituicao}</span>
                          </div>
                          <p className="text-base font-bold text-stone-900 dark:text-white truncate mb-1">{pendente.curso}</p>
                          <p className="text-xs font-medium text-stone-500">Carga Exigida Pelo Sistema: <strong className="text-indigo-500">{pendente.carga_requisitada}</strong></p>
                        </div>

                        <div className="space-y-3">
                          {/* BOTÃO DE I.A. INOVADOR */}
                          <button onClick={auditarComIA} className="w-full py-3 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center gap-2">
                            <BrainCircuit size={16}/> Auditoria Rápida com I.A.
                          </button>
                          
                          <div className="flex gap-3">
                            <button className="flex-1 py-3 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors border border-rose-200 dark:border-rose-500/30">Rejeitar</button>
                            <button onClick={() => aprovarCertificadoComConfete(pendente.id)} className="flex-[2] py-3 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95">
                              <Check size={18} strokeWidth={3}/> Aprovar e Dar XP
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 MODAL: GUIA DE RECOMPENSAS (A POLÍTICA DO JOGO) */}
      {/* ====================================================================== */}
      {modalRecompensas && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalRecompensas(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-md h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950 shrink-0">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-xl flex items-center gap-2">
                  <Gift size={20} className="text-amber-500" /> Política de Incentivos
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Veja o que você ganha ao acumular XP.</p>
              </div>
              <button onClick={() => setModalRecompensas(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors p-2 bg-white dark:bg-stone-900 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
                <Trophy size={80} className="absolute -right-4 -bottom-4 text-amber-200 dark:text-amber-900/30 opacity-50" />
                <h4 className="font-black text-amber-900 dark:text-amber-400 mb-1 relative z-10">Como funciona?</h4>
                <p className="text-xs text-amber-800 dark:text-amber-200/80 font-medium relative z-10">
                  Complete cursos oficiais, submeta o certificado e acumule XP. A cada nível alcançado, a empresa desbloqueia benefícios reais para você.
                </p>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 dark:before:via-stone-700 before:to-transparent">
                
                {/* NIVEL 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-stone-900 bg-[#CD7F32] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-white font-black text-sm z-10">
                    3
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#CD7F32]">Bronze</span>
                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-900 px-2 rounded">1.500 XP</span>
                    </div>
                    <h5 className="font-bold text-sm text-stone-900 dark:text-white leading-tight">Meia Tarde de Folga ou R$ 50 de Bônus</h5>
                  </div>
                </div>

                {/* NIVEL 5 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-stone-900 bg-stone-300 dark:bg-stone-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-stone-700 dark:text-stone-900 font-black text-sm z-10">
                    5
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">Prata</span>
                      <span className="text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-900 px-2 rounded">2.500 XP</span>
                    </div>
                    <h5 className="font-bold text-sm text-stone-900 dark:text-white leading-tight">Vale-Compras de R$ 150,00</h5>
                  </div>
                </div>

                {/* NIVEL 10 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-stone-900 bg-amber-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-amber-900 font-black text-sm z-10">
                    10
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1"><Star size={10}/> Ouro</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-900/30 px-2 rounded">5.000 XP</span>
                    </div>
                    <h5 className="font-bold text-sm text-amber-900 dark:text-amber-300 leading-tight">+1% de Aumento na Comissão Fixa</h5>
                  </div>
                </div>

              </div>
              
              {isAdmin && (
                <div className="mt-8 p-4 bg-stone-100 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
                  <ShieldAlert size={20} className="mx-auto text-stone-400 mb-2"/>
                  <p className="text-xs text-stone-500 font-medium">As regras acima são definidas pela diretoria e podem ser alteradas nas configurações gerais do sistema.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* (O MODAL DE UPLOAD DE CERTIFICADO DO ALUNO CONTINUA INTACTO AQUI EMBAIXO) */}
      {modalUpload && cursoAlvo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={() => !enviando && setModalUpload(false)}></div>
          
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-950/50 shrink-0">
              <div>
                <h3 className="font-black text-stone-900 dark:text-white text-xl flex items-center gap-2">
                  <UploadCloud size={20} className="text-indigo-500" /> Prova de Conclusão
                </h3>
                <p className="text-xs text-stone-500 font-medium mt-0.5">Envie o certificado oficial em PDF ou JPG.</p>
              </div>
              <button disabled={enviando} onClick={() => setModalUpload(false)} className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={enviarCertificadoSupabase} className="p-6 space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-xl">
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Pleiteando os XP do curso:</p>
                <p className="text-sm font-bold text-stone-900 dark:text-white">{cursoAlvo.titulo}</p>
              </div>

              <div className="w-full border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-8 bg-stone-50 dark:bg-stone-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer group relative text-center">
                <FileText size={40} className="mx-auto text-stone-300 dark:text-stone-600 mb-3 group-hover:text-indigo-500 group-hover:-translate-y-1 transition-all" />
                
                {ficheiroCertificado ? (
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate px-4">{ficheiroCertificado.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-bold text-stone-600 dark:text-stone-300 mb-1">Clique para procurar o arquivo</p>
                    <p className="text-xs text-stone-400">Use o arquivo baixado do portal do Sebrae ou ENAP.</p>
                  </>
                )}
                
                <input 
                  type="file" accept=".pdf,.png,.jpg,.jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFicheiroCertificado(e.target.files[0]);
                    }
                  }} 
                />
              </div>

              <button type="submit" disabled={enviando || !ficheiroCertificado} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-lg py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                {enviando ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {enviando ? "A encriptar e enviar..." : "Submeter para Validação do RH"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
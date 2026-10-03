"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck, Box } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  
  // 🛡️ ESTADOS ANTI-BUG (O Porteiro Invisível)
  const [isMounted, setIsMounted] = useState(false);
  const [verificandoSessao, setVerificandoSessao] = useState(true);

  // 🚀 O NOVO CAMALEÃO: Começa vazio. Se o banco tiver dados, ele se veste.
  const [configLoja, setConfigLoja] = useState({
    nome: "",
    slogan: "Acesso restrito à equipe corporativa.", 
    logo: "", 
    bg_login: "",
  });

  const router = useRouter();
  const supabase = createClient();

  // 🚀 O PORTEIRO AVANÇADO: Verifica a sessão E busca a logo no banco
  useEffect(() => {
    setIsMounted(true);
    
    const inicializarSistema = async () => {
      // 1. Busca a Configuração da Loja no Supabase
      const { data: config } = await supabase.from('loja_config').select('*').limit(1).single();
      
      if (config) {
        setConfigLoja({
          nome: config.nome_fantasia || "",
          // 👇 Puxa o slogan do banco, com fallback elegante
          slogan: config.slogan || "Conforto e luxo para o seu lar.",
          logo: config.logo_url || "",
          // 👇 Puxa o BG do banco. Se não tiver, fica vazio (o CSS cuida de deixar escuro e bonito)
          bg_login: config.bg_login || ""
        });
      }

      // 2. Verifica a sessão para redirecionar ou liberar o login
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setVerificandoSessao(false);
      }
    };
    
    inicializarSistema();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Credenciais inválidas. Tente novamente.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  // 🛡️ TELA DE CARREGAMENTO SEGURO (Bloqueia o "piscar" da tela)
  if (!isMounted || verificandoSessao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-[#A67B5B]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">Iniciando Baply OS...</p>
      </div>
    );
  }

  // 🛡️ Lógica do "Camaleão": A loja tem identidade própria no banco? (Logo OU Bg ativam o modo)
  const temPersonalizacao = Boolean(configLoja.logo || configLoja.bg_login);

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans animate-in fade-in duration-500">
      
      {/* ====================================================================== */}
      {/* 🎨 LADO ESQUERDO: O PALCO (Alterna entre Baply e a Marca do Cliente) */}
      {/* ====================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-stone-900 p-12 flex-col justify-between relative overflow-hidden group">
        
        {temPersonalizacao ? (
          // 🌟 CENÁRIO A: MARCA DO CLIENTE (Puxado do Supabase)
          <>
            <div className="absolute inset-0 z-0 bg-stone-950">
              {configLoja.bg_login && (
                <img src={configLoja.bg_login} alt="Fundo" className="w-full h-full object-cover opacity-30 animate-in zoom-in-105 duration-1000" />
              )}
              {/* ✨ Efeito Mágico: Orbs e Poeira Cósmica no BG para dar ar premium */}
              <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#A67B5B] rounded-full blur-[180px] opacity-20 animate-pulse duration-10000 mix-blend-screen pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-stone-500 rounded-full blur-[200px] opacity-10 mix-blend-screen pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent pointer-events-none"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center gap-4 animate-in slide-in-from-left-8 duration-700">
              {configLoja.logo && (
                <div className="relative flex items-center justify-start w-32 h-32 md:w-40 md:h-40 mb-2 transition-transform hover:scale-105 duration-500">
                  {/* ✨ O TRUQUE DE MESTRE: Aura de Luz Branca que derrete o fundo branco de JPEGs */}
                  <div className="absolute inset-0 bg-white/80 rounded-full blur-3xl opacity-80 mix-blend-screen pointer-events-none"></div>
                  <img 
                    src={configLoja.logo} 
                    alt="Logo" 
                    className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl mix-blend-multiply brightness-110" 
                  />
                </div>
              )}
            </div>

            <div className="relative z-10 animate-in slide-in-from-bottom-8 duration-700 delay-150">
              <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-xl">
                Workspace <br/>
                <span className="text-[#A67B5B]">{configLoja.nome}</span>
              </h1>
              <p className="text-stone-300 text-lg lg:text-xl font-medium max-w-md border-l-2 border-[#A67B5B] pl-4 opacity-90">
                {configLoja.slogan}
              </p>
            </div>
          </>
        ) : (
          // 🔵 CENÁRIO B: FALLBACK BAPLY (Original e Intacto)
          <>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#A67B5B] rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-stone-800 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 flex items-center gap-3 animate-in slide-in-from-left-8 duration-700">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#A67B5B] font-black text-2xl shadow-lg">
                B
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">
                Baply<span className="text-[#A67B5B]">.</span>
              </span>
            </div>

            <div className="relative z-10 animate-in slide-in-from-bottom-8 duration-700 delay-150">
              <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-6">
                A evolução da<br />
                sua gestão começa<br />
                <span className="text-[#A67B5B]">aqui.</span>
              </h1>
              <p className="text-stone-400 text-lg font-medium max-w-md">
                Acesse o Workspace exclusivo da Baply. Controle de tropa, gestão de ponto e dados em uma única plataforma premium.
              </p>
            </div>
          </>
        )}

        {/* Selo de Segurança (Fica igual nos dois cenários) */}
        <div className="relative z-10 flex items-center gap-2 text-stone-400 text-sm font-medium animate-in fade-in duration-1000 delay-300">
          <ShieldCheck size={18} className={temPersonalizacao ? "text-[#A67B5B]" : "text-[#A67B5B]"} />
          <span>Ambiente corporativo seguro</span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 🔐 LADO DIREITO: FORMULÁRIO DE LOGIN (A MÁQUINA) */}
      {/* ====================================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 relative z-10 bg-stone-50">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            
            <div className="mb-10 text-center lg:text-left">
              {/* Logo para versão Mobile */}
              <div className="lg:hidden mx-auto mb-6 flex justify-center">
                {temPersonalizacao && configLoja.logo ? (
                  <div className="relative w-24 h-24">
                     {/* No mobile também removemos o fundo branco via CSS */}
                     <img src={configLoja.logo} className="w-full h-full object-contain mix-blend-multiply drop-shadow-md" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center text-[#A67B5B] font-black text-3xl shadow-lg">
                    B
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-stone-900 tracking-tight">Bem-vindo de volta</h2>
              <p className="text-stone-500 font-medium mt-2">
                {temPersonalizacao ? `Acesso restrito à equipe ${configLoja.nome}.` : "Insira suas credenciais corporativas."}
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <div className="w-1.5 h-full bg-red-600 rounded-full"></div>
                {erro}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">E-mail Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all shadow-sm"
                    placeholder="voce@empresa.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">Senha de Acesso</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Acessar Workspace"}
              </button>
            </form>
          </div>
        </div>

        {/* 👇 A ASSINATURA DE GRIFE (Sempre visível no rodapé) */}
        <div className="mt-8 flex justify-center animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-200/50 rounded-full text-stone-400 opacity-60 hover:opacity-100 transition-opacity cursor-default">
            <Box size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Powered by Baply OS</span>
          </div>
        </div>

      </div>
    </div>
  );
}
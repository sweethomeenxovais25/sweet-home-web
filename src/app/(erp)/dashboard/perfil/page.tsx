"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Camera, User, Mail, Briefcase, ShieldCheck, 
  Phone, KeyRound, Moon, Sun, MonitorSmartphone, Loader2, ChevronDown, MapPin, Fingerprint
} from "lucide-react";
import { useTheme } from "next-themes";

const STATUS_OPTIONS = [
  { nome: "Disponível", corBolinha: "bg-emerald-500", estiloBadge: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  { nome: "Focado", corBolinha: "bg-red-500", estiloBadge: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" },
  { nome: "Almoço", corBolinha: "bg-amber-500", estiloBadge: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" },
  { nome: "Ausente", corBolinha: "bg-stone-400", estiloBadge: "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700" }
];

export default function MeuPerfilPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuStatusRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [menuStatusAberto, setMenuStatusAberto] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const [perfil, setPerfil] = useState({
    id: "", nome: "", email: "", cargo: "", nivel: "", status: "Disponível", avatar_url: "",
    // Dados Cadastrais Novos
    telefone: "", cpf_cnpj: "", data_nascimento: "",
    // Endereço
    cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: ""
  });

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: db } = await supabase.from("perfis").select("*").eq("id", user.id).single();
        if (db) {
          setPerfil({
            id: user.id, nome: db.nome || "", email: user.email || "", cargo: db.cargo || "Colaborador",
            nivel: db.nivel || "Básico", status: db.status || "Disponível", avatar_url: db.avatar_url || "",
            telefone: db.telefone || "", cpf_cnpj: db.cpf_cnpj || "", data_nascimento: db.data_nascimento || "",
            cep: db.cep || "", endereco: db.endereco || "", numero: db.numero || "", complemento: db.complemento || "",
            bairro: db.bairro || "", cidade: db.cidade || "", estado: db.estado || ""
          });
        }
      }
      setLoading(false);
    }
    carregarPerfil();

    function handleClickOutside(event: MouseEvent) {
      if (menuStatusRef.current && !menuStatusRef.current.contains(event.target as Node)) setMenuStatusAberto(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  // 🚀 MÁGICA DO CEP AUTOMÁTICO
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoCep = e.target.value.replace(/\D/g, ''); // Remove o que não é número
    setPerfil({ ...perfil, cep: novoCep });

    if (novoCep.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${novoCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setPerfil(prev => ({
            ...prev,
            endereco: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || ""
          }));
          toast.success("Endereço localizado com sucesso!");
        } else {
          toast.error("CEP não encontrado.");
        }
      } catch (error) {
        toast.error("Erro ao buscar o CEP.");
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleUploadFoto = async (event: React.ChangeEvent<HTMLInputElement>) => { /* Mantido igual */
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error("Selecione uma imagem.");
      const file = event.target.files[0];
      const filePath = `${perfil.id}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      await supabase.from('perfis').update({ avatar_url: publicUrl }).eq('id', perfil.id);
      setPerfil({ ...perfil, avatar_url: publicUrl });
      toast.success("Foto atualizada!");
      window.dispatchEvent(new Event("perfilAtualizado"));
    } catch (error: any) { toast.error("Erro na foto", { description: error.message }); } finally { setUploading(false); }
  };

  const handleSalvarDados = async () => {
    setSalvando(true);
    try {
      // 💾 AGORA SALVAMOS TODOS OS CAMPOS NO BANCO
      const { error } = await supabase.from("perfis").update({ 
        nome: perfil.nome, telefone: perfil.telefone, cpf_cnpj: perfil.cpf_cnpj, data_nascimento: perfil.data_nascimento,
        cep: perfil.cep, endereco: perfil.endereco, numero: perfil.numero, complemento: perfil.complemento, 
        bairro: perfil.bairro, cidade: perfil.cidade, estado: perfil.estado
      }).eq("id", perfil.id);
      if (error) throw error;
      toast.success("Dados salvos!");
      window.dispatchEvent(new Event("perfilAtualizado"));
    } catch (error: any) {
      toast.error("Erro ao salvar", { description: error.message });
    } finally {
      setSalvando(false);
    }
  };

  const mudarStatus = async (novoStatus: string) => { /* Mantido igual */
    setPerfil({ ...perfil, status: novoStatus });
    setMenuStatusAberto(false);
    try { await supabase.from("perfis").update({ status: novoStatus }).eq("id", perfil.id); toast.success(`Status alterado`); } catch (error) {}
  };

  if (loading) return <div className="flex justify-center p-20 text-stone-400"><Loader2 className="animate-spin" size={32} /></div>;
  const statusAtual = STATUS_OPTIONS.find(s => s.nome === perfil.status) || STATUS_OPTIONS[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative max-w-5xl mx-auto mb-20">
      
      <div className="mb-10">
        <h1 className="text-4xl font-black text-stone-900 tracking-tight transition-colors">Meu Perfil</h1>
        <p className="text-stone-500 font-medium mt-1 transition-colors">Gerencie sua identidade digital e informações no ecossistema Baply.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUNA ESQUERDA: O SUPER-AVATAR (Mantido Intacto) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 p-8 flex flex-col items-center text-center relative group transition-colors">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-stone-100 to-white dark:from-stone-700/50 dark:to-stone-800 -z-10 rounded-t-[2rem] transition-colors"></div>

            <div className="relative mb-6 mt-4">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-stone-700 shadow-xl bg-stone-100 dark:bg-stone-800 transition-colors" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-stone-900 dark:bg-stone-200 flex items-center justify-center text-5xl border-4 border-white dark:border-stone-700 shadow-xl overflow-hidden transition-colors">👨‍💼</div>
              )}
              
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUploadFoto} disabled={uploading} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 w-10 h-10 bg-[#A67B5B] hover:bg-stone-900 dark:hover:bg-white dark:hover:text-stone-900 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-stone-700 disabled:opacity-50">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              </button>
            </div>

            <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">{perfil.nome}</h2>
            <p className="text-stone-500 dark:text-stone-400 font-medium flex items-center justify-center gap-2 mt-1 transition-colors">{perfil.cargo}</p>

            <div className="flex gap-2 mt-6 w-full justify-center items-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors ${perfil.nivel === 'Admin' ? 'bg-stone-900 text-[#A67B5B] dark:bg-[#A67B5B]/15 dark:text-[#A67B5B]' : 'bg-stone-100 text-stone-600 dark:bg-stone-900/50 dark:text-stone-300'}`}>
                {perfil.nivel === 'Admin' && <ShieldCheck size={14} />} {perfil.nivel}
              </span>
              
              <div className="relative" ref={menuStatusRef}>
                <button onClick={() => setMenuStatusAberto(!menuStatusAberto)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm transition-all hover:scale-105 active:scale-95 ${statusAtual.estiloBadge}`}>
                  <div className="relative flex h-2 w-2 items-center justify-center">
                    {perfil.status === 'Disponível' && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${statusAtual.corBolinha} opacity-75`}></span>}
                    <span className={`relative inline-flex h-2 w-2 rounded-full ${statusAtual.corBolinha}`}></span>
                  </div>
                  {perfil.status}
                  <ChevronDown size={12} className="opacity-50 ml-0.5" />
                </button>

                {menuStatusAberto && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-40 bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-100 dark:border-stone-700 p-1.5 z-[99] animate-in fade-in zoom-in-95 duration-200">
                    {STATUS_OPTIONS.map((opcao) => (
                      <button key={opcao.nome} onClick={() => mudarStatus(opcao.nome)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg transition-all text-left ${perfil.status === opcao.nome ? "bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white"}`}>
                        <span className={`w-2 h-2 rounded-full ${opcao.corBolinha} ${perfil.status === opcao.nome ? 'animate-pulse' : ''}`}></span>{opcao.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: CONFIGURAÇÕES */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* BLOCO 1: DADOS PESSOAIS */}
          <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 p-8 transition-colors">
            <h3 className="font-black text-stone-900 dark:text-white text-lg mb-6 flex items-center gap-2 transition-colors"><User className="text-[#A67B5B]" /> Dados Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Nome Completo</label>
                <input type="text" value={perfil.nome} onChange={(e) => setPerfil({...perfil, nome: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Data de Nascimento</label>
                <input type="date" value={perfil.data_nascimento} onChange={(e) => setPerfil({...perfil, data_nascimento: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">CPF / CNPJ <span className="font-normal normal-case opacity-60">(Opcional)</span></label>
                <div className="relative">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={18} />
                  <input type="text" value={perfil.cpf_cnpj} onChange={(e) => setPerfil({...perfil, cpf_cnpj: e.target.value})} placeholder="000.000.000-00" className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">WhatsApp / Celular</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={18} />
                  <input type="text" value={perfil.telefone} onChange={(e) => setPerfil({...perfil, telefone: e.target.value})} placeholder="(00) 00000-0000" className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center justify-between transition-colors">E-mail Corporativo <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 px-2 py-0.5 rounded-md transition-colors">Somente Leitura</span></label>
                <div className="relative opacity-70">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" size={18} />
                  <input type="text" value={perfil.email} readOnly className="w-full pl-11 pr-4 py-3 bg-stone-100 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-400 cursor-not-allowed transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 2: ENDEREÇO (Com Mágica do ViaCEP) */}
          <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 p-8 transition-colors">
            <h3 className="font-black text-stone-900 dark:text-white text-lg mb-6 flex items-center gap-2 transition-colors"><MapPin className="text-[#A67B5B]" /> Endereço Principal</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="space-y-1.5 md:col-span-4 relative">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">CEP</label>
                <input type="text" value={perfil.cep} onChange={handleCepChange} maxLength={8} placeholder="00000-000" className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
                {buscandoCep && <Loader2 size={16} className="absolute right-4 top-9 animate-spin text-[#A67B5B]" />}
              </div>

              <div className="space-y-1.5 md:col-span-8">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Logradouro (Rua/Av)</label>
                <input type="text" value={perfil.endereco} onChange={(e) => setPerfil({...perfil, endereco: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Número</label>
                <input type="text" value={perfil.numero} onChange={(e) => setPerfil({...perfil, numero: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5 md:col-span-4">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Complemento</label>
                <input type="text" value={perfil.complemento} onChange={(e) => setPerfil({...perfil, complemento: e.target.value})} placeholder="Apto, Sala..." className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5 md:col-span-5">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Bairro</label>
                <input type="text" value={perfil.bairro} onChange={(e) => setPerfil({...perfil, bairro: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5 md:col-span-8">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Cidade</label>
                <input type="text" value={perfil.cidade} onChange={(e) => setPerfil({...perfil, cidade: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white" />
              </div>

              <div className="space-y-1.5 md:col-span-4">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest transition-colors">Estado</label>
                <input type="text" value={perfil.estado} onChange={(e) => setPerfil({...perfil, estado: e.target.value})} placeholder="UF" maxLength={2} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-medium text-stone-900 dark:text-white uppercase" />
              </div>
            </div>

            {/* BOTÃO SALVAR MOVIDO PARA CÁ PRA SALVAR TUDO JUNTO */}
            <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-700 flex justify-end">
              <button onClick={handleSalvarDados} disabled={salvando} className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-sm rounded-xl hover:bg-stone-800 dark:hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-stone-900/20 disabled:opacity-50 flex items-center gap-2">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : null} Salvar Todas Alterações
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 p-8 flex flex-col justify-between transition-colors">
              <div><h3 className="font-black text-stone-900 dark:text-white text-lg mb-2 flex items-center gap-2 transition-colors"><KeyRound className="text-stone-400" /> Segurança</h3><p className="text-sm text-stone-500 dark:text-stone-400 font-medium mb-6 transition-colors">Mantenha sua conta protegida atualizando sua senha periodicamente.</p></div>
              <button className="w-full py-3 px-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-bold text-sm rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors">Alterar Senha de Acesso</button>
            </div>

            <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 p-8 flex flex-col justify-between transition-colors">
              <div><h3 className="font-black text-stone-900 dark:text-white text-lg mb-2 flex items-center gap-2 transition-colors"><MonitorSmartphone className="text-stone-400" /> Estilo dos Painéis</h3><p className="text-sm text-stone-500 dark:text-stone-400 font-medium mb-6 transition-colors">Personalize o contraste dos seus quadros de trabalho.</p></div>
              <div className="flex bg-stone-100 dark:bg-stone-900 p-1.5 rounded-xl transition-colors">
                <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme !== 'dark' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}>
                  <Sun size={16} /> Claro
                </button>
                <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${theme === 'dark' ? 'bg-stone-700 shadow-sm text-white' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'}`}>
                  <Moon size={16} /> Escuro
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
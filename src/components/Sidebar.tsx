"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase"; 
import { 
  LayoutDashboard, ShoppingCart, CircleDollarSign, 
  Package, Megaphone, LogOut, ShieldCheck, 
  FileArchive, Radar, Server, Menu, X 
} from "lucide-react";
import { usePerfil } from "@/contexts/PerfilContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); 
  const supabase = createClient();
  
  // 📱 Estado para controlar o menu no celular (ELE VOLTOU!)
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // 🪄 Descobrimos qual é o cargo/nível da pessoa logada
  const { nivel } = usePerfil();

  // 🚀 FUNÇÃO DE DESLOGAR COM SEGURANÇA
  const handleSair = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    await supabase.auth.signOut(); 
    window.location.href = "/"; 
  };

  const fecharMenu = () => setMenuMobileAberto(false);

  // 🗺️ O NOSSO MAPA DE NAVEGAÇÃO COM NÍVEIS DE ACESSO
  const menuItems = [
    { nome: "Visão Global", rota: "/dashboard", Icone: LayoutDashboard, adminOnly: false },
    { nome: "Vendas (PDV)", rota: "/dashboard/vendas", Icone: ShoppingCart, adminOnly: false },
    { nome: "Estoque Omni", rota: "/dashboard/estoque", Icone: Package, adminOnly: false },
    
    // 👇 Telas de Alta Gestão
    { nome: "Financeiro & CRM", rota: "/dashboard/financeiro", Icone: CircleDollarSign, adminOnly: true },
    { nome: "Marketing Studio", rota: "/dashboard/marketing", Icone: Megaphone, adminOnly: true },
    { nome: "Cofre & Docs", rota: "/dashboard/documentos", Icone: Server, adminOnly: true },
    { nome: "Gestão de Tropa", rota: "/dashboard/configuracoes", Icone: ShieldCheck, adminOnly: true }, 
    { nome: "Relatórios & DRE", rota: "/dashboard/relatorios", Icone: FileArchive, adminOnly: true },
    { nome: "Governança", rota: "/dashboard/governanca", Icone: Radar, adminOnly: true },
  ];

  // 🛡️ FILTRO DE SEGURANÇA CORRIGIDO:
  // Se não tiver nível cadastrado (!nivel), ele libera para não te prender no seu próprio sistema!
  const isDiretoria = !nivel || nivel === "Administrador" || nivel === "CEO" || nivel === "Diretor" || nivel === "Gerente" || nivel.includes("Admin");
  
  const menuFiltrado = menuItems.filter(item => {
    if (item.adminOnly && !isDiretoria) return false;
    return true; 
  });

  return (
    <>
      {/* 📱 BOTÃO FLUTUANTE MOBILE (Para a sua irmã acessar da loja) */}
      <button 
        onClick={() => setMenuMobileAberto(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#A67B5B] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(166,123,91,0.5)] active:scale-95 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* 📱 BACKDROP ESCURO DO MOBILE */}
      {menuMobileAberto && (
        <div 
          onClick={fecharMenu}
          className="md:hidden fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
        />
      )}

      {/* 🖥️ A NOSSA SIDEBAR HÍBRIDA (Responsiva + Trava de Segurança) */}
      <aside className={`fixed z-[70] flex flex-col overflow-hidden bg-stone-900 border-stone-800 transition-all duration-300 ease-out shadow-2xl group
        ${menuMobileAberto ? "translate-x-0" : "-translate-x-full"} 
        inset-y-0 left-0 w-64 border-r rounded-r-[2rem] md:border-r-0
        md:translate-x-0 md:left-4 md:top-24 md:bottom-6 md:w-[72px] md:hover:w-64 md:rounded-2xl md:border`}
      >
        
        {/* CABEÇALHO MOBILE */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-stone-800 shrink-0">
          <h2 className="text-white font-black text-2xl tracking-tight">Menu <span className="text-[#A67B5B]">Baply</span></h2>
          <button onClick={fecharMenu} className="text-stone-400 hover:text-white p-2 rounded-full hover:bg-stone-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Container de navegação (Scroll invisível garantido!) */}
        <nav className="flex-1 py-6 px-3 space-y-4 overflow-y-auto overflow-x-hidden flex flex-col items-start md:mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {menuFiltrado.map((item) => {
            const isAtivo = pathname === item.rota;
            const Icone = item.Icone;
            
            return (
              <Link
                key={item.nome}
                href={item.rota}
                onClick={fecharMenu}
                className="flex items-center gap-4 w-full group/item"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ease-out md:group-hover/item:scale-110 ${
                  isAtivo 
                    ? 'bg-[#A67B5B] text-white shadow-[0_0_15px_rgba(166,123,91,0.5)]' 
                    : 'bg-stone-800 text-stone-400 group-hover/item:bg-stone-700 group-hover/item:text-white group-hover/item:shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                }`}>
                  <Icone size={22} strokeWidth={isAtivo ? 2.5 : 2} />
                </div>
                
                <span className={`whitespace-nowrap font-medium transition-all duration-300 ease-out origin-left ${
                  isAtivo ? 'text-white' : 'text-stone-400 group-hover/item:text-white'
                } opacity-100 scale-100 md:opacity-0 md:group-hover:opacity-100 md:scale-95 md:group-hover:scale-100`}>
                  {item.nome}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Botão de Sair */}
        <div className="p-3 mb-2 shrink-0 md:border-t border-stone-800/50 md:pt-4">
          <button 
            onClick={handleSair} 
            className="flex items-center gap-4 w-full group/item"
          >
            <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center shrink-0 transition-all duration-300 ease-out md:group-hover/item:scale-110 group-hover/item:bg-red-950 group-hover/item:text-red-400 group-hover/item:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <LogOut size={22} />
            </div>
            <span className="opacity-100 whitespace-nowrap font-medium text-stone-400 transition-all duration-300 origin-left md:scale-95 md:opacity-0 md:group-hover:opacity-100 md:group-hover:scale-100 group-hover/item:text-red-400">
              Sair do Sistema
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePerfil } from "@/contexts/PerfilContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { carregando } = usePerfil();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 animate-in fade-in duration-500">
      {/* Sidebar e Header SEMPRE presentes. Nunca mais serão destruídos! */}
      <Header />
      <Sidebar />
      
      <main className="pt-24 pl-[104px] pr-8 pb-8 transition-all duration-300 relative min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* 🛡️ Se o cérebro ainda estiver carregando, mostramos um loading suave SOBRE a tela, sem destruir as páginas filhas */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center pt-32 animate-in fade-in duration-300">
              <Loader2 className="animate-spin text-[#A67B5B] mb-4" size={40} />
              <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                Sincronizando Workspace...
              </p>
            </div>
          ) : (
            children
          )}
          
        </div>
      </main>
    </div>
  );
}
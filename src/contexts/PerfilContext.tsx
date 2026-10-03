"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { createClient } from "@/lib/supabase";

// Define a estrutura do nosso "Coração"
type PerfilContextData = {
  nome: string;
  avatar_url: string;
  cargo: string;
  status: string;
  nivel: string;
  email: string;
  carregando: boolean; 
  atualizarPerfil: () => void;
};

const PerfilContext = createContext<PerfilContextData>({} as PerfilContextData);

export function PerfilProvider({ children }: { children: ReactNode }) {
  // 🛡️ TRAVA 1: Memoizamos o cliente para garantir que ele não seja recriado a cada renderização
  const supabase = useMemo(() => createClient(), []);
  
  const [carregando, setCarregando] = useState(true);
  const [inicializado, setInicializado] = useState(false); // 🔒 A NOSSA NOVA SENTINELA

  const [perfil, setPerfil] = useState({
    nome: "",
    avatar_url: "",
    cargo: "Colaborador",
    status: "Disponível",
    nivel: "",
    email: "",
  });

  // Função que vai no cofre buscar os dados
  const carregarPerfil = async () => {
    // 🛡️ TRAVA 2: Se o sistema já iniciou uma vez, NUNCA MAIS mostramos a tela de loading global
    if (!inicializado) {
      setCarregando(true);
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: db } = await supabase.from("perfis").select("*").eq("id", user.id).single();
        if (db) {
          setPerfil({
            nome: db.nome || "Usuário",
            avatar_url: db.avatar_url || "",
            cargo: db.cargo || "Colaborador",
            status: db.status || "Disponível",
            nivel: db.nivel || "Básico",
            email: user.email || "",
          });
        } else {
          setPerfil((prev) => ({ ...prev, email: user.email || "" }));
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setCarregando(false);
      setInicializado(true); // 🔒 Tranca a porta! O loading global nunca mais interrompe o utilizador.
    }
  };

  useEffect(() => {
    // 1. Busca na primeira vez que o sistema abre
    carregarPerfil();

    // 2. O Ouvinte do Supabase!
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        carregarPerfil();
      } else if (event === "SIGNED_OUT") {
        setPerfil({
          nome: "", avatar_url: "", cargo: "Colaborador", status: "Disponível", nivel: "", email: ""
        });
      }
    });

    // 3. O RÁDIO: Escuta o sinal "perfilAtualizado" que disparamos na tela de Perfil
    window.addEventListener("perfilAtualizado", carregarPerfil);
    
    return () => {
      window.removeEventListener("perfilAtualizado", carregarPerfil);
      authListener.subscription.unsubscribe();
    };
    // 🛡️ TRAVA 3: Dependência vazia para o useEffect não ficar "piscando" o contexto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <PerfilContext.Provider value={{ ...perfil, carregando, atualizarPerfil: carregarPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}

// 🪄 A LINHA MÁGICA: O gancho que as outras telas vão usar para receber os dados!
export const usePerfil = () => useContext(PerfilContext);
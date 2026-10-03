import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase";

export const revalidate = 60; 

export default async function VitrineLayout({ children }: { children: React.ReactNode }) {
  // O código antigo foi adaptado para usar o createClient() e manter a coerência do Monorepo
  const supabase = createClient();
  const { data: configs } = await supabase.from('configuracoes').select('*');
  const logoUrl = configs?.find((c: any) => c.chave === 'brand_logo')?.valor || '/images/logo.png';

  return (
    <div className="flex flex-col min-h-screen bg-brand-base">
      <Navbar logoUrl={logoUrl} />
      
      {/* O conteúdo das páginas (ex: a home de vendas) será injetado aqui */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
}
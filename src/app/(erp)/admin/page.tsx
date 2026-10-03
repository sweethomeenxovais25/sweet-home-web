import { supabase } from "@/lib/supabase";
import Link from "next/link";
import HeroEditor from "@/components/HeroEditor";

export const revalidate = 0;

export default async function AdminDashboard() {
  const { count: totalProdutos } = await supabase.from('produtos').select('*', { count: 'exact', head: true });
  const { count: produtosDestaque } = await supabase.from('produtos').select('*', { count: 'exact', head: true }).eq('destaque', true);
  const { data: configs } = await supabase.from('configuracoes').select('*');
  const heroTitulo = configs?.find(c => c.chave === 'hero_titulo')?.valor || 'O toque de conforto que o seu lar merece.';
  const heroSubtitulo = configs?.find(c => c.chave === 'hero_subtitulo')?.valor || 'Nova Coleção Outono/Inverno';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">Visão Geral</h1>
        <p className="text-gray-500 mt-1">Gerencie o conteúdo do site sem precisar alterar o código.</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Produtos Cadastrados</h3>
          <span className="text-4xl font-black text-brand-brown">{totalProdutos || 0}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Na Vitrine (Destaques)</h3>
          <span className="text-4xl font-black text-brand-gold">{produtosDestaque || 0}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-start">
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Integração API</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">Conectado (GestoBap)</span>
        </div>
      </div>

      {/* Área de Edição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        
        {/* Editor de Banners */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-brand-base/50">
            <h2 className="text-lg font-bold text-brand-brown">Editar Hero Banner</h2>
            <p className="text-sm text-gray-500">Altere a chamada principal da página inicial.</p>
          </div>
          
          <HeroEditor tituloAtual={heroTitulo} subtituloAtual={heroSubtitulo} />
        </div>

        {/* Gestão Rápida de Vitrine */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-brand-base/50">
            <h2 className="text-lg font-bold text-brand-brown">Acesso Rápido: Vitrine</h2>
            <p className="text-sm text-gray-500">Adicione ou remova produtos da tela inicial.</p>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center border-2 border-dashed border-gray-200 m-6 rounded-xl">
            <div className="text-brand-gold mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-brand-brown mb-4">Gerenciador de Grid</p>
            <Link href="/admin/produtos" className="px-6 py-2 bg-brand-gold text-brand-brown text-sm font-bold rounded-full hover:brightness-110 transition-all shadow-md">
              Abrir Gerenciador Completo
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
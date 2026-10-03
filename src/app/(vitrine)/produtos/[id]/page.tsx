import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

export const revalidate = 60;

export default async function ProdutoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { data: produto } = await supabase
    .from('vitrine_produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (!produto) {
    notFound();
  }

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="bg-brand-base min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        
        {/* Navegação Estrutural (Breadcrumbs Premium) */}
        <nav className="mb-12 flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-brand-brown/50">
          <Link href="/" className="hover:text-brand-gold transition-colors">Início</Link>
          <span className="text-brand-gold">/</span>
          <Link href="/produtos" className="hover:text-brand-gold transition-colors">Catálogo</Link>
          <span className="text-brand-gold">/</span>
          <span className="text-brand-brown">{produto.categoria}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Lado Esquerdo: Imagem (Sticky - Acompanha a rolagem) */}
          <div className="lg:sticky lg:top-32 relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(74,53,37,0.2)] group bg-white">
            {produto.esgotado && (
              <span className="absolute top-8 left-8 z-20 bg-brand-brown text-white text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
                Esgotado
              </span>
            )}
            {produto.precoPromocional && !produto.esgotado && (
              <span className="absolute top-8 left-8 z-20 bg-brand-gold/90 backdrop-blur-md text-brand-brown text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-full shadow-lg border border-brand-gold/50">
                Oferta Especial
              </span>
            )}
            
            <div className="aspect-[4/5] w-full relative overflow-hidden bg-brand-base/50">
              <img
                src={produto.imagem}
                alt={produto.nome}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${produto.esgotado ? "opacity-60 grayscale" : ""}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>

          {/* Lado Direito: Detalhes do Produto */}
          <div className="flex flex-col py-8">
            <span className="text-sm text-brand-gold uppercase tracking-widest font-bold mb-4 block">
              {produto.categoria}
            </span>
            <h1 className="text-4xl md:text-5xl font-headings font-bold text-brand-brown mb-6 leading-[1.1]">
              {produto.nome}
            </h1>

            <div className="mb-8 flex items-baseline gap-4">
              {produto.precoPromocional ? (
                <>
                  <span className="text-4xl font-body font-black text-brand-brown">{formatarPreco(produto.precoPromocional)}</span>
                  <span className="text-lg text-brand-brown/40 line-through font-medium">{formatarPreco(produto.preco)}</span>
                </>
              ) : (
                <span className="text-4xl font-body font-black text-brand-brown">{formatarPreco(produto.preco)}</span>
              )}
            </div>

            <div className="text-brand-brown/80 mb-10 leading-relaxed font-light text-lg">
              <p>
                Experimente o conforto inigualável de uma peça pensada para transformar o seu descanso. 
                Confeccionada com atenção aos mínimos detalhes, esta peça traz a elegância de um hotel cinco estrelas diretamente para o seu lar.
              </p>
            </div>

            {/* Seletor de Tamanhos Estilo Alfaiataria */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-brand-brown uppercase tracking-widest">Tamanho</h3>
                <button className="text-xs text-brand-gold underline underline-offset-4 hover:text-brand-brown transition-colors">Guia de Medidas</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Solteiro", "Casal", "Queen", "King"].map((tamanho) => (
                  <button key={tamanho} className="px-4 py-3 border border-brand-brown/20 rounded-xl text-sm font-bold text-brand-brown/60 hover:border-brand-gold hover:text-brand-brown hover:bg-brand-gold/5 transition-all focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none">
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão de Adicionar Integrado */}
            <div className="pt-8 border-t border-brand-brown/10">
              <AddToCartButton produto={produto} />
            </div>
            
            {/* Informações Extras (Trust Markers Internos) */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-brand-brown/10">
               <div className="flex items-center gap-4 text-brand-brown/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  <span className="text-sm font-medium">Troca grátis em 7 dias</span>
               </div>
               <div className="flex items-center gap-4 text-brand-brown/70">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-sm font-medium">Compra 100% Segura</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
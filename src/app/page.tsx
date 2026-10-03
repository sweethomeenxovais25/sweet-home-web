import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Lock } from "lucide-react"; // 👈 Adicionamos o ícone do cadeado aqui

export const revalidate = 60; 

export default async function Home() {
  const { data: produtosDestaque } = await supabase
    .from('vitrine_produtos')
    .select('*')
    .eq('destaque', true);

  const produtos = produtosDestaque || [];

  return (
    <div className="flex flex-col min-h-screen bg-brand-base">
      
      {/* 1. HERO SECTION - Efeito Vidro (Glassmorphism) Luxuoso */}
      <section className="relative min-h-[90vh] flex items-center justify-center lg:justify-start overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero-bg.png" 
            alt="Ambiente Sweet Home"
            fill
            className="object-cover object-center scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
            priority
          />
          {/* Máscara de gradiente suave para escurecer a imagem e focar no quadro */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-brown/80 via-brand-brown/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl bg-white/10 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-white/20 text-white shadow-[0_8px_32px_0_rgba(74,53,37,0.37)] transform transition-all duration-700 hover:scale-[1.01]">
            <span className="inline-block py-1 px-3 rounded-full bg-brand-gold/20 border border-brand-gold/50 text-brand-gold font-bold tracking-widest uppercase text-xs mb-6">
              Coleção Outono/Inverno
            </span>
            <h1 className="text-5xl md:text-7xl font-headings font-extrabold tracking-tight mb-6 leading-[1.1] drop-shadow-md">
              A arte de <br/><span className="text-brand-gold italic font-normal">vestir o seu lar.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-base/90 mb-10 leading-relaxed font-light drop-shadow-sm max-w-lg">
              Qualidade de hotel cinco estrelas, com o toque inconfundível do seu próprio espaço.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/produtos" className="px-10 py-4 bg-brand-gold text-brand-brown rounded-full font-bold text-sm uppercase tracking-wider shadow-lg hover:bg-white hover:text-brand-brown transition-all duration-300 transform hover:-translate-y-1 text-center">
                Ver Catálogo Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST MARKERS - O detalhe minimalista */}
      <section className="bg-brand-brown py-12 relative z-20 border-b border-brand-gold/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-brand-gold/20 text-center">
            <div className="flex flex-col items-center justify-center px-6 group">
              <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold mb-4 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-brown transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <h3 className="text-brand-base font-bold text-sm uppercase tracking-widest mb-1">Qualidade Premium</h3>
              <p className="text-brand-base/60 text-sm font-light">Algodão egípcio e fios selecionados</p>
            </div>
            <div className="flex flex-col items-center justify-center px-6 group">
              <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold mb-4 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-brown transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-brand-base font-bold text-sm uppercase tracking-widest mb-1">Compra Segura</h3>
              <p className="text-brand-base/60 text-sm font-light">Ambiente criptografado 100% protegido</p>
            </div>
            <div className="flex flex-col items-center justify-center px-6 group">
              <div className="p-4 rounded-full bg-brand-gold/10 text-brand-gold mb-4 group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-brand-brown transition-all duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h3 className="text-brand-base font-bold text-sm uppercase tracking-widest mb-1">Satisfação Garantida</h3>
              <p className="text-brand-base/60 text-sm font-light">Primeira troca grátis em até 7 dias</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID - Módulos de Coleções */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headings font-bold text-brand-brown">Explore Nossas Coleções</h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mt-6 rounded-full"></div>
          <p className="mt-6 text-brand-brown/70 max-w-2xl mx-auto font-light text-lg">Selecione o ambiente que deseja transformar com as nossas linhas exclusivas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:auto-rows-[350px]">
          
          <Link href="/categorias?tipo=cama" className="md:col-span-8 relative rounded-3xl overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>
            <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2071&auto=format&fit=crop" alt="Cama" className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-10 left-10 z-20 flex flex-col items-start transform transition-transform duration-500 group-hover:-translate-y-2">
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Linha Premium</span>
              <h3 className="text-4xl font-headings font-bold text-white mb-2">Coleção Cama</h3>
              <span className="text-brand-gold font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explorar <span className="ml-2">→</span></span>
            </div>
          </Link>

          <Link href="/categorias?tipo=banho" className="md:col-span-4 relative rounded-3xl overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>
            <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1974&auto=format&fit=crop" alt="Banho" className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute bottom-10 left-8 z-20 transform transition-transform duration-500 group-hover:-translate-y-2">
              <h3 className="text-3xl font-headings font-bold text-white mb-2">Banho</h3>
              <span className="text-brand-gold font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explorar <span className="ml-2">→</span></span>
            </div>
          </Link>
          
        </div>
      </section>

      {/* 4. VITRINE DE PRODUTOS */}
      <section className="py-24 bg-white border-t border-brand-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6 text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-headings font-bold text-brand-brown">Destaques da Semana</h2>
              <p className="text-brand-brown/60 mt-4 text-lg font-light">As peças mais desejadas pelas nossas clientes.</p>
            </div>
            <Link href="/produtos" className="hidden md:inline-flex items-center gap-2 text-brand-brown font-bold uppercase tracking-wider hover:text-brand-gold transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-brand-gold hover:after:w-full after:transition-all after:duration-300">
              Ver Catálogo Completo <span className="text-lg">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
          
          <div className="mt-16 text-center md:hidden">
            <Link href="/produtos" className="inline-block px-10 py-4 border border-brand-brown text-brand-brown font-bold rounded-full hover:bg-brand-brown hover:text-brand-base transition-colors uppercase tracking-widest text-sm">
              Ver Todos
            </Link>
          </div>
        </div>
      </section>

      {/* 5. RODAPÉ E A PORTA SECRETA PARA O GESTOBAP 👈 NOVIDADE AQUI! */}
      <footer className="bg-brand-brown py-8 border-t border-brand-gold/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-base/60 text-sm font-light">
            © {new Date().getFullYear()} Sweet Home Enxovais. Todos os direitos reservados.
          </p>
          
          {/* LINK MÁGICO PARA O NOSSO ERP */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-brand-gold/60 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest font-bold group"
          >
            <Lock size={14} className="group-hover:animate-pulse" /> Área Restrita
          </Link>
        </div>
      </footer>

    </div>
  );
}
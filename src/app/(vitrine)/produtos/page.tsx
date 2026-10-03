import ProductCard from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function ProdutosPage() {
  // Buscamos TODOS os produtos do Supabase
  const { data: produtos } = await supabase
    .from('vitrine_produtos')
    .select('*')
    .order('created_at', { ascending: false }); // Traz os mais recentes primeiro

  const listaProdutos = produtos || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-brand/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-brand-dark tracking-tight">Todos os Produtos</h1>
          <p className="text-lg text-brand-accent mt-2">Explore a nossa coleção completa e encontre a peça perfeita.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {listaProdutos.map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
    </div>
  );
}
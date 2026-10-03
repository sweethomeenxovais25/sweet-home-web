export default function CategoriasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-brand/20 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-brand-dark tracking-tight">
          Navegue por Categorias
        </h1>
        <p className="text-lg text-brand-accent mt-2">
          Cama, Mesa, Banho e muito mais.
        </p>
      </div>
      
      {/* Aqui vai entrar o Grid de Categorias */}
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-brand/30 rounded-xl bg-white/50">
        <p className="text-brand text-lg font-medium">Os blocos de categorias serão construídos aqui.</p>
      </div>
    </div>
  );
}
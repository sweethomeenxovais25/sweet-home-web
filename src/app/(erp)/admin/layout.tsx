import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-brand-base">
      {/* Sidebar Escura (Marrom) com texto Branco */}
      <aside className="w-64 bg-brand-brown text-white flex flex-col hidden md:flex shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <span className="text-2xl font-bold tracking-tighter">
            Sweet<span className="text-brand-gold">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/10">
            Painel Geral
          </Link>
          <Link href="/admin/produtos" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/10">
            Vitrine & Produtos
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-brand-gold hover:text-white transition-colors">
            ← Voltar para a Loja
          </Link>
        </div>
      </aside>

      {/* Área Principal Clara (Bege/Branco) com texto Escuro */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 justify-end md:justify-between border-b border-gray-100">
          <h2 className="text-brand-dark font-bold hidden md:block">Gestão de E-commerce</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-brand-brown bg-brand-gold/20 px-4 py-2 rounded-full border border-brand-gold/30">
              Modo Edição
            </span>
          </div>
        </header>
        <div className="p-8 text-brand-dark">
          {children}
        </div>
      </main>
    </div>
  );
}
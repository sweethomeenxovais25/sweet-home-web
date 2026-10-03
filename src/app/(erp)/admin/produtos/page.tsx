"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Tipagem básica para nos ajudar
type ProdutoAdmin = {
  id: string;
  nome: string;
  preco: number;
  destaque: boolean;
  esgotado: boolean;
};

export default function GerenciadorProdutos() {
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Busca os produtos assim que a página abre
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco, destaque, esgotado')
      .order('nome');
      
    if (data) setProdutos(data);
    setCarregando(false);
  };

  // Função mágica que liga/desliga o produto na vitrine inicial
  const alternarVitrine = async (id: string, statusAtual: boolean) => {
    const novoStatus = !statusAtual;
    
    // 1. Atualiza a tela instantaneamente (Efeito UAU, sem lentidão)
    setProdutos(produtos.map(p => p.id === id ? { ...p, destaque: novoStatus } : p));
    
    // 2. Salva no banco de dados silenciosamente
    await supabase.from('produtos').update({ destaque: novoStatus }).eq('id', id);
  };

  // Função para marcar como esgotado (Preparando terreno para o Baply ERP)
  const alternarEstoque = async (id: string, statusAtual: boolean) => {
    const novoStatus = !statusAtual;
    setProdutos(produtos.map(p => p.id === id ? { ...p, esgotado: novoStatus } : p));
    await supabase.from('produtos').update({ esgotado: novoStatus }).eq('id', id);
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin" className="text-sm text-brand-accent hover:text-brand-dark transition-colors">← Voltar ao Painel</Link>
          </div>
          <h1 className="text-3xl font-bold text-brand-dark">Gerenciador de Grid & Produtos</h1>
          <p className="text-gray-500 mt-1">Controle o que aparece nos blocos da página inicial.</p>
        </div>
        <button className="bg-brand-dark text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand transition-colors">
          + Novo Produto
        </button>
      </div>

      {/* Tabela Interativa (O nosso estilo "Odoo") */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {carregando ? (
          <div className="p-12 text-center text-brand-accent animate-pulse font-medium">
            Carregando catálogo do banco de dados...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Produto</th>
                <th className="p-4 font-semibold">Preço</th>
                <th className="p-4 font-semibold text-center">Em Estoque?</th>
                <th className="p-4 font-semibold text-center">Exibir na Home? (Grid)</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-medium text-brand-dark">{produto.nome}</td>
                  <td className="p-4 text-brand-accent">R$ {produto.preco.toFixed(2)}</td>
                  
                  {/* Toggle de Estoque */}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => alternarEstoque(produto.id, produto.esgotado)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${!produto.esgotado ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!produto.esgotado ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  {/* Toggle de Vitrine (O coração do nosso Grid) */}
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => alternarVitrine(produto.id, produto.destaque)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${produto.destaque ? 'bg-brand' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${produto.destaque ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <button className="text-sm font-medium text-gray-400 hover:text-brand transition-colors">
                      Editar Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4 items-start">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <p className="text-sm text-blue-800">
          <strong>Dica Baply:</strong> Ao ativar a chave "Exibir na Home", o produto aparecerá automaticamente no bloco "Os Mais Amados" da sua página inicial. Futuramente, o seu script em Python poderá controlar a chave "Em Estoque" de forma automática!
        </p>
      </div>

    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ConfiguracoesTema() {
  const [corPrincipal, setCorPrincipal] = useState('#D4AF37'); // Dourado padrão
  const [logoUrl, setLogoUrl] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Busca a cor e a logo atuais assim que a página abre
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    const { data } = await supabase.from('configuracoes').select('*');
    if (data) {
      const cor = data.find(c => c.chave === 'brand_color')?.valor;
      const logo = data.find(c => c.chave === 'brand_logo')?.valor;
      if (cor) setCorPrincipal(cor);
      if (logo) setLogoUrl(logo);
    }
    setCarregando(false);
  };

  const salvarConfiguracoes = async () => {
    setSalvando(true);
    setMensagem('');
    
    try {
      // Upsert: Se a chave existir, atualiza. Se não existir, cria.
      await supabase.from('configuracoes').upsert({ chave: 'brand_color', valor: corPrincipal });
      await supabase.from('configuracoes').upsert({ chave: 'brand_logo', valor: logoUrl });
      
      // Mágica extra: atualiza a cor do próprio painel Admin na hora do clique!
      document.documentElement.style.setProperty('--theme-primary', corPrincipal);
      
      setMensagem('✅ Tema atualizado com sucesso! A loja já está de roupa nova.');
    } catch (error) {
      setMensagem('❌ Erro ao salvar configurações.');
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(''), 4000);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin" className="text-sm text-brand-accent hover:text-brand-dark transition-colors">← Voltar ao Painel</Link>
        </div>
        <h1 className="text-3xl font-bold text-brand-dark">Configurações da Loja</h1>
        <p className="text-gray-500 mt-1">Personalize a identidade visual do seu E-commerce (White-Label).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {carregando ? (
          <div className="p-12 text-center text-brand-accent animate-pulse font-medium">
            Carregando configurações...
          </div>
        ) : (
          <div className="p-8 space-y-8">
            
            {/* Seletor de Cor */}
            <div>
              <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-100 pb-2">Identidade Visual</h3>
              <div className="flex items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor Principal da Marca</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={corPrincipal}
                      onChange={(e) => setCorPrincipal(e.target.value)}
                      className="w-12 h-12 p-1 rounded cursor-pointer border border-gray-200"
                    />
                    <input 
                      type="text" 
                      value={corPrincipal}
                      onChange={(e) => setCorPrincipal(e.target.value)}
                      className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-brand focus:outline-none uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Esta cor será aplicada em botões, links e destaques.</p>
                </div>

                {/* Preview Rápido */}
                <div className="flex-1 bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-3">
                  <span className="text-sm font-medium text-gray-500">Preview:</span>
                  <button 
                    style={{ backgroundColor: corPrincipal }} 
                    className="text-white px-6 py-2 rounded-full font-bold shadow-md transition-all"
                  >
                    Botão da Loja
                  </button>
                </div>
              </div>
            </div>

            {/* Upload de Logo (Por enquanto via URL) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Loja (URL da Imagem)</label>
              <input 
                type="text" 
                placeholder="Ex: https://meusite.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none" 
              />
              <p className="text-xs text-gray-400 mt-2">Coloque o link direto da imagem. (No futuro, conectaremos ao Storage do Supabase para upload de arquivos).</p>
            </div>

            {/* Botão Salvar */}
            <div className="pt-4 border-t border-gray-100">
              <button 
                onClick={salvarConfiguracoes}
                disabled={salvando}
                className="w-full bg-brand-dark text-white font-bold py-3 rounded-lg hover:bg-brand transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2"
              >
                {salvando ? 'Salvando Configurações...' : 'Salvar e Publicar Tema'}
              </button>
              
              {mensagem && (
                <p className="text-sm text-center font-medium mt-4 animate-pulse text-brand-dark">
                  {mensagem}
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
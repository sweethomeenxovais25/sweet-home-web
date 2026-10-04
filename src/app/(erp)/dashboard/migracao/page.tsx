"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Database, Copy, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export default function MigracaoPage() {
  const supabase = createClient();
  const [textoColado, setTextoColado] = useState("");
  const [processando, setProcessando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // Função para limpar os R$ e transformar em número pro banco
  const limparMoeda = (val: string) => {
    if (!val) return 0.0;
    const limpo = val.replace('R$', '').replace(/\s/g, '').trim();
    if (limpo.includes(',') && limpo.includes('.')) {
      return parseFloat(limpo.replace('.', '').replace(',', '.'));
    } else if (limpo.includes(',')) {
      return parseFloat(limpo.replace(',', '.'));
    }
    return parseFloat(limpo) || 0.0;
  };

  const iniciarMigracao = async () => {
    if (!textoColado.trim()) {
      toast.error("Cole os dados da planilha primeiro!");
      return;
    }

    setProcessando(true);
    setLogs([]);
    addLog("🚀 Iniciando migração para o Supabase...");

    const linhas = textoColado.split('\n');
    let paisCriados: Record<string, string> = {}; // Guarda { "101": "uuid-do-pai" }
    let countSucesso = 0;

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      
      // Pula linha vazia, cabeçalho ou linha de totais
      if (!linha || linha.includes('CÓD. PRÓDUTO') || linha.toUpperCase().includes('TOTAIS')) {
        continue;
      }

      // Ao copiar do Google Sheets, as colunas vêm separadas por "Tab" (\t)
      const colunas = linha.split('\t');
      
      // Proteção contra linhas quebradas
      if (colunas.length < 9) continue;

      const codProduto = colunas[0]?.trim();     // Ex: 101.1
      const nomeProduto = colunas[1]?.trim();    // Ex: Lençol Casal Branco
      const custo = limparMoeda(colunas[3]);     // CUSTO UNITÁRIO R$
      const qtdMinima = parseInt(colunas[5]) || 2; // QTD MÍNIMA
      const estoqueAtual = parseInt(colunas[7]) || 0; // ESTOQUE ATUAL
      const precoVenda = limparMoeda(colunas[8]);  // VALOR DE VENDA
      const linkImagem = colunas[10]?.trim();    // LINK REF (A imagem)

      // Identifica quem é o PAI (ex: "101") e quem é o FILHO (ex: "1")
      const baseCod = codProduto.split('.')[0]; 

      try {
        let idPai = paisCriados[baseCod];

        // 1. SE O PAI AINDA NÃO EXISTE, CRIA ELE
        if (!idPai) {
          addLog(`📦 Criando Produto Pai base: ${baseCod} (${nomeProduto.split('-')[0]})`);
          const { data: paiData, error: paiError } = await supabase.from('produtos').insert({
            nome_base: nomeProduto.split('-')[0].trim(), // Pega o nome genérico
            descricao: "Migrado do sistema legado",
            categoria: "Geral",
            is_destaque: true
          }).select('id').single();

          if (paiError) throw paiError;
          idPai = paiData.id;
          paisCriados[baseCod] = idPai;
        }

        // 2. CRIA O FILHO (A variação/lote com o estoque e preço real)
        addLog(`   ↳ Inserindo Variação (SKU): ${codProduto} | Estoque: ${estoqueAtual}`);
        const { error: filhoError } = await supabase.from('produto_variacoes').insert({
          produto_pai_id: idPai,
          sku: codProduto, // Mantemos o código exato (101.1) para não quebrar seu histórico!
          codigo_legado_planilha: codProduto,
          preco_custo: custo,
          preco_venda: precoVenda,
          estoque_atual: estoqueAtual,
          estoque_minimo: qtdMinima,
          imagem_url: linkImagem !== "-" ? linkImagem : null
        });

        if (filhoError) {
          // Se der erro de duplicação, apenas avisa e segue
          if (filhoError.code === '23505') {
            addLog(`   ⚠️️ SKU ${codProduto} já existe no banco. Pulando...`);
          } else {
            throw filhoError;
          }
        } else {
          countSucesso++;
        }

      } catch (err: any) {
        addLog(`❌ Erro na linha do cód ${codProduto}: ${err.message}`);
      }
    }

    addLog(`🎉 Migração concluída! ${countSucesso} SKUs importados com sucesso.`);
    toast.success("Migração finalizada!");
    setProcessando(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-xl border border-stone-200 dark:border-stone-800">
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#A67B5B]/10 rounded-2xl flex items-center justify-center text-[#A67B5B]">
            <Database size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white">Portal de Migração</h1>
            <p className="text-stone-500 font-medium">Traga o seu inventário do Google Sheets para o Supabase (PostgreSQL).</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl mb-8">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Copy size={18} /> Como fazer:
          </h3>
          <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-6 list-decimal font-medium">
            <li>Abra a sua planilha Mestre do Google Sheets.</li>
            <li>Vá na aba <strong>INVENTÁRIO</strong>.</li>
            <li>Selecione <strong>todas as linhas</strong> com produtos (do Código até o Status Odoo).</li>
            <li>Aperte <kbd className="bg-white/50 px-1 rounded">Ctrl + C</kbd>.</li>
            <li>Cole tudo na caixa abaixo (<kbd className="bg-white/50 px-1 rounded">Ctrl + V</kbd>) e clique em Migrar.</li>
          </ol>
        </div>

        <textarea
          value={textoColado}
          onChange={(e) => setTextoColado(e.target.value)}
          placeholder="Cole as colunas do Google Sheets aqui..."
          className="w-full h-64 p-4 border-2 border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-950 font-mono text-xs focus:border-[#A67B5B] focus:outline-none mb-4 whitespace-pre"
        />

        <button 
          onClick={iniciarMigracao}
          disabled={processando || !textoColado}
          className="w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black rounded-xl hover:bg-[#A67B5B] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processando ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {processando ? "Injetando no Banco de Dados..." : "Iniciar Migração Real"}
        </button>

        {logs.length > 0 && (
          <div className="mt-8 bg-stone-950 rounded-xl p-4 h-64 overflow-y-auto border border-stone-800">
            {logs.map((log, i) => (
              <div key={i} className="text-emerald-400 font-mono text-[11px] mb-1 border-b border-stone-800/50 pb-1">
                <ArrowRight size={10} className="inline mr-1 opacity-50" /> {log}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
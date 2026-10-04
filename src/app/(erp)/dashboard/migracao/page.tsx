"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Database, UploadCloud, CheckCircle2, Loader2, ArrowRight, FileSpreadsheet, XCircle, Link as LinkIcon } from "lucide-react";
import Papa from "papaparse";

export default function MigracaoPage() {
  const supabase = createClient();
  const [processando, setProcessando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dadosPrevia, setDadosPrevia] = useState<any[]>([]);
  const [arquivoCarregado, setArquivoCarregado] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // 🛡️ O EXTRATOR BLINDADO DE NÚMEROS (Adeus erro R$ R$)
  const limparMoeda = (val: string | number) => {
    if (!val) return 0.0;
    // Pega a string e arranca TUDO que não seja número, vírgula ou ponto
    let limpo = String(val).replace(/[^\d.,]/g, '').trim();
    if (!limpo) return 0.0;
    
    // Converte o padrão Brasileiro (1.500,00) para o padrão Americano de Banco de Dados (1500.00)
    if (limpo.includes('.') && limpo.includes(',')) {
      limpo = limpo.replace(/\./g, '').replace(',', '.');
    } else if (limpo.includes(',')) {
      limpo = limpo.replace(',', '.');
    }
    
    const numero = parseFloat(limpo);
    return isNaN(numero) ? 0.0 : numero; // Se ainda der pau, salva como 0 para não quebrar o banco!
  };

  // 🛡️ CAÇADOR DE COLUNAS (Lida com espaços extras e nomes alterados)
  const getCol = (row: any, ...nomesPossiveis: string[]) => {
    const keys = Object.keys(row);
    for (const nome of nomesPossiveis) {
      // Tenta achar exatamente igual (ignorando espaços no inicio/fim)
      const exato = keys.find(k => k.trim().toUpperCase() === nome.toUpperCase());
      if (exato) return row[exato];
      
      // Tenta achar contendo a palavra
      const contem = keys.find(k => k.toUpperCase().includes(nome.toUpperCase()));
      if (contem) return row[contem];
    }
    return "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogs([]);
    setDadosPrevia([]);
    addLog(`📄 Lendo o arquivo: ${file.name}...`);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const dadosLidos = results.data as any[];
        
        const dadosLimpos = dadosLidos.filter(row => {
          const cod = String(getCol(row, 'CÓD. PRÓDUTO', 'COD') || '');
          return cod && cod.trim() !== '' && !cod.toUpperCase().includes('TOTAIS');
        });

        setDadosPrevia(dadosLimpos);
        setArquivoCarregado(true);
        addLog(`✅ Arquivo lido com sucesso! Encontradas ${dadosLimpos.length} linhas válidas.`);
      },
      error: function(error) {
        toast.error("Erro ao ler o arquivo CSV.");
        addLog(`❌ Erro no leitor: ${error.message}`);
      }
    });
  };

  const iniciarMigracao = async () => {
    if (dadosPrevia.length === 0) return;

    setProcessando(true);
    addLog("🚀 Iniciando motor de injeção no Supabase...");
    
    // Força limpeza do cache da API via frontend
    await supabase.rpc('pgrst_reload_schema'); 

    let paisCriados: Record<string, string> = {}; 
    let countSucesso = 0;

    for (let i = 0; i < dadosPrevia.length; i++) {
      const row = dadosPrevia[i];
      
      // Uso do Caçador Blindado para ler as colunas
      const codProduto = String(getCol(row, 'CÓD. PRÓDUTO', 'CÓD') || '').trim();     
      const nomeProduto = String(getCol(row, 'NOME DO PRODUTO', 'NOME') || '').trim();    
      const custo = limparMoeda(getCol(row, 'CUSTO UNITÁRIO R$', 'CUSTO'));     
      const qtdMinima = parseInt(getCol(row, 'QTD MÍNIMA', 'MÍNIMA')) || 2; 
      const estoqueAtual = parseInt(getCol(row, 'ESTOQUE ATUAL', 'ESTOQUE')) || 0; 
      const precoVenda = limparMoeda(getCol(row, 'VALOR DE VENDA', 'VENDA', 'VALOR'));  
      const linkImagem = String(getCol(row, 'LINK REF', 'LINK', 'REF') || '').trim();    

      if (!codProduto) continue;

      const baseCod = codProduto.split('.')[0]; 

      try {
        let idPai = paisCriados[baseCod];

        if (!idPai) {
          addLog(`📦 Criando Pai: ${baseCod}`);
          
          const { data: paiData, error: paiError } = await supabase.from('produtos').insert({
            nome_base: nomeProduto.split('-')[0].trim(),
            categoria: "Geral"
          }).select('id').single();

          if (paiError) throw paiError;
          idPai = paiData.id;
          paisCriados[baseCod] = idPai;
        }

        addLog(`   ↳ Salvando Estoque: ${codProduto}`);
        const { error: filhoError } = await supabase.from('produto_variacoes').insert({
          produto_pai_id: idPai,
          sku: codProduto, 
          codigo_legado_planilha: codProduto,
          preco_custo: custo,
          preco_venda: precoVenda,
          estoque_atual: estoqueAtual,
          estoque_minimo: qtdMinima,
          imagem_url: linkImagem !== "-" && linkImagem !== "" ? linkImagem : null
        });

        if (filhoError) {
          if (filhoError.code === '23505') {
            addLog(`   ⚠ SKU ${codProduto} já existe. Ignorado.`);
          } else {
            throw filhoError;
          }
        } else {
          countSucesso++;
        }
      } catch (err: any) {
        const erroReal = err?.message || JSON.stringify(err);
        addLog(`❌ Falha no cód ${codProduto}: ${erroReal}`);
      }
    }

    if (countSucesso > 0) {
        addLog(`🎉 Sucesso! ${countSucesso} SKUs injetados com perfeição.`);
        toast.success(`${countSucesso} produtos migrados!`);
    } else {
        addLog(`⚠️ Nenhum produto foi injetado. Verifique os erros acima.`);
        toast.error("Falha na migração.");
    }
    
    setProcessando(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-stone-900 rounded-[2rem] p-8 shadow-xl border border-stone-200 dark:border-stone-800">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#A67B5B]/10 rounded-2xl flex items-center justify-center text-[#A67B5B]">
              <Database size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-stone-900 dark:text-white">Portal de ETL</h1>
              <p className="text-stone-500 font-medium">Extraia, Transforme e Carregue dados em massa (CSV).</p>
            </div>
          </div>
          {arquivoCarregado && (
             <button onClick={() => {setDadosPrevia([]); setArquivoCarregado(false); setLogs([]);}} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-bold text-sm">
               <XCircle size={16} /> Limpar
             </button>
          )}
        </div>

        {!arquivoCarregado && (
          <div className="w-full border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-12 bg-stone-50 dark:bg-stone-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 transition-all cursor-pointer group mb-6 relative text-center">
             <FileSpreadsheet size={64} className="mx-auto text-indigo-300 dark:text-indigo-600 mb-4 group-hover:text-indigo-500 group-hover:-translate-y-2 transition-all" />
             <p className="text-lg font-black text-stone-700 dark:text-stone-300 mb-2">Selecione o arquivo CSV do Inventário</p>
             <p className="text-sm text-stone-500 max-w-md mx-auto">Baixe a aba "INVENTÁRIO" do Google Sheets como .csv e envie aqui.</p>
             <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
          </div>
        )}

        {arquivoCarregado && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Prévia dos Dados Lidos ({dadosPrevia.length} linhas)</h3>
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden h-64 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3 text-center">Estoque</th>
                    <th className="p-3">Custo Limpo</th>
                    <th className="p-3">Venda Limpa</th>
                    <th className="p-3 text-center">Link Foto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {dadosPrevia.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-stone-100 dark:hover:bg-stone-800/50">
                      <td className="p-3 font-mono font-bold text-[#A67B5B]">{getCol(row, 'CÓD. PRÓDUTO', 'CÓD')}</td>
                      <td className="p-3 text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{getCol(row, 'NOME DO PRODUTO', 'NOME')}</td>
                      <td className="p-3 font-black text-center text-emerald-600">{parseInt(getCol(row, 'ESTOQUE ATUAL', 'ESTOQUE')) || 0}</td>
                      <td className="p-3">R$ {limparMoeda(getCol(row, 'CUSTO UNITÁRIO R$', 'CUSTO')).toFixed(2)}</td>
                      <td className="p-3">R$ {limparMoeda(getCol(row, 'VALOR DE VENDA', 'VENDA')).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        {getCol(row, 'LINK REF', 'LINK').includes('http') ? <LinkIcon size={14} className="text-blue-500 mx-auto"/> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dadosPrevia.length > 50 && (
                <div className="p-3 text-center text-xs text-stone-500 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 sticky bottom-0">
                  Mostrando apenas as 50 primeiras linhas. O restante será processado.
                </div>
              )}
            </div>
            
            <button 
              onClick={iniciarMigracao}
              disabled={processando}
              className="mt-6 w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black rounded-xl hover:bg-[#A67B5B] dark:hover:bg-[#A67B5B] dark:hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-stone-900/20"
            >
              {processando ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
              {processando ? "Injetando na Nuvem..." : "Confirmar e Enviar para o Supabase"}
            </button>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-stone-950 rounded-xl p-4 h-64 overflow-y-auto border border-stone-800 shadow-inner mt-4">
            <h4 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Database size={14}/> Console de Operações
            </h4>
            {logs.map((log, i) => (
              <div key={i} className={`font-mono text-[11px] mb-1 pb-1 border-b border-stone-800/50 ${log.includes('❌') ? 'text-red-400' : log.includes('⚠') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {log.includes('📦') || log.includes('↳') || log.includes('🚀') || log.includes('🎉') ? "" : <ArrowRight size={10} className="inline mr-1 opacity-50" />} 
                {log}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
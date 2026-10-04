"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Database, UploadCloud, CheckCircle2, Loader2, ArrowRight, FileSpreadsheet, XCircle } from "lucide-react";
import Papa from "papaparse"; // 👈 A biblioteca mais famosa do mundo para ler CSVs no navegador

export default function MigracaoPage() {
  const supabase = createClient();
  const [processando, setProcessando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dadosPrevia, setDadosPrevia] = useState<any[]>([]); // Para mostrar o que foi lido antes de salvar
  const [arquivoCarregado, setArquivoCarregado] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // Função matemática para converter string de dinheiro do Excel (R$ 1.500,00) em Decimal (1500.00)
  const limparMoeda = (val: string) => {
    if (!val) return 0.0;
    let limpo = String(val).replace('R$', '').replace(/\s/g, '').trim();
    if (limpo.includes(',') && limpo.includes('.')) {
      return parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
    } else if (limpo.includes(',')) {
      return parseFloat(limpo.replace(',', '.'));
    }
    return parseFloat(limpo) || 0.0;
  };

  // 1. LEITURA MÁGICA DO ARQUIVO CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogs([]);
    setDadosPrevia([]);
    addLog(`📄 Lendo o arquivo: ${file.name}...`);

    Papa.parse(file, {
      header: true, // Avisa que a primeira linha é o nome das colunas
      skipEmptyLines: true,
      complete: function(results) {
        // results.data é um array de objetos onde cada chave é o nome da coluna do Excel
        const dadosLidos = results.data as any[];
        
        // Filtra para remover linhas "Totais" ou lixo do rodapé
        const dadosLimpos = dadosLidos.filter(row => {
          const cod = String(row['CÓD. PRÓDUTO'] || '');
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

  // 2. INJEÇÃO DE DADOS (ETL: Extract, Transform, Load)
  const iniciarMigracao = async () => {
    if (dadosPrevia.length === 0) return;

    setProcessando(true);
    addLog("🚀 Iniciando motor de injeção no Supabase...");
    
    // 🔥 FORÇAR REFRESH DO CACHE (O antídoto pro seu erro anterior)
    await supabase.rpc('pgrst_reload_schema'); 

    let paisCriados: Record<string, string> = {}; 
    let countSucesso = 0;

    for (let i = 0; i < dadosPrevia.length; i++) {
      const row = dadosPrevia[i];
      
      const codProduto = String(row['CÓD. PRÓDUTO'] || '').trim();     
      const nomeProduto = String(row['NOME DO PRODUTO'] || '').trim();    
      const custo = limparMoeda(row['CUSTO UNITÁRIO R$']);     
      const qtdMinima = parseInt(row['QTD MÍNIMA']) || 2; 
      const estoqueAtual = parseInt(row['ESTOQUE ATUAL']) || 0; 
      const precoVenda = limparMoeda(row['VALOR DE VENDA']);  
      const linkImagem = String(row['LINK REF'] || '').trim();    

      if (!codProduto) continue;

      const baseCod = codProduto.split('.')[0]; 

      try {
        let idPai = paisCriados[baseCod];

        if (!idPai) {
          addLog(`📦 Criando Produto Pai: ${baseCod}`);
          const { data: paiData, error: paiError } = await supabase.from('produtos').insert({
            nome_base: nomeProduto.split('-')[0].trim(),
            descricao: "Produto importado do sistema legado",
            categoria: "Geral",
            is_destaque: true
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
        addLog(`❌ Falha no código ${codProduto}: ${err.message}`);
      }
    }

    addLog(`🎉 Sucesso! ${countSucesso} SKUs injetados.`);
    toast.success("Banco de dados populado com sucesso!");
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

        {/* 🚀 ÁREA DE DROP / UPLOAD */}
        {!arquivoCarregado && (
          <div className="w-full border-2 border-dashed border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-12 bg-stone-50 dark:bg-stone-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-400 transition-all cursor-pointer group mb-6 relative text-center">
             <FileSpreadsheet size={64} className="mx-auto text-indigo-300 dark:text-indigo-600 mb-4 group-hover:text-indigo-500 group-hover:-translate-y-2 transition-all" />
             <p className="text-lg font-black text-stone-700 dark:text-stone-300 mb-2">Selecione o arquivo CSV do Inventário</p>
             <p className="text-sm text-stone-500 max-w-md mx-auto">Vá na sua planilha do Google, clique em <b>Arquivo &gt; Fazer download &gt; Valores separados por vírgula (.csv)</b> e envie aqui.</p>
             <input 
                type="file" 
                accept=".csv"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileUpload} 
              />
          </div>
        )}

        {/* 📊 PRÉVIA DOS DADOS */}
        {arquivoCarregado && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Prévia dos Dados Lidos ({dadosPrevia.length} linhas)</h3>
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden h-64 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Estoque</th>
                    <th className="p-3">Custo</th>
                    <th className="p-3">Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {dadosPrevia.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-stone-100 dark:hover:bg-stone-800/50">
                      <td className="p-3 font-mono font-bold text-[#A67B5B]">{row['CÓD. PRÓDUTO']}</td>
                      <td className="p-3 text-stone-700 dark:text-stone-300 truncate max-w-xs">{row['NOME DO PRODUTO']}</td>
                      <td className="p-3 font-bold">{row['ESTOQUE ATUAL']}</td>
                      <td className="p-3">R$ {row['CUSTO UNITÁRIO R$']}</td>
                      <td className="p-3">R$ {row['VALOR DE VENDA']}</td>
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

        {/* 💻 TERMINAL DE LOGS */}
        {logs.length > 0 && (
          <div className="bg-stone-950 rounded-xl p-4 h-64 overflow-y-auto border border-stone-800 shadow-inner">
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
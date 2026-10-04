"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { Database, UploadCloud, CheckCircle2, Loader2, ArrowRight, FileSpreadsheet, XCircle, ShoppingBag, Package } from "lucide-react";
import Papa from "papaparse";

export default function MigracaoPage() {
  const supabase = createClient();
  const [modo, setModo] = useState<"estoque" | "vendas">("vendas");
  const [processando, setProcessando] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dadosPrevia, setDadosPrevia] = useState<any[]>([]);
  const [arquivoCarregado, setArquivoCarregado] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  // Função matemática blindada
  const limparMoeda = (val: string | number) => {
    if (!val) return 0.0;
    let limpo = String(val).replace(/[^\d.,\-]/g, '').trim();
    if (!limpo) return 0.0;
    if (limpo.includes('.') && limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.');
    else if (limpo.includes(',')) limpo = limpo.replace(',', '.');
    return parseFloat(limpo) || 0.0;
  };

  const getCol = (row: any, ...nomesPossiveis: string[]) => {
    const keys = Object.keys(row);
    for (const nome of nomesPossiveis) {
      const exato = keys.find(k => k.trim().toUpperCase() === nome.toUpperCase());
      if (exato) return row[exato];
      const contem = keys.find(k => k.toUpperCase().includes(nome.toUpperCase()));
      if (contem) return row[contem];
    }
    return "";
  };

  const converterDataBrasileira = (dataStr: string) => {
    if (!dataStr || dataStr === "-") return null;
    const partes = String(dataStr).split('/');
    if (partes.length === 3) {
      return new Date(`${partes[2]}-${partes[1]}-${partes[0]}T12:00:00Z`).toISOString();
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogs([]); setDadosPrevia([]);
    addLog(`📄 Lendo o arquivo: ${file.name}...`);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const dadosLidos = results.data as any[];
        
        const dadosLimpos = dadosLidos.filter(row => {
          const chaveValidacao = modo === "estoque" 
            ? getCol(row, 'CÓD. PRÓDUTO', 'CÓD', 'CODIGO')
            : getCol(row, 'ID DE VENDA', 'CLIENTE');
          
          return chaveValidacao && String(chaveValidacao).trim() !== '' && !String(chaveValidacao).toUpperCase().includes('TOTAIS');
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

  // =========================================================================
  // 🛒 INJEÇÃO DE VENDAS (A ENGENHARIA COMPLEXA DA SWEET HOME)
  // =========================================================================
  const iniciarMigracaoVendas = async () => {
    if (dadosPrevia.length === 0) return;
    setProcessando(true); addLog("🚀 Iniciando motor financeiro de VENDAS...");
    await supabase.rpc('pgrst_reload_schema'); 

    // 1. Dicionário de Produtos
    addLog("🔍 Mapeando produtos do Supabase...");
    const { data: produtosBanco } = await supabase.from('produto_variacoes').select('id, sku, codigo_legado_planilha');
    const mapaProdutos: Record<string, string> = {};
    if (produtosBanco) {
      produtosBanco.forEach(p => {
        if (p.sku) mapaProdutos[p.sku.toString().trim()] = p.id;
        if (p.codigo_legado_planilha) mapaProdutos[p.codigo_legado_planilha.toString().trim()] = p.id;
      });
    }

    // 2. Dicionário de Clientes (CRM)
    addLog("👥 Mapeando clientes existentes...");
    const { data: clientesBanco } = await supabase.from('clientes').select('id, codigo_legado_planilha, nome_completo');
    const mapaClientes: Record<string, string> = {};
    if (clientesBanco) {
      clientesBanco.forEach(c => {
        if (c.codigo_legado_planilha) mapaClientes[c.codigo_legado_planilha.toString().trim()] = c.id;
      });
    }

    let countSucesso = 0;

    for (let i = 0; i < dadosPrevia.length; i++) {
      const row = dadosPrevia[i];
      
      // 🚨 MAPEAMENTO EXATO DAS SUAS COLUNAS 🚨
      const idVenda = getCol(row, 'ID DE VENDA');
      const dataVenda = getCol(row, 'DATA DA VENDA');
      const codCliente = getCol(row, 'CÓD. CLIENTE');
      const nomeCliente = getCol(row, 'CLIENTE');
      const codProduto = getCol(row, 'CÓD. PRODUTO');
      const nomeProduto = getCol(row, 'PRODUTO');
      const custoR = limparMoeda(getCol(row, 'CUSTO R$'));
      const qtd = parseInt(getCol(row, 'QUANTIDADE')) || 1;
      const valorUnitario = limparMoeda(getCol(row, 'VALOR UNITÁRIO R$'));
      const valorUnitComDesc = limparMoeda(getCol(row, 'Valor Unitário com Desc'));
      const totalR = limparMoeda(getCol(row, 'TOTAL R$'));
      const formaPgto = getCol(row, 'FORMA DE PAGAMENTO');
      const numParcelas = parseInt(getCol(row, 'Nº DE PARCELAS')) || 1;
      const saldoDevedor = limparMoeda(getCol(row, 'SALDO DEVEDOR'));
      const proximaParcela = getCol(row, 'PRÓXIMA PARCELA');
      const status = getCol(row, 'STATUS') || 'Pago';

      if (!nomeCliente || totalR <= 0) continue;

      try {
        // A. GESTÃO DO CRM (Cria cliente se não existir)
        let idClienteSupabase = mapaClientes[codCliente];
        if (!idClienteSupabase && codCliente) {
          addLog(`   👤 Criando Cliente: ${codCliente} - ${nomeCliente}`);
          const { data: cliNovo, error: cliErro } = await supabase.from('clientes').insert({
            codigo_legado_planilha: codCliente,
            nome_completo: nomeCliente
          }).select('id').single();
          
          if (!cliErro && cliNovo) {
            idClienteSupabase = cliNovo.id;
            mapaClientes[codCliente] = idClienteSupabase;
          }
        }

        // B. REGISTRO DA VENDA MÃE (Inclui Saldo Devedor do Sweet Flex)
        const { data: vendaCadastrada, error: erroVenda } = await supabase.from('vendas').insert({
          codigo_venda_legado: idVenda,
          cliente_id: idClienteSupabase || null,
          nome_vendedor: "Sistema (Legado)",
          nome_cliente_historico: nomeCliente,
          subtotal: valorUnitario * qtd,
          desconto_aplicado: (valorUnitario * qtd) - totalR, // Calcula o desconto total
          total_final: totalR,
          forma_pagamento: formaPgto || "Não Informado",
          status_pagamento: String(status).includes("Estorna") || String(status).includes("Cancel") ? "Cancelado" : (saldoDevedor > 0 ? "Pendente" : "Pago"),
          num_parcelas: numParcelas,
          saldo_devedor: saldoDevedor,
          proxima_parcela: converterDataBrasileira(proximaParcela),
          data_venda: converterDataBrasileira(dataVenda) || new Date().toISOString()
        }).select('id').single();

        if (erroVenda) throw erroVenda;

        // C. VINCULAÇÃO DE PRODUTO (ITENS)
        const idProdutoSupabase = mapaProdutos[codProduto] || null;
        if (!idProdutoSupabase) addLog(`   ⚠ Produto ${codProduto} não encontrado. Venda registrada sem link físico.`);

        const { error: erroItem } = await supabase.from('vendas_itens').insert({
          venda_id: vendaCadastrada.id,
          produto_variacao_id: idProdutoSupabase,
          quantidade: qtd,
          preco_congelado: valorUnitComDesc > 0 ? valorUnitComDesc : valorUnitario, // Salva o valor com desconto
          custo_congelado: custoR, // O seu custo unitário preservado!
          subtotal_item: totalR
        });

        if (erroItem) throw erroItem;
        countSucesso++;

      } catch (err: any) {
        addLog(`❌ Falha na venda de ${nomeCliente} (${idVenda}): ${err.message || JSON.stringify(err)}`);
      }
    }

    if (countSucesso > 0) {
      toast.success(`${countSucesso} vendas históricas migradas!`);
      addLog(`🎉 Sucesso! O histórico financeiro e de crédito está no Supabase.`);
    } else {
      toast.error("Falha na migração.");
    }
    setProcessando(false);
  };

  // =========================================================================
  // 🚀 INJEÇÃO DE ESTOQUE (MANTIDO INTACTO)
  // =========================================================================
  const iniciarMigracaoEstoque = async () => { /* ... código mantido ... */ };

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
              <p className="text-stone-500 font-medium">Extraia e Carregue o histórico mantendo o CRM e o DRE intactos.</p>
            </div>
          </div>
          {arquivoCarregado && (
             <button onClick={() => {setDadosPrevia([]); setArquivoCarregado(false); setLogs([]);}} className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors font-bold text-sm">
               <XCircle size={16} /> Limpar
             </button>
          )}
        </div>

        {/* 🚀 CHAVE SELETORA (TABS) */}
        {!arquivoCarregado && (
          <div className="flex gap-4 mb-8 bg-stone-100 dark:bg-stone-950 p-2 rounded-2xl">
            <button 
              onClick={() => setModo("estoque")} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${modo === "estoque" ? "bg-white dark:bg-stone-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-stone-500 hover:text-stone-700"}`}
            >
              <Package size={18} /> 1. Migrar Estoque (INVENTÁRIO.csv)
            </button>
            <button 
              onClick={() => setModo("vendas")} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${modo === "vendas" ? "bg-white dark:bg-stone-800 shadow-sm text-emerald-600 dark:text-emerald-400" : "text-stone-500 hover:text-stone-700"}`}
            >
              <ShoppingBag size={18} /> 2. Migrar Histórico (VENDAS.csv)
            </button>
          </div>
        )}

        {/* 🚀 ÁREA DE DROP / UPLOAD */}
        {!arquivoCarregado && (
          <div className={`w-full border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group mb-6 relative text-center ${modo === "vendas" ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400" : "border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-400"}`}>
             <FileSpreadsheet size={64} className={`mx-auto mb-4 group-hover:-translate-y-2 transition-all ${modo === "vendas" ? "text-emerald-300 group-hover:text-emerald-500" : "text-indigo-300 group-hover:text-indigo-500"}`} />
             <p className="text-lg font-black text-stone-700 dark:text-stone-300 mb-2">
               Selecione o arquivo CSV da aba {modo === "vendas" ? "VENDAS" : "INVENTÁRIO"}
             </p>
             <p className="text-sm text-stone-500 max-w-md mx-auto">Baixe a aba correta do Google Sheets como .csv e envie aqui.</p>
             <input type="file" accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
          </div>
        )}

        {/* 📊 PRÉVIA DOS DADOS (DINÂMICA) */}
        {arquivoCarregado && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Prévia dos Dados ({dadosPrevia.length} linhas)</h3>
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden h-64 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {modo === "estoque" ? (
                      <>
                        <th className="p-3">Código</th><th className="p-3">Nome</th>
                        <th className="p-3">Estoque</th><th className="p-3">Venda</th>
                      </>
                    ) : (
                      <>
                        <th className="p-3">Data</th><th className="p-3">Cliente</th>
                        <th className="p-3">Produto (Cód)</th><th className="p-3">Dívida Atual</th><th className="p-3">Pgto</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {dadosPrevia.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-stone-100 dark:hover:bg-stone-800/50">
                      {modo === "estoque" ? (
                        <>
                          <td className="p-3 font-mono font-bold text-[#A67B5B]">{getCol(row, 'CÓD. PRÓDUTO', 'CÓD')}</td>
                          <td className="p-3 truncate max-w-xs">{getCol(row, 'NOME DO PRODUTO', 'NOME')}</td>
                          <td className="p-3 font-black text-emerald-600">{parseInt(getCol(row, 'ESTOQUE ATUAL', 'ESTOQUE')) || 0}</td>
                          <td className="p-3">R$ {limparMoeda(getCol(row, 'VALOR DE VENDA', 'VENDA')).toFixed(2)}</td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">{getCol(row, 'DATA DA VENDA')}</td>
                          <td className="p-3 font-bold truncate max-w-[150px]">{getCol(row, 'CLIENTE')}</td>
                          <td className="p-3 font-mono text-stone-500">{getCol(row, 'CÓD. PRODUTO')} - {getCol(row, 'PRODUTO')}</td>
                          <td className="p-3 font-black text-red-500">R$ {limparMoeda(getCol(row, 'SALDO DEVEDOR')).toFixed(2)}</td>
                          <td className="p-3">{getCol(row, 'FORMA DE PAGAMENTO')}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={modo === "estoque" ? iniciarMigracaoEstoque : iniciarMigracaoVendas}
              disabled={processando}
              className={`mt-6 w-full py-4 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl ${modo === "vendas" ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" : "bg-stone-900 hover:bg-[#A67B5B] shadow-stone-900/20"}`}
            >
              {processando ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
              {processando ? "Injetando na Nuvem..." : `Confirmar e Importar ${modo === "vendas" ? "Histórico de Vendas" : "Estoque"}`}
            </button>
          </div>
        )}

        {/* 💻 TERMINAL DE LOGS */}
        {logs.length > 0 && (
          <div className="bg-stone-950 rounded-xl p-4 h-64 overflow-y-auto border border-stone-800 shadow-inner mt-4">
            <h4 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Database size={14}/> Console de Operações
            </h4>
            {logs.map((log, i) => (
              <div key={i} className={`font-mono text-[11px] mb-1 pb-1 border-b border-stone-800/50 ${log.includes('❌') ? 'text-red-400' : log.includes('⚠') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {log.includes('📦') || log.includes('↳') || log.includes('🚀') || log.includes('🎉') || log.includes('👤') ? "" : <ArrowRight size={10} className="inline mr-1 opacity-50" />} 
                {log}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
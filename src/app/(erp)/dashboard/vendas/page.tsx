"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase"; // 👈 NOSSA CONEXÃO REAL
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, Tag, CreditCard, User, ScanBarcode, CheckCircle2,
  PackageOpen, ChevronRight, X, QrCode, Banknote, SmartphoneNfc, CalendarClock, MessageCircleHeart,
  Loader2, Store, RotateCcw, ReceiptText, AlertOctagon, Wallet, CalendarDays, Image as ImageIcon, Keyboard, Sparkles
} from "lucide-react";

// Configuração Geral (Pode virar banco de dados no futuro)
const CONFIG_LOJA = {
  nome: "Sweet Home Enxovais",
  telefone_padrao: "5511999999999",
  metodos_pagamento: [
    { id: "pix", nome: "Pix", tipo: "avista", icone: QrCode, desc: "Transferência" },
    { id: "cartao", nome: "Cartão", tipo: "cartao", icone: SmartphoneNfc, desc: "Débito/Crédito" },
    { id: "dinheiro", nome: "Dinheiro", tipo: "dinheiro", icone: Banknote, desc: "Em Espécie" },
    { id: "crediario_1", nome: "Sweet Flex", tipo: "crediario", icone: CalendarClock, desc: "Crediário Próprio" }
  ]
};

const hojeStr = new Date().toISOString().split('T')[0];

export default function FrenteDeCaixaPage() {
  const supabase = createClient();

  // 🛡️ ESTADOS DA TELA
  const [loadingBanco, setLoadingBanco] = useState(true);
  const [isInicializado, setIsInicializado] = useState(false);
  
  // 📥 DADOS REAIS DO BANCO
  const [produtosDB, setProdutosDB] = useState<any[]>([]);
  const [clientesDB, setClientesDB] = useState<any[]>([]);
  const [vendasBanco, setVendasBanco] = useState<any[]>([]);

  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [descontoReal, setDescontoReal] = useState<number | "">("");

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [metodoPagamentoId, setMetodoPagamentoId] = useState("pix");
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
  
  const [parcelasFlex, setParcelasFlex] = useState(1);
  const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState(hojeStr);
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState<number | "">(""); 
  
  const [processandoVenda, setProcessandoVenda] = useState(false);
  const [reciboGerado, setReciboGerado] = useState<any | null>(null);

  const [isCaixaOpen, setIsCaixaOpen] = useState(false);
  const [dataCaixaFiltro, setDataCaixaFiltro] = useState(hojeStr);
  const [isConfirmarLimparOpen, setIsConfirmarLimparOpen] = useState(false);

  // ==========================================================================
  // 📥 CARREGAMENTO DE DADOS (INTEROPERABILIDADE)
  // ==========================================================================
  const carregarDadosOmni = async () => {
    // 1. Carrega Produtos em Estoque
    const { data: estData } = await supabase
      .from('produto_variacoes')
      .select(`id, sku, preco_custo, preco_venda, estoque_atual, imagem_url, pai:produtos(nome_base, categoria)`)
      .gt('estoque_atual', 0); // Só mostra o que tem saldo físico

    if (estData) {
      const pFormatado = estData.map((item: any) => ({
        id: item.id,
        cod: item.sku,
        nome: item.pai?.nome_base || "Sem Nome",
        preco: Number(item.preco_venda),
        custo: Number(item.preco_custo),
        estoque: Number(item.estoque_atual),
        categoria: item.pai?.categoria || "Geral",
        imagem: item.imagem_url || ""
      }));
      setProdutosDB(pFormatado);
    }

    // 2. Carrega Clientes (CRM)
    const { data: cliData } = await supabase.from('clientes').select('id, nome_completo, whatsapp');
    if (cliData) setClientesDB(cliData);

    // 3. Carrega Histórico de Caixa do Dia (Auditoria)
    const { data: vendData } = await supabase
      .from('vendas')
      .select(`id, total_final, forma_pagamento, status_pagamento, data_venda, cliente:clientes(nome_completo)`)
      .order('data_venda', { ascending: false })
      .limit(50); // Puxa os últimos 50 registros pro caixa não pesar
      
    if (vendData) {
      const vFormatado = vendData.map((v: any) => {
        const d = new Date(v.data_venda);
        return {
          id: v.id.split('-')[0].toUpperCase(), // Pega só um pedaço do UUID pra visualização
          id_real: v.id,
          hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          data_venda: d.toISOString().split('T')[0],
          cliente: v.cliente?.nome_completo || "Consumidor Final",
          total: Number(v.total_final),
          metodo: v.forma_pagamento,
          status: v.status_pagamento === 'Cancelado' ? 'Estornada' : 'Concluída'
        }
      });
      setVendasBanco(vFormatado);
    }

    setLoadingBanco(false);
  };

  useEffect(() => {
    carregarDadosOmni();
  }, [supabase]);

  // ==========================================================================
  // 🛡️ MEMÓRIA MUSCULAR DO PDV (CACHE)
  // ==========================================================================
  useEffect(() => {
    const draftCart = localStorage.getItem("@baply_pdv_carrinho");
    const draftDesc = localStorage.getItem("@baply_pdv_desconto");
    const draftMetodo = localStorage.getItem("@baply_pdv_metodo");
    const draftCliente = localStorage.getItem("@baply_pdv_cliente");

    if (draftCart) setCarrinho(JSON.parse(draftCart));
    if (draftDesc) setDescontoReal(JSON.parse(draftDesc));
    if (draftMetodo) setMetodoPagamentoId(draftMetodo);
    if (draftCliente) setClienteSelecionadoId(draftCliente);

    setIsInicializado(true);
  }, []);

  useEffect(() => {
    if (isInicializado) {
      localStorage.setItem("@baply_pdv_carrinho", JSON.stringify(carrinho));
      localStorage.setItem("@baply_pdv_desconto", JSON.stringify(descontoReal));
      localStorage.setItem("@baply_pdv_metodo", metodoPagamentoId);
      localStorage.setItem("@baply_pdv_cliente", clienteSelecionadoId);
    }
  }, [carrinho, descontoReal, metodoPagamentoId, clienteSelecionadoId, isInicializado]);

  const limparCachePDV = () => {
    localStorage.removeItem("@baply_pdv_carrinho");
    localStorage.removeItem("@baply_pdv_desconto");
    localStorage.removeItem("@baply_pdv_metodo");
    localStorage.removeItem("@baply_pdv_cliente");
  };

  // ==========================================================================

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return produtosDB.filter(p => p.nome.toLowerCase().includes(termo) || p.cod.toLowerCase().includes(termo));
  }, [busca, produtosDB]);

  const adicionarAoCarrinho = (produto: any) => {
    if (produto.estoque <= 0) {
      toast.error("Produto esgotado!", { description: "Verifique o estoque antes de vender." });
      return;
    }
    setCarrinho((prev) => {
      const itemExistente = prev.find(item => item.id === produto.id);
      if (itemExistente) {
        if (itemExistente.qtd >= produto.estoque) {
          toast.warning("Limite de estoque físico atingido.");
          return prev;
        }
        return prev.map(item => item.id === produto.id ? { ...item, qtd: item.qtd + 1, subtotal: (item.qtd + 1) * item.preco } : item);
      }
      toast.success(`${produto.nome} no carrinho!`);
      return [...prev, { ...produto, qtd: 1, subtotal: produto.preco }];
    });
  };

  const alterarQuantidade = (id: string, delta: number) => {
    setCarrinho((prev) => prev.map(item => {
      if (item.id === id) {
        const novaQtd = item.qtd + delta;
        if (novaQtd === 0) return item; 
        if (delta > 0 && novaQtd > item.estoque) { toast.warning("Estoque máximo atingido."); return item; }
        return { ...item, qtd: novaQtd, subtotal: novaQtd * item.preco };
      }
      return item;
    }));
  };

  const removerDoCarrinho = (id: string) => setCarrinho(prev => prev.filter(item => item.id !== id));
  
  const confirmarLimparCarrinho = () => {
    setCarrinho([]); setDescontoReal(""); setMetodoPagamentoId("pix"); setParcelasFlex(1);
    setValorRecebidoDinheiro(""); setClienteSelecionadoId(""); limparCachePDV();
    setIsConfirmarLimparOpen(false); toast.info("Carrinho esvaziado.");
  };

  const subtotalCarrinho = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  const totalDesconto = Number(descontoReal) || 0;
  const totalFinal = Math.max(0, subtotalCarrinho - totalDesconto);
  const totalItens = carrinho.reduce((acc, item) => acc + item.qtd, 0);
  const valorParcelaFlex = totalFinal / parcelasFlex;
  const trocoCalculado = Number(valorRecebidoDinheiro) - totalFinal;

  const metodoSelecionado = CONFIG_LOJA.metodos_pagamento.find(m => m.id === metodoPagamentoId) || CONFIG_LOJA.metodos_pagamento[0];
  const clienteSelecionado = clientesDB.find(c => c.id === clienteSelecionadoId);

  // 🚀 CROSS-SELL INTELIGENTE (Sugere baseado na categoria predominante)
  const sugestaoIA = useMemo(() => {
    if (carrinho.length === 0 || produtosDB.length === 0) return null;
    const temBanho = carrinho.some(i => i.categoria === "Banho");
    if (temBanho) {
      const prodCama = produtosDB.find(p => p.categoria === "Cama" && p.estoque > 0);
      if (prodCama) return { ...prodCama, motivo: "Que tal renovar os lençóis também?" };
    }
    return null;
  }, [carrinho, produtosDB]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target.id !== "busca-produto" && target.id !== "input-troco") return;

      if (e.key === "F2") { e.preventDefault(); if (!isCheckoutOpen && carrinho.length > 0) setIsCheckoutOpen(true); }
      if (e.key === "F4") { e.preventDefault(); document.getElementById("busca-produto")?.focus(); }
      if (e.key === "Escape") { setIsCheckoutOpen(false); setIsCaixaOpen(false); setReciboGerado(null); setIsConfirmarLimparOpen(false); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCheckoutOpen, isCaixaOpen, carrinho]);

  // ==========================================================================
  // 💾 O CORAÇÃO DO PDV: GRAVANDO A VENDA E ABATENDO O ESTOQUE
  // ==========================================================================
  const handleConfirmarVenda = async () => {
    if (metodoSelecionado.tipo === "crediario" && !clienteSelecionado) {
      toast.error(`Cliente obrigatório para o ${metodoSelecionado.nome}!`); return;
    }
    if (metodoSelecionado.tipo === "dinheiro" && (Number(valorRecebidoDinheiro) < totalFinal || valorRecebidoDinheiro === "")) {
      toast.error("O valor recebido deve ser maior ou igual ao total."); return;
    }

    setProcessandoVenda(true);
    
    try {
      // 1. INSERE A VENDA PRINCIPAL
      const dadosVenda = {
        cliente_id: clienteSelecionadoId || null,
        nome_vendedor: "Bia", // Pode ser puxado do auth.user depois
        subtotal: subtotalCarrinho,
        desconto_aplicado: totalDesconto,
        total_final: totalFinal,
        forma_pagamento: metodoSelecionado.nome,
        status_pagamento: 'Pago',
        num_parcelas: parcelasFlex
      };

      const { data: vendaCadastrada, error: erroVenda } = await supabase.from('vendas').insert(dadosVenda).select().single();
      if (erroVenda) throw erroVenda;

      // 2. INSERE OS ITENS E ABATE O ESTOQUE
      const itensParaSalvar = carrinho.map(item => ({
        venda_id: vendaCadastrada.id,
        produto_variacao_id: item.id,
        quantidade: item.qtd,
        preco_congelado: item.preco,
        custo_congelado: item.custo, // O segredo da auditoria: salva o custo histórico
        subtotal_item: item.subtotal
      }));

      const { error: erroItens } = await supabase.from('vendas_itens').insert(itensParaSalvar);
      if (erroItens) throw erroItens;

      // 3. ABATE O ESTOQUE INDIVIDUALMENTE
      for (const item of carrinho) {
        const novoSaldo = item.estoque - item.qtd;
        await supabase.from('produto_variacoes').update({ estoque_atual: novoSaldo }).eq('id', item.id);
      }

      // 4. PREPARA O RECIBO VISUAL
      const idReciboLimpo = vendaCadastrada.id.split('-')[0].toUpperCase();
      const dadosRecibo = {
        id_transacao: `TRX-${idReciboLimpo}`,
        data: new Date().toLocaleDateString('pt-BR'),
        itens: [...carrinho], subtotal: subtotalCarrinho, desconto: totalDesconto, total: totalFinal,
        metodo: metodoSelecionado.nome, tipo_metodo: metodoSelecionado.tipo, parcelas: parcelasFlex,
        troco: metodoSelecionado.tipo === "dinheiro" ? trocoCalculado : 0,
        cliente_nome: clienteSelecionado ? clienteSelecionado.nome_completo : "Consumidor Final",
        cliente_telefone: clienteSelecionado ? clienteSelecionado.whatsapp : "" 
      };

      toast.success("Venda Finalizada!", { description: "Estoque atualizado com sucesso." });
      
      // Limpeza de estado e Reload de tela
      setIsCheckoutOpen(false); 
      setReciboGerado(dadosRecibo); 
      setCarrinho([]); setDescontoReal(""); setClienteSelecionadoId(""); setParcelasFlex(1); setValorRecebidoDinheiro("");
      limparCachePDV();
      carregarDadosOmni(); // Recarrega o estoque novo

    } catch (error: any) {
      toast.error("Erro na gravação da venda.", { description: error.message });
    } finally {
      setProcessandoVenda(false);
    }
  };

  const handleEstornarVenda = async (idVendaReal: string) => {
    const confirmacao = window.confirm(`Atenção: Deseja ESTORNAR esta venda? Os itens voltarão ao estoque.`);
    if (!confirmacao) return;

    try {
      // 1. Muda status da venda
      await supabase.from('vendas').update({ status_pagamento: 'Cancelado' }).eq('id', idVendaReal);
      
      // 2. Busca itens para devolver pro estoque
      const { data: itensDev } = await supabase.from('vendas_itens').select('produto_variacao_id, quantidade').eq('venda_id', idVendaReal);
      
      if (itensDev) {
        for (const item of itensDev) {
          // Pega saldo atual
          const { data: prod } = await supabase.from('produto_variacoes').select('estoque_atual').eq('id', item.produto_variacao_id).single();
          if (prod) {
            // Devolve
            await supabase.from('produto_variacoes').update({ estoque_atual: prod.estoque_atual + item.quantidade }).eq('id', item.produto_variacao_id);
          }
        }
      }
      toast.success(`Transação estornada e estoque devolvido.`);
      carregarDadosOmni();
    } catch (error) {
      toast.error("Falha ao estornar.");
    }
  };

  const gerarLinkWhatsApp = () => {
    if (!reciboGerado) return "#";
    let texto = `🌸 *${CONFIG_LOJA.nome.toUpperCase()} - RECIBO DIGITAL* 🌸\n━━━━━━━━━━━━━━━━━━━\nOlá, *${reciboGerado.cliente_nome}*! ✨\nAqui está o resumo da sua compra conosco hoje (${reciboGerado.data}):\n\n`;
    reciboGerado.itens.forEach((item: any) => { texto += `🛍️ ${item.qtd}x ${item.nome} - R$ ${item.subtotal.toFixed(2).replace('.', ',')}\n`; });
    texto += `━━━━━━━━━━━━━━━━━━━\n💰 *Subtotal:* R$ ${reciboGerado.subtotal.toFixed(2).replace('.', ',')}\n`;
    if (reciboGerado.desconto > 0) texto += `📉 *Desconto:* - R$ ${reciboGerado.desconto.toFixed(2).replace('.', ',')}\n`;
    texto += `✅ *TOTAL FINAL:* *R$ ${reciboGerado.total.toFixed(2).replace('.', ',')}*\n\n💳 *Pagamento:* ${reciboGerado.metodo}`;
    
    if (reciboGerado.tipo_metodo === "crediario") {
      texto += ` em ${reciboGerado.parcelas}x de R$ ${(reciboGerado.total / reciboGerado.parcelas).toFixed(2).replace('.', ',')}\n\n📌 *Lembrete:* Mantenha suas parcelas em dia para continuar aproveitando nosso crediário exclusivo! 🥰`;
    } else if (reciboGerado.tipo_metodo === "dinheiro" && reciboGerado.troco > 0) {
      texto += `\n💸 *Troco devolvido:* R$ ${reciboGerado.troco.toFixed(2).replace('.', ',')}\n`;
    } else texto += `\n`;
    texto += `\n✨ *Obrigado pela preferência!*`;

    return `https://wa.me/${reciboGerado.cliente_telefone}?text=${encodeURIComponent(texto)}`;
  };

  const vendasFiltradasPorData = vendasBanco.filter(v => v.data_venda === dataCaixaFiltro);
  const vendasValidas = vendasFiltradasPorData.filter(v => v.status === "Concluída");
  
  const totalPix = vendasValidas.filter(v => v.metodo === "Pix").reduce((acc, v) => acc + v.total, 0);
  const totalCartao = vendasValidas.filter(v => v.metodo === "Cartão").reduce((acc, v) => acc + v.total, 0);
  const totalDinheiro = vendasValidas.filter(v => v.metodo === "Dinheiro").reduce((acc, v) => acc + v.total, 0);
  const totalCrediario = vendasValidas.filter(v => v.metodo === "Sweet Flex").reduce((acc, v) => acc + v.total, 0);
  const totalCaixaGeral = totalPix + totalCartao + totalDinheiro + totalCrediario;

  if (loadingBanco || !isInicializado) return (
    <div className="flex h-[80vh] items-center justify-center text-[#A67B5B] flex-col gap-4">
      <Loader2 size={48} className="animate-spin" />
      <span className="font-bold text-stone-500">Sincronizando PDV com o Supabase...</span>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col mb-10 relative">
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-3 shadow-sm">
            <ShoppingCart size={14} /> PDV Conectado
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight">Frente de Caixa</h1>
            <div className="hidden xl:flex items-center gap-2 bg-stone-100 dark:bg-stone-800/50 px-3 py-1 rounded-lg text-[10px] font-bold text-stone-400">
              <Keyboard size={12}/> F4 Busca • F2 Cobrar
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => setIsCaixaOpen(true)} className="flex items-center gap-2 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm transition-colors text-sm font-bold text-stone-700 dark:text-stone-300">
            <Store size={18} className="text-[#A67B5B]" /> <span className="hidden md:inline">Gestão de Caixa</span>
          </button>
          <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-900 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-inner">
            <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-500"><User size={14} /></div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-stone-900 dark:text-white leading-none">Terminal Principal</p>
              <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* VITRINE */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30 shrink-0">
            <div className="relative">
              <ScanBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A67B5B]" size={20} />
              <input id="busca-produto" type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Bipar código de barras ou buscar por nome..." className="w-full pl-12 pr-4 py-4 bg-white dark:bg-stone-950 border-2 border-stone-200 dark:border-stone-800 rounded-xl text-base focus:outline-none focus:border-[#A67B5B] focus:ring-4 focus:ring-[#A67B5B]/10 transition-all text-stone-900 dark:text-white font-bold shadow-sm" autoFocus />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30 dark:bg-stone-900/10">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {produtosFiltrados.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-400">
                  <PackageOpen size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-bold">Nenhum produto em estoque.</p>
                </div>
              ) : (
                produtosFiltrados.map((prod) => (
                  <button key={prod.id} onClick={() => adicionarAoCarrinho(prod)} className="group text-left bg-white dark:bg-stone-800 rounded-2xl border-2 border-stone-100 dark:border-stone-700 hover:border-[#A67B5B] transition-all flex flex-col h-56 overflow-hidden">
                    <div className="w-full h-32 bg-stone-100 dark:bg-stone-900 relative shrink-0">
                       {prod.imagem && prod.imagem.includes('http') ? <img src={prod.imagem} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <ImageIcon size={32} className="mx-auto mt-10 text-stone-300" />}
                       <div className="absolute top-2 right-2 bg-stone-900/80 text-white px-2 py-1 rounded text-[9px] font-bold">#{prod.cod}</div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h3 className="font-bold text-xs text-stone-900 dark:text-white leading-snug line-clamp-2">{prod.nome}</h3>
                      <div className="flex justify-between items-end mt-2">
                        <p className="text-[10px] font-bold text-stone-400">{prod.estoque} un</p>
                        <p className="text-sm font-black text-[#A67B5B]">R$ {prod.preco.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CARRINHO */}
        <div className="lg:col-span-4 flex flex-col bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-xl overflow-hidden relative">
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 bg-stone-900 text-white flex justify-between items-center shrink-0">
            <h2 className="font-black text-lg flex items-center gap-2"><ShoppingCart size={18} className="text-[#A67B5B]" /> Carrinho</h2>
            <span className="bg-[#A67B5B] text-white text-xs font-black px-2.5 py-1 rounded-full">{totalItens} itens</span>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-stone-50/50 dark:bg-stone-900/30 flex flex-col p-4">
            {carrinho.length === 0 ? (
              <div className="m-auto text-stone-400 text-center"><ScanBarcode size={48} className="mx-auto mb-2 opacity-20" /><p className="font-medium text-sm">O carrinho está vazio.</p></div>
            ) : (
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm relative group flex gap-3 items-center">
                    <button onClick={() => removerDoCarrinho(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10"><X size={12} strokeWidth={3}/></button>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate pr-2">{item.nome}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md p-0.5">
                          <button onClick={() => alterarQuantidade(item.id, -1)} className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-stone-800"><Minus size={10}/></button>
                          <span className="text-[10px] font-black w-3 text-center">{item.qtd}</span>
                          <button onClick={() => alterarQuantidade(item.id, 1)} className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-stone-800"><Plus size={10}/></button>
                        </div>
                        <p className="text-sm font-black dark:text-white">R$ {item.subtotal.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sugestaoIA && (
              <div className="mt-4 p-3 bg-gradient-to-r from-[#A67B5B]/10 to-transparent border border-[#A67B5B]/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#A67B5B] uppercase flex items-center gap-1"><Sparkles size={10} /> Sugestão da I.A.</p>
                  <p className="text-xs font-bold dark:text-white truncate max-w-[150px]">{sugestaoIA.nome}</p>
                </div>
                <button onClick={() => adicionarAoCarrinho(sugestaoIA)} className="w-8 h-8 rounded-full bg-[#A67B5B] text-white flex items-center justify-center"><Plus size={16} strokeWidth={3}/></button>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 p-6 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-400"><Tag size={16} /></div>
              <input type="number" value={descontoReal} onChange={(e) => setDescontoReal(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Desconto (R$)" min="0" step="0.01" className="w-full px-4 py-2.5 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 rounded-xl text-sm font-bold dark:text-white" />
            </div>
            <div className="flex justify-between items-end mb-6">
              <span className="text-base font-black uppercase dark:text-white">Total</span>
              <span className="text-3xl font-black text-[#A67B5B]">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirmarLimparOpen(true)} disabled={carrinho.length === 0} className="p-4 rounded-xl border-2 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-red-500 hover:border-red-200"><Trash2 size={20} /></button>
              <button disabled={carrinho.length === 0} onClick={() => setIsCheckoutOpen(true)} className="flex-1 flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-[#A67B5B] dark:text-stone-900 font-black text-lg rounded-xl hover:bg-stone-800 transition-all">
                <CreditCard size={20} /> Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT SIMPLIFICADO */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}></div>
          <div className="relative w-full max-w-md bg-stone-50 dark:bg-stone-900 h-full p-6 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <h2 className="text-xl font-black mb-6 dark:text-white">Meio de Pagamento</h2>
            
            <div className="mb-6">
               <label className="text-sm font-bold dark:text-white flex items-center gap-2 mb-2"><User size={16} className="text-stone-400" /> Cliente</label>
               <select value={clienteSelecionadoId} onChange={(e) => setClienteSelecionadoId(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm font-medium dark:text-white">
                 <option value="">Consumidor Final (Sem Cadastro)</option>
                 {clientesDB.map(c => <option key={c.id} value={c.id}>{c.nome_completo} - ({c.whatsapp || "S/ Zap"})</option>)}
               </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button onClick={() => setMetodoPagamentoId("pix")} className={`p-4 rounded-xl border-2 font-bold ${metodoPagamentoId === "pix" ? "border-[#A67B5B] text-[#A67B5B]" : "border-stone-200 dark:border-stone-800 dark:text-white"}`}>Pix</button>
              <button onClick={() => setMetodoPagamentoId("cartao")} className={`p-4 rounded-xl border-2 font-bold ${metodoPagamentoId === "cartao" ? "border-[#A67B5B] text-[#A67B5B]" : "border-stone-200 dark:border-stone-800 dark:text-white"}`}>Cartão</button>
              <button onClick={() => setMetodoPagamentoId("dinheiro")} className={`p-4 rounded-xl border-2 font-bold ${metodoPagamentoId === "dinheiro" ? "border-[#A67B5B] text-[#A67B5B]" : "border-stone-200 dark:border-stone-800 dark:text-white"}`}>Dinheiro</button>
              <button onClick={() => setMetodoPagamentoId("crediario_1")} className={`p-4 rounded-xl border-2 font-bold ${metodoPagamentoId === "crediario_1" ? "border-[#A67B5B] text-[#A67B5B]" : "border-stone-200 dark:border-stone-800 dark:text-white"}`}>Sweet Flex</button>
            </div>

            <button onClick={handleConfirmarVenda} disabled={processandoVenda} className="mt-auto w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black rounded-xl hover:bg-[#A67B5B] transition-colors">
              {processandoVenda ? "Baixando Estoque na Nuvem..." : "Confirmar Venda Sincronizada"}
            </button>
          </div>
        </div>
      )}

      {/* RECIBO DIGITAL */}
      {reciboGerado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md"></div>
          <div className="relative bg-white dark:bg-stone-900 rounded-3xl p-8 flex flex-col items-center w-80 text-center">
            <CheckCircle2 size={60} className="text-emerald-500 mb-4" />
            <h2 className="text-2xl font-black mb-2 dark:text-white">Venda Concluída!</h2>
            <p className="text-3xl font-black text-[#A67B5B] mb-6">R$ {reciboGerado.total.toFixed(2).replace('.', ',')}</p>
            <a href={gerarLinkWhatsApp()} target="_blank" className="w-full py-3 mb-2 bg-[#25D366] text-white font-bold rounded-xl flex items-center justify-center gap-2"><MessageCircleHeart size={18}/> Enviar Recibo</a>
            <button onClick={() => setReciboGerado(null)} className="w-full py-3 bg-stone-100 dark:bg-stone-800 font-bold rounded-xl text-stone-600 dark:text-stone-300">Voltar ao Caixa (Esc)</button>
          </div>
        </div>
      )}

      {/* CAIXA / HISTÓRICO */}
      {isCaixaOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setIsCaixaOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-stone-50 dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between bg-white dark:bg-stone-950">
              <h2 className="text-xl font-black dark:text-white flex items-center gap-2"><Store size={20} className="text-[#A67B5B]" /> Gestão de Caixa Real</h2>
              <button onClick={() => setIsCaixaOpen(false)}><X size={20} className="text-stone-400"/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="col-span-2 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
                  <p className="text-stone-400 text-xs font-bold uppercase mb-1">Volume Total de Vendas</p>
                  <h3 className="text-3xl font-black text-white">R$ {totalCaixaGeral.toFixed(2).replace('.', ',')}</h3>
                </div>
              </div>
              <h3 className="text-sm font-bold text-stone-400 uppercase mb-4">Histórico de Hoje</h3>
              <div className="space-y-3">
                {vendasBanco.map((venda) => (
                  <div key={venda.id_real} className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 flex justify-between items-center">
                    <div>
                      <p className={`font-bold text-sm ${venda.status === "Estornada" ? "line-through text-stone-400" : "dark:text-white"}`}>{venda.id} - {venda.cliente}</p>
                      <p className="text-xs text-stone-500">{venda.hora} • {venda.metodo}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-black text-lg ${venda.status === "Estornada" ? "text-red-500" : "dark:text-white"}`}>R$ {venda.total.toFixed(2).replace('.', ',')}</p>
                      {venda.status !== "Estornada" && (
                         <button onClick={() => handleEstornarVenda(venda.id_real)} className="text-stone-300 hover:text-red-500" title="Estornar"><RotateCcw size={16}/></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL ESVAZIAR */}
      {isConfirmarLimparOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm" onClick={() => setIsConfirmarLimparOpen(false)}></div>
          <div className="relative bg-white dark:bg-stone-900 w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl">
            <h3 className="font-black text-xl mb-2 dark:text-white">Esvaziar Carrinho?</h3>
            <p className="text-sm text-stone-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirmarLimparOpen(false)} className="flex-1 py-3 rounded-xl font-bold bg-stone-100 dark:bg-stone-800 dark:text-white">Cancelar</button>
              <button onClick={confirmarLimparCarrinho} className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white">Esvaziar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";
import { 
  DollarSign, TrendingUp, TrendingDown, Users, 
  Search, MessageCircle, AlertTriangle, FileText, 
  BrainCircuit, CheckCircle2, ChevronRight, X, 
  CalendarDays, SmartphoneNfc, ArrowUpRight, ArrowDownRight,
  MessageCircleHeart, Loader2, Landmark, Sparkles,
  Bot, History, Wallet, Target, UserPlus, MapPin, Edit2, Trash2, Save,
  Building2, SearchCode, Handshake, ScrollText, Factory, Plus,
  LayoutGrid, List
} from "lucide-react";

// ============================================================================
// 🚀 MOCKS DE ALTA FIDELIDADE (Agora com CPF para o Omni-Search)
// ============================================================================
const DESPESAS_MOCK = [
  { id: "DESP-001", descricao: "Lote Toalhas (NF 1234)", valor: 2450.00, vencimento: "2026-03-25", status: "Pendente", categoria: "Estoque / Mercadorias", fornecedor: "Buddemeyer S.A." },
  { id: "DESP-002", descricao: "Aluguel da Loja", valor: 3200.00, vencimento: "2026-03-10", status: "Pago", categoria: "Despesas Fixas", fornecedor: "Imobiliária Central" },
  { id: "DESP-003", descricao: "Tráfego Pago (Instagram Ads)", valor: 500.00, vencimento: "2026-03-15", status: "Pago", categoria: "Marketing", fornecedor: "Meta Plataforms" },
  { id: "DESP-004", descricao: "Embalagens", valor: 850.00, vencimento: "2026-03-28", status: "Pendente", categoria: "Insumos / Embalagens", fornecedor: "Embalagens Express" }
];

const CLIENTES_MOCK = [
  { id: "CLI-101", cliente: "Ana Costa", cpf: "111.222.333-44", telefone: "5511999999999", endereco: "Rua das Flores, 123 - Centro", valor_pendente: 145.00, atraso: 12, status_divida: "Atrasado", risco: "Atenção", ltv: 1250.00, cashback: 15.00, ultima_interacao: "Lembrete via IA (Há 2 dias)" },
  { id: "CLI-102", cliente: "Maria Souza", cpf: "555.666.777-88", telefone: "5511888888888", endereco: "Av. Paulista, 1000 - Bela Vista", valor_pendente: 89.90, atraso: 0, status_divida: "No Prazo", risco: "Excelente", ltv: 3400.00, cashback: 45.50, ultima_interacao: "Agradecimento (Há 1 mês)" },
  { id: "CLI-103", cliente: "Juliana Silva", cpf: "999.000.111-22", telefone: "5511777777777", endereco: "Rua Augusta, 500 - Consolação", valor_pendente: 450.00, atraso: 45, status_divida: "Crítico", risco: "Crítico", ltv: 450.00, cashback: 0.00, ultima_interacao: "Promessa Quebrada (Há 15 dias)" },
  { id: "CLI-104", cliente: "Carlos Mendes", cpf: "333.444.555-66", telefone: "5511666666666", endereco: "Rua B, 45 - Jardins", valor_pendente: 0.00, atraso: 0, status_divida: "No Prazo", risco: "Excelente", ltv: 5200.00, cashback: 100.00, ultima_interacao: "Venda Realizada (Há 5 dias)" }
];

const FORNECEDORES_MOCK = [
  { id: "FORN-001", nome: "Buddemeyer S.A.", cnpj: "00.000.000/0001-00", categoria: "Indústria Têxtil", telefone: "5547999999999", contato: "Sr. Roberto (Vendas)" },
  { id: "FORN-002", nome: "Karsten", cnpj: "11.111.111/0001-11", categoria: "Cama, Mesa e Banho", telefone: "5547888888888", contato: "Ana (Logística)" },
  { id: "FORN-003", nome: "Embalagens Express", cnpj: "22.222.222/0001-22", categoria: "Insumos", telefone: "5511988888888", contato: "Central" }
];

const FATURAS_MOCK = [
  { id: "FAT-001", cliente_id: "CLI-101", mes: "Janeiro/26", valor: 50.00 },
  { id: "FAT-002", cliente_id: "CLI-101", mes: "Fevereiro/26", valor: 95.00 },
  { id: "FAT-003", cliente_id: "CLI-103", mes: "Dezembro/25", valor: 150.00 },
  { id: "FAT-004", cliente_id: "CLI-103", mes: "Janeiro/26", valor: 300.00 },
];

export default function FinanceiroCRMPage() {
  const supabase = createClient();

  const [abaAtiva, setAbaAtiva] = useState("despesas"); 
  const [abaDespesas, setAbaDespesas] = useState("lancamentos"); 
  
  const [loading, setLoading] = useState(true);
  const [isInicializado, setIsInicializado] = useState(false);

  // ==========================================
  // ARQUITETURA 5.0 (OMNI-SEARCH & SMART GRID)
  // ==========================================
  const [buscaCliente, setBuscaCliente] = useState("");
  const [filtroChips, setFiltroChips] = useState("Todos"); // "Todos" | "Atrasados" | "Cashback" | "VIP"
  const [visaoModo, setVisaoModo] = useState("tabela"); // "tabela" | "grid"
  
  // ==========================================
  // ESTADOS CRM (CLIENTES) E I.A. 4.0
  // ==========================================
  const [modalCobranca, setModalCobranca] = useState(false);
  const [clienteAlvo, setClienteAlvo] = useState<any>(null);
  
  const [valorPagamento, setValorPagamento] = useState<number | "">("");
  const [tomCobranca, setTomCobranca] = useState<number>(3); 
  
  const [gerandoMensagem, setGerandoMensagem] = useState(false);
  const [mensagemGerada, setMensagemGerada] = useState("");
  const [automacaoLigada, setAutomacaoLigada] = useState(false);

  // ==========================================
  // ESTADOS DE CADASTRO E B2B
  // ==========================================
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [formCliente, setFormCliente] = useState({ nome: "", telefone: "", cpf: "", endereco: "" });
  const [salvandoCliente, setSalvandoCliente] = useState(false);

  const [buscaFornecedor, setBuscaFornecedor] = useState("");
  const [modalNovoFornecedor, setModalNovoFornecedor] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const [formFornecedor, setFormFornecedor] = useState({ nome: "", cnpj: "", telefone: "", contato: "", categoria: "", endereco: "", pix: "" });
  
  const [modalFornecedorIA, setModalFornecedorIA] = useState(false);
  const [fornecedorAlvo, setFornecedorAlvo] = useState<any>(null);
  const [estrategiaFornIA, setEstrategiaFornIA] = useState("desconto"); 
  const [msgFornecedorIA, setMsgFornecedorIA] = useState("");

  const [analisandoDados, setAnalisandoDados] = useState(false);
  const [relatorioCEO, setRelatorioCEO] = useState("");

  const [formDespesa, setFormDespesa] = useState({ fornecedor: "", descricao: "", categoria: "Estoque / Mercadorias", valor: "", vencimento: "", parcelas: 1, frequencia: "Mensal", pago: "Não" });

  // ==========================================
  // CÁLCULOS GLOBAIS
  // ==========================================
  const receitaMes = 18450.00;
  const despesasPagas = DESPESAS_MOCK.filter(d => d.status === "Pago").reduce((acc, d) => acc + d.valor, 0);
  const despesasPendentes = DESPESAS_MOCK.filter(d => d.status === "Pendente").reduce((acc, d) => acc + d.valor, 0);
  const totalReceber = CLIENTES_MOCK.reduce((acc, r) => acc + r.valor_pendente, 0);
  const inadimplencia = CLIENTES_MOCK.filter(r => r.atraso > 0).reduce((acc, r) => acc + r.valor_pendente, 0);
  const lucroLiquidoAtual = receitaMes - despesasPagas;

  // ==========================================
  // O MOTOR BAPLY OMNI-SEARCH (Lente Global)
  // ==========================================
  const clientesProcessados = useMemo(() => {
    let filtrados = [...CLIENTES_MOCK];
    
    // 1. Filtro Magnético (Smart Chips)
    if (filtroChips === "Atrasados") filtrados = filtrados.filter(c => c.atraso > 0);
    else if (filtroChips === "Cashback") filtrados = filtrados.filter(c => c.cashback > 0);
    else if (filtroChips === "VIP") filtrados = filtrados.sort((a, b) => b.ltv - a.ltv).slice(0, 10);

    // 2. Filtro Omni-Search (Ignora traços, pontos e foca nos 4 campos)
    if (buscaCliente) {
      const termoBusca = buscaCliente.toLowerCase().replace(/[^a-z0-9]/gi, ''); 
      filtrados = filtrados.filter(c => {
         const idLimpo = c.id.toLowerCase().replace(/[^a-z0-9]/gi, '');
         const nomeLimpo = c.cliente.toLowerCase();
         const telLimpo = c.telefone.replace(/[^0-9]/g, '');
         const cpfLimpo = c.cpf.replace(/[^0-9]/g, '');
         
         return nomeLimpo.includes(buscaCliente.toLowerCase()) || 
                idLimpo.includes(termoBusca) || 
                telLimpo.includes(termoBusca) || 
                cpfLimpo.includes(termoBusca);
      });
    }
    
    // Simulação de limite de exibição (Para escalabilidade futura)
    return filtrados.slice(0, 50); 
  }, [buscaCliente, filtroChips]);

  const fornecedoresFiltrados = FORNECEDORES_MOCK.filter(f => f.nome.toLowerCase().includes(buscaFornecedor.toLowerCase()) || f.cnpj.includes(buscaFornecedor));


  // ==========================================
  // MEMÓRIA MUSCULAR
  // ==========================================
  useEffect(() => {
    const draftMsg = localStorage.getItem("@baply_crm_msg");
    const draftTom = localStorage.getItem("@baply_crm_tom");
    const draftClienteId = localStorage.getItem("@baply_crm_cliente_id");
    const draftFormCliente = localStorage.getItem("@baply_crm_form_novo_cli");
    const draftVisao = localStorage.getItem("@baply_crm_visao"); // Memória do Toggle Grid/Tabela

    if (draftMsg) setMensagemGerada(draftMsg);
    if (draftTom) setTomCobranca(Number(draftTom));
    if (draftFormCliente) setFormCliente(JSON.parse(draftFormCliente));
    if (draftVisao) setVisaoModo(draftVisao);
    
    if (draftClienteId) {
      const cli = CLIENTES_MOCK.find(c => c.id === draftClienteId);
      if (cli) {
        setClienteAlvo(cli);
        setModalCobranca(true);
      }
    }

    setLoading(false);
    setIsInicializado(true);
  }, []);

  useEffect(() => {
    if (isInicializado) {
      if (modalCobranca && clienteAlvo) {
        localStorage.setItem("@baply_crm_msg", mensagemGerada);
        localStorage.setItem("@baply_crm_tom", tomCobranca.toString());
        localStorage.setItem("@baply_crm_cliente_id", clienteAlvo.id);
      }
      if (modalNovoCliente) {
        localStorage.setItem("@baply_crm_form_novo_cli", JSON.stringify(formCliente));
      }
      localStorage.setItem("@baply_crm_visao", visaoModo);
    }
  }, [mensagemGerada, tomCobranca, clienteAlvo, modalCobranca, formCliente, modalNovoCliente, visaoModo, isInicializado]);

  // ==========================================================================
  // FUNÇÕES CLIENTES E CRM 4.0
  // ==========================================================================
  const fecharModalCRM = () => {
    setModalCobranca(false);
    setMensagemGerada("");
    setValorPagamento("");
    setClienteAlvo(null);
    localStorage.removeItem("@baply_crm_msg");
    localStorage.removeItem("@baply_crm_tom");
    localStorage.removeItem("@baply_crm_cliente_id");
  };

  const fecharModalNovoCliente = () => {
    setModalNovoCliente(false);
    setFormCliente({ nome: "", telefone: "", cpf: "", endereco: "" });
    localStorage.removeItem("@baply_crm_form_novo_cli");
  };

  const abrirCobranca = (cliente: any) => {
    setClienteAlvo(cliente);
    setValorPagamento("");
    if (clienteAlvo?.id !== cliente.id) setMensagemGerada("");
    setModalCobranca(true);
  };

  const salvarNovoCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCliente.nome || !formCliente.telefone) return toast.error("Nome e WhatsApp são obrigatórios!");
    setSalvandoCliente(true);
    setTimeout(() => {
      toast.success(`${formCliente.nome} cadastrada com sucesso!`);
      setSalvandoCliente(false);
      fecharModalNovoCliente();
    }, 1500);
  };

  const gerarMensagemIA = () => {
    setGerandoMensagem(true);
    setTimeout(() => {
      let msg = "";
      const linkFatura = `🌐 baply.com/fatura/${clienteAlvo.id}`;
      const nome = clienteAlvo.cliente.split(' ')[0];
      const valor = clienteAlvo.valor_pendente.toFixed(2).replace('.', ',');

      if (tomCobranca === 1) {
        msg = `Oiii, ${nome}! 🌸 Tudo bem com você e com a família? Passando aqui rapidinho pois notei que o sistema não identificou o seu pagamento de R$ ${valor}. Aconteceu algum imprevisto? Se precisar de ajuda, estou aqui! 🥰\n\nSeu extrato detalhado: ${linkFatura}`;
      } else if (tomCobranca === 2) {
        msg = `Olá, ${nome}! Tudo bem? ✨ Aqui é do financeiro da Sweet Home. Passando para lembrar da sua parcela de R$ ${valor} do Sweet Flex. Esqueceu? Não tem problema! Segue o link com o seu extrato e a nossa chave Pix: ${linkFatura} 💖`;
      } else if (tomCobranca === 3) {
        msg = `Olá, ${nome}. Como vai?\n\nConsta em nosso sistema uma pendência de R$ ${valor} referente às suas compras. Para mantermos o seu limite ativo e evitarmos juros, acesse o seu extrato e veja as opções de regularização: ${linkFatura} 🤝`;
      } else if (tomCobranca === 4) {
        msg = `Olá, ${nome}.\n\nIdentificamos um atraso de ${clienteAlvo.atraso} dias na sua parcela de R$ ${valor}. É importante regularizarmos isso hoje para evitar o bloqueio do seu crédito 'Sweet Flex'.\n\nConsulte os valores com multa e gere o Pix aqui: ${linkFatura}`;
      } else {
        msg = `Prezada ${nome},\n\nEste é um aviso de bloqueio de crédito. O seu débito de R$ ${valor} ultrapassou o limite de tolerância. Para regularizar a situação e evitar restrições, efetue o pagamento imediatamente através do seu link exclusivo: ${linkFatura}`;
      }

      setMensagemGerada(msg);
      setGerandoMensagem(false);
      toast.success("Mensagem estruturada com Inteligência Artificial!");
    }, 1500);
  };

  // ==========================================================================
  // FUNÇÕES B2B / FORNECEDORES E DESPESAS (MANTIDAS INTACTAS)
  // ==========================================================================
  const buscarCNPJ = async () => {
    const cnpjLimpo = formFornecedor.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return toast.error("CNPJ inválido. Digite os 14 números.");
    setBuscandoCnpj(true);
    toast.info("Consultando base da Receita Federal...");
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      const data = await res.json();
      if (data.cnpj) {
        setFormFornecedor(prev => ({
          ...prev,
          nome: data.nome_fantasia || data.razao_social,
          categoria: data.cnae_fiscal_descricao || "Comércio/Indústria",
          endereco: `${data.logradouro}, ${data.numero} - ${data.municipio}/${data.uf}`
        }));
        toast.success("CNPJ sincronizado! Dados corporativos preenchidos.");
      } else {
        toast.error("CNPJ não encontrado na base pública.");
      }
    } catch (e) { toast.error("Erro de conexão com a API da Receita Federal."); }
    setBuscandoCnpj(false);
  };

  const salvarNovoFornecedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFornecedor.nome) return toast.error("O nome da empresa é obrigatório.");
    setBuscandoCnpj(true);
    setTimeout(() => {
      toast.success(`${formFornecedor.nome} integrado à carteira B2B!`);
      setBuscandoCnpj(false);
      setModalNovoFornecedor(false);
      setFormFornecedor({ nome: "", cnpj: "", telefone: "", contato: "", categoria: "", endereco: "", pix: "" });
    }, 1500);
  };

  const abrirNegociadorB2B = (fornecedor: any) => {
    setFornecedorAlvo(fornecedor);
    setMsgFornecedorIA("");
    setModalFornecedorIA(true);
  };

  const gerarMensagemFornIA = () => {
    setGerandoMensagem(true);
    setTimeout(() => {
      let msg = "";
      if (estrategiaFornIA === "desconto") {
        msg = `Olá equipe da ${fornecedorAlvo.nome}, tudo bem? Aqui é o setor de compras da Sweet Home.\n\nEstamos programando uma reposição de estoque volumosa para os próximos dias. Gostaríamos de avaliar a possibilidade de uma negociação diferenciada com um desconto para pagamento à vista via PIX antecipado.\n\nPodemos enviar o espelho do pedido para avaliarem a margem? Aguardamos retorno. 🤝`;
      } else if (estrategiaFornIA === "prazo") {
        msg = `Prezados da ${fornecedorAlvo.nome}, como estão?\n\nDevido a um alinhamento estratégico em nosso fluxo de caixa deste mês, gostaríamos de solicitar cordialmente a prorrogação de prazo do nosso boleto com vencimento nesta semana por mais 15 dias.\n\nTemos um excelente histórico de parceria e agradecemos imensamente se puderem flexibilizar essa data. Ficamos no aguardo da nova fatura. 🏢`;
      } else {
        msg = `Olá, atenção time logístico da ${fornecedorAlvo.nome}.\n\nConstatamos que o nosso pedido faturado recentemente já ultrapassou a janela de SLA de entrega estipulada.\n\nComo operamos com estoque just-in-time, essa ruptura afeta nossa operação direta na loja. Poderiam, por gentileza, rastrear a carga e nos fornecer uma posição urgente e realista da previsão de descarga? Agradeço a agilidade. 🚚🚨`;
      }
      setMsgFornecedorIA(msg);
      setGerandoMensagem(false);
      toast.success("Estratégia B2B elaborada pela IA!");
    }, 1500);
  };

  const registrarDespesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDespesa.descricao || !formDespesa.valor) return toast.error("Descrição e valor são obrigatórios.");
    toast.success("Despesa lançada no Cofre Contábil!");
    setFormDespesa({ fornecedor: "", descricao: "", categoria: "Estoque / Mercadorias", valor: "", vencimento: "", parcelas: 1, frequencia: "Mensal", pago: "Não" });
  };

  const quitarDespesa = (id: string) => {
    toast.success("Baixa realizada! DRE atualizado.");
  };

  const gerarRelatorioCEO = () => {
    setAnalisandoDados(true);
    setTimeout(() => {
      const relatorio = `
### 📊 Diagnóstico Executivo Unit Economics
**Saúde Geral:** O caixa está operando com superávit. O lucro líquido atual é de **R$ ${lucroLiquidoAtual.toLocaleString('pt-BR')}**, representando uma excelente margem de contribuição.

**🚨 Alertas Críticos:**
1. **Inadimplência (Sweet Flex):** Temos **R$ ${inadimplencia.toLocaleString('pt-BR')}** retidos na rua. A cliente *Juliana Silva* (Risco Crítico) teve quebra de promessa há 15 dias. Bloqueio sistêmico recomendado.
2. **Custo de Aquisição (Marketing):** O investimento de R$ 500,00 no Instagram. O CAC (Custo de Aquisição) está em R$ 45,00 por cliente, enquanto o LTV médio da base está em R$ 1.200,00. Uma proporção excelente de 26x. A máquina está saudável.

**💡 Ação Tática de Growth:**
Utilize o módulo de CRM hoje para acionar os clientes com *Risco Excelente* que possuem saldo de *Cashback* preso. Ofereça um atendimento VIP via WhatsApp. Isso aumenta o LTV sem gastar R$ 1 a mais em Ads.
      `;
      setRelatorioCEO(relatorio);
      setAnalisandoDados(false);
      toast.success("Relatório estratégico finalizado.");
    }, 2500);
  };


  if (loading) return null;

  return (
    <div className="animate-in fade-in duration-500 mb-20 relative">
      
      {/* 🚨 CABEÇALHO */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-[#A67B5B] text-xs font-bold mb-4 shadow-sm">
            <Landmark size={14} /> Centro Operacional Baply
          </div>
          <h1 className="text-4xl font-black text-stone-900 dark:text-white tracking-tight transition-colors">CRM, B2B & Financeiro</h1>
          <p className="text-stone-500 dark:text-stone-400 font-medium mt-1 transition-colors">
            Gerencie sua base de clientes, integre fornecedores e cruze dados financeiros reais.
          </p>
        </div>
      </div>

      {/* 📊 MÉTRICAS GLOBAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-stone-800 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowUpRight size={20} strokeWidth={3}/></div>
            <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg">Entradas</span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1">Receita do Mês</p>
            <h3 className="text-3xl font-black text-stone-900 dark:text-white">R$ {receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 p-6 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ArrowDownRight size={20} strokeWidth={3}/></div>
            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider rounded-lg">Saídas</span>
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-1">Contas Pagas</p>
            <h3 className="text-3xl font-black text-stone-900 dark:text-white">R$ {despesasPagas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-500/20 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
          <AlertTriangle size={100} className="absolute -right-6 -bottom-6 text-amber-200 dark:text-amber-900/30 opacity-40 group-hover:scale-110 transition-transform duration-700" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform"><CalendarDays size={20} strokeWidth={3}/></div>
            <span className="px-2.5 py-1 bg-white/50 dark:bg-stone-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg backdrop-blur-sm">A Receber</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-1">Sweet Flex (Dívida Ativa)</p>
            <h3 className="text-3xl font-black text-amber-800 dark:text-amber-300">R$ {totalReceber.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
            <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-wider">R$ {inadimplencia.toLocaleString('pt-BR', {minimumFractionDigits: 2})} em Atraso</p>
          </div>
        </div>

        <div className="bg-stone-900 dark:bg-stone-950 p-6 rounded-[2rem] border border-stone-800 shadow-xl transition-shadow group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#A67B5B] rounded-full blur-[60px] opacity-20"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#A67B5B]/20 text-[#A67B5B] flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign size={20} strokeWidth={3}/></div>
            <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-lg">DRE</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Lucro Líquido</p>
            <h3 className="text-3xl font-black text-white">R$ {lucroLiquidoAtual.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
          </div>
        </div>
      </div>

      {/* 🧭 NAVEGAÇÃO DE ABAS */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-stone-200 dark:border-stone-700 mb-8 transition-colors overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button onClick={() => setAbaAtiva("clientes")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "clientes" ? "border-indigo-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Users size={18} className={`transition-all ${abaAtiva === "clientes" ? "text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] scale-110" : ""}`} /> Diretório de Clientes
        </button>
        <button onClick={() => setAbaAtiva("crm")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "crm" ? "border-rose-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Target size={18} className={`transition-all ${abaAtiva === "crm" ? "text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] scale-110" : ""}`} /> LTV & Cobrança
        </button>
        <button onClick={() => setAbaAtiva("despesas")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "despesas" ? "border-amber-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <Building2 size={18} className={`transition-all ${abaAtiva === "despesas" ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110" : ""}`} /> Compras & B2B
        </button>
        <button onClick={() => setAbaAtiva("ceo_ia")} className={`pb-4 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all border-b-2 ${abaAtiva === "ceo_ia" ? "border-blue-500 text-stone-900 dark:text-white" : "border-transparent text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"}`}>
          <BrainCircuit size={18} className={`transition-all ${abaAtiva === "ceo_ia" ? "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] scale-110" : ""}`} /> CEO Artificial
        </button>
      </div>

      {/* ====================================================================== */}
      {/* 👥 ABA 1: CARTEIRA DE CLIENTES E DIRETÓRIO (COM OMNI-SEARCH & GRID) */}
      {/* ====================================================================== */}
      {abaAtiva === "clientes" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors animate-in fade-in duration-300">
          
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-indigo-50/30 dark:bg-indigo-500/5 shrink-0">
            <div>
              <h3 className="font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-500" /> Carteira de Clientes
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">Busque por Nome, ID, WhatsApp ou CPF.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* OMNI-SEARCH INPUT */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text" 
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  placeholder="Pesquisa Global..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white shadow-sm" 
                />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                {/* TOGGLE DE VISÃO (TABELA / GRID) */}
                <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                   <button onClick={() => setVisaoModo("tabela")} className={`p-1.5 rounded-lg transition-all ${visaoModo === "tabela" ? "bg-white dark:bg-stone-800 text-indigo-500 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
                     <List size={16}/>
                   </button>
                   <button onClick={() => setVisaoModo("grid")} className={`p-1.5 rounded-lg transition-all ${visaoModo === "grid" ? "bg-white dark:bg-stone-800 text-indigo-500 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
                     <LayoutGrid size={16}/>
                   </button>
                </div>
                
                <button 
                  onClick={() => setModalNovoCliente(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-black bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <UserPlus size={18} /> Cadastrar
                </button>
              </div>
            </div>
          </div>

          {/* FILTROS MAGNÉTICOS (SMART CHIPS) */}
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/30 border-b border-stone-100 dark:border-stone-700 flex gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center mr-2">Filtros Rápidos:</span>
            {["Todos", "Atrasados", "Cashback", "VIP"].map(chip => (
              <button 
                key={chip} 
                onClick={() => setFiltroChips(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${filtroChips === chip ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-indigo-300"}`}
              >
                {chip === "Atrasados" && "🚨 "}
                {chip === "Cashback" && "🎁 "}
                {chip === "VIP" && "💎 "}
                {chip}
              </button>
            ))}
          </div>

          {/* RENDERIZAÇÃO DA VISÃO (TABELA OU GRID) */}
          <div className="min-h-[400px] bg-stone-50/30 dark:bg-stone-900/10">
            {clientesProcessados.length === 0 ? (
              <div className="py-16 text-center text-stone-400">
                <Users size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">Nenhum cliente encontrado no Omni-Search.</p>
              </div>
            ) : visaoModo === "tabela" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                      <th className="p-5">Nome & Contato</th>
                      <th className="p-5">Endereço Principal</th>
                      <th className="p-5 text-right">Estatísticas de Compra</th>
                      <th className="p-5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                    {clientesProcessados.map((cli) => (
                      <tr key={cli.id} className="group hover:bg-stone-50 dark:hover:bg-stone-700/20 transition-colors bg-white dark:bg-stone-800">
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-sm shrink-0 border border-indigo-100 dark:border-indigo-500/20">
                              {cli.cliente.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                {cli.cliente} <span className="text-[9px] bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 px-1.5 py-0.5 rounded font-mono">{cli.id}</span>
                              </p>
                              <p className="text-xs font-medium text-stone-500 dark:text-stone-400 font-mono mt-0.5 flex items-center gap-2">
                                <span className="flex items-center gap-1"><MessageCircle size={10} className="text-emerald-500"/> {cli.telefone}</span>
                                <span className="opacity-50">|</span>
                                <span>CPF: {cli.cpf}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <p className="text-xs font-medium text-stone-600 dark:text-stone-300 max-w-xs line-clamp-2">
                            {cli.endereco || <span className="italic opacity-50">Endereço não cadastrado</span>}
                          </p>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">LTV: R$ {cli.ltv.toFixed(2).replace('.', ',')}</p>
                            {cli.cashback > 0 && (
                              <span className="inline-flex items-center gap-1 bg-[#A67B5B]/10 text-[#A67B5B] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mt-0.5">
                                <Wallet size={10} /> + R$ {cli.cashback.toFixed(2).replace('.', ',')} Cashback
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors" title="Editar">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 bg-stone-100 dark:bg-stone-900 text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors" title="Excluir">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clientesProcessados.map((cli) => (
                  <div key={cli.id} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm hover:shadow-lg transition-shadow group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-lg border border-indigo-100 dark:border-indigo-500/20">
                          {cli.cliente.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-stone-900 dark:text-white leading-tight">{cli.cliente}</h4>
                          <span className="text-[10px] bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded font-mono">{cli.id}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 text-stone-400 hover:text-indigo-500 transition-colors"><Edit2 size={14} /></button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4 flex-1">
                      <p className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-2"><MessageCircle size={12} className="text-emerald-500"/> {cli.telefone}</p>
                      <p className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-2"><SearchCode size={12} className="text-stone-400"/> {cli.cpf}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2"><MapPin size={12} className="shrink-0 mt-0.5"/> <span className="line-clamp-2">{cli.endereco}</span></p>
                    </div>
                    
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-700 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">LTV Atual</p>
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">R$ {cli.ltv.toFixed(2).replace('.', ',')}</p>
                      </div>
                      {cli.cashback > 0 && (
                        <span className="inline-flex items-center gap-1 bg-[#A67B5B]/10 text-[#A67B5B] px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                          <Wallet size={12} /> R$ {cli.cashback.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🎯 ABA 2: CRM & LTV (A MÁQUINA DE DINHEIRO) COM OMNI-SEARCH E GRID */}
      {/* ====================================================================== */}
      {abaAtiva === "crm" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors animate-in fade-in duration-300">
          
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-rose-50/30 dark:bg-rose-500/5 shrink-0">
            <div>
              <h3 className="font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Target size={18} className="text-rose-500" /> Relacionamento e Inadimplência
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">Busque clientes em atraso e acione o Concierge de Cobrança.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text" 
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  placeholder="Pesquisa Global..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all text-stone-900 dark:text-white shadow-sm" 
                />
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                {/* TOGGLE DE VISÃO (TABELA / GRID) */}
                <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                   <button onClick={() => setVisaoModo("tabela")} className={`p-1.5 rounded-lg transition-all ${visaoModo === "tabela" ? "bg-white dark:bg-stone-800 text-rose-500 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
                     <List size={16}/>
                   </button>
                   <button onClick={() => setVisaoModo("grid")} className={`p-1.5 rounded-lg transition-all ${visaoModo === "grid" ? "bg-white dark:bg-stone-800 text-rose-500 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}>
                     <LayoutGrid size={16}/>
                   </button>
                </div>

                <button 
                  onClick={() => setAutomacaoLigada(!automacaoLigada)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black uppercase tracking-wider transition-all shadow-sm shrink-0 ${automacaoLigada ? "bg-rose-500 border-rose-500 text-white shadow-rose-500/30 animate-pulse" : "bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}
                >
                  <Bot size={16} /> {automacaoLigada ? "Automação ON" : "Ligar Robô"}
                </button>
              </div>
            </div>
          </div>

          {/* FILTROS MAGNÉTICOS (SMART CHIPS) */}
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-900/30 border-b border-stone-100 dark:border-stone-700 flex gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center mr-2">Filtros Rápidos:</span>
            {["Todos", "Atrasados", "Cashback", "VIP"].map(chip => (
              <button 
                key={chip} 
                onClick={() => setFiltroChips(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${filtroChips === chip ? "bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-rose-300"}`}
              >
                {chip === "Atrasados" && "🚨 "}
                {chip === "Cashback" && "🎁 "}
                {chip === "VIP" && "💎 "}
                {chip}
              </button>
            ))}
          </div>

          <div className="min-h-[400px] bg-stone-50/30 dark:bg-stone-900/10">
            {clientesProcessados.length === 0 ? (
              <div className="py-16 text-center text-stone-400">
                <Target size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold">Nenhum cliente atende aos critérios atuais.</p>
              </div>
            ) : visaoModo === "tabela" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                      <th className="p-5">Dossiê da Cliente</th>
                      <th className="p-5 text-right">Saldo Devedor</th>
                      <th className="p-5 text-center">Score / Atraso</th>
                      <th className="p-5 text-right">LTV & Cashback</th>
                      <th className="p-5 text-center">Status da Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                    {clientesProcessados.map((rec) => (
                      <tr key={rec.id} className="group hover:bg-stone-50 dark:hover:bg-stone-700/20 transition-colors bg-white dark:bg-stone-800">
                        <td className="p-5">
                          <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">{rec.cliente} <span className="text-[9px] bg-stone-100 dark:bg-stone-900 text-stone-500 px-1.5 py-0.5 rounded font-mono">{rec.id}</span></p>
                          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 font-mono mt-0.5">{rec.telefone}</p>
                        </td>
                        
                        <td className="p-5 text-right">
                          <p className={`text-base font-black ${rec.atraso > 0 ? "text-rose-600 dark:text-rose-400" : "text-stone-900 dark:text-white"}`}>
                            R$ {rec.valor_pendente.toFixed(2).replace('.', ',')}
                          </p>
                        </td>
                        
                        <td className="p-5 text-center">
                          {rec.atraso > 0 ? (
                            <div className="flex flex-col gap-1 items-center">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${rec.risco === "Crítico" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                                Risco {rec.risco}
                              </span>
                              <span className="text-xs font-bold text-red-500">{rec.atraso} dias vencido</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 items-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                Risco {rec.risco}
                              </span>
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">Em Dia</span>
                            </div>
                          )}
                        </td>

                        <td className="p-5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Total Comprado (LTV)</span>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">R$ {rec.ltv.toFixed(2).replace('.', ',')}</p>
                            {rec.cashback > 0 && (
                              <span className="inline-flex items-center gap-1 bg-[#A67B5B]/10 text-[#A67B5B] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mt-1">
                                <Wallet size={10} /> + R$ {rec.cashback.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="p-5 text-center">
                          <p className="text-[10px] font-bold text-stone-500 mb-2 truncate max-w-[150px] mx-auto">{rec.ultima_interacao}</p>
                          
                          {automacaoLigada ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold w-full justify-center opacity-70 cursor-not-allowed">
                              <Bot size={14} /> Fila do Robô
                            </span>
                          ) : (
                            <button 
                              onClick={() => abrirCobranca(rec)}
                              className={`flex items-center justify-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-sm mx-auto group/btn w-full ${rec.atraso > 0 ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                            >
                              <MessageCircleHeart size={14} className="group-hover/btn:scale-110 transition-transform" /> 
                              {rec.atraso > 0 ? "Cobrar / Negociar" : "Fidelizar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // VISÃO EM GRID (CARTÕES DE COBRANÇA CRM)
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clientesProcessados.map((rec) => (
                  <div key={`card-crm-${rec.id}`} className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-5 shadow-sm hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden">
                    {/* Tarja superior de status */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${rec.atraso > 0 ? (rec.risco === "Crítico" ? "bg-red-500" : "bg-amber-500") : "bg-emerald-500"}`}></div>
                    
                    <div className="flex justify-between items-start mb-4 mt-2">
                      <div>
                        <h4 className="font-black text-lg text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                          {rec.cliente}
                        </h4>
                        <p className="text-xs font-mono text-stone-500">{rec.telefone}</p>
                      </div>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded font-mono">{rec.id}</span>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4 mb-4 flex justify-between items-center border border-stone-100 dark:border-stone-800">
                       <div>
                         <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Dívida / Saldo</p>
                         <p className={`text-xl font-black ${rec.atraso > 0 ? "text-rose-600 dark:text-rose-400" : "text-stone-900 dark:text-white"}`}>
                           R$ {rec.valor_pendente.toFixed(2).replace('.', ',')}
                         </p>
                       </div>
                       <div className="text-right">
                         {rec.atraso > 0 ? (
                           <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${rec.risco === "Crítico" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                             {rec.atraso} Dias Atraso
                           </span>
                         ) : (
                           <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                             Em Dia
                           </span>
                         )}
                       </div>
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                      <p className="text-[10px] font-bold text-stone-400 text-center truncate">{rec.ultima_interacao}</p>
                      <button 
                        onClick={() => abrirCobranca(rec)}
                        disabled={automacaoLigada}
                        className={`w-full py-3 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${rec.atraso > 0 ? "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30" : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30"}`}
                      >
                        {automacaoLigada ? <><Bot size={16}/> Robô Ativado</> : <><MessageCircleHeart size={16}/> {rec.atraso > 0 ? "Abrir Negociação 360º" : "Fidelizar Cliente"}</>}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🏢 ABA 3: COMPRAS, DESPESAS E GESTÃO DE FORNECEDORES (B2B) */}
      {/* ====================================================================== */}
      {abaAtiva === "despesas" && (
        <div className="bg-white dark:bg-stone-800 rounded-[2rem] shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors animate-in fade-in duration-300 min-h-[500px]">
          
          <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-amber-50/30 dark:bg-amber-500/5 shrink-0">
            <div>
              <h3 className="font-black text-stone-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-amber-500" /> Operações B2B & Saídas
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-1">Integração de pagamentos, relacionamento com a indústria e controle de despesas (DRE).</p>
            </div>
            
            <div className="flex bg-stone-100 dark:bg-stone-900 p-1 rounded-xl border border-stone-200 dark:border-stone-800 w-full md:w-auto overflow-x-auto">
               <button onClick={() => setAbaDespesas("lancamentos")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${abaDespesas === "lancamentos" ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                 <ScrollText size={16}/> Lançamentos (DRE)
               </button>
               <button onClick={() => setAbaDespesas("fornecedores")} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${abaDespesas === "fornecedores" ? "bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm" : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"}`}>
                 <Factory size={16}/> Fornecedores Omni
               </button>
            </div>
          </div>

          {/* SUB-ABA 1: LANÇAMENTOS (O DRE REAL) */}
          {abaDespesas === "lancamentos" && (
            <div className="animate-in fade-in duration-300 p-6 bg-stone-50/30 dark:bg-stone-900/10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Contas a Pagar</p>
                    <h3 className="text-2xl font-black text-stone-900 dark:text-white">R$ {despesasPendentes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400">Total Pendente</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-stone-800 p-5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Contas Pagas (Histórico)</p>
                    <h3 className="text-2xl font-black text-stone-900 dark:text-white">R$ {despesasPagas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400">Total Quitado</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6">
                  <h4 className="font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2 border-b border-stone-100 dark:border-stone-700 pb-3">
                    <Plus size={18} className="text-amber-500"/> Nova Despesa / Compra
                  </h4>
                  
                  <form onSubmit={registrarDespesa} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Fornecedor Omni (Opcional)</label>
                      <select value={formDespesa.fornecedor} onChange={e => setFormDespesa({...formDespesa, fornecedor: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:border-amber-500 font-medium">
                        <option value="">Avulso / Despesa Genérica</option>
                        {FORNECEDORES_MOCK.map(f => <option key={f.id} value={f.nome}>{f.nome}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Descrição</label>
                        <input type="text" required value={formDespesa.descricao} onChange={e => setFormDespesa({...formDespesa, descricao: e.target.value})} placeholder="Ex: Fatura Tecidos..." className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:border-amber-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Categoria</label>
                        <select value={formDespesa.categoria} onChange={e => setFormDespesa({...formDespesa, categoria: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:border-amber-500">
                          <option value="Estoque / Mercadorias">Estoque / Mercadorias</option>
                          <option value="Logística / Fretes">Logística / Fretes</option>
                          <option value="Insumos / Embalagens">Insumos / Embalagens</option>
                          <option value="Despesas Fixas">Despesas Fixas</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Valor Total (R$)</label>
                        <input type="number" step="0.01" required value={formDespesa.valor} onChange={e => setFormDespesa({...formDespesa, valor: e.target.value})} placeholder="0.00" className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-black text-amber-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">1º Vencimento</label>
                        <input type="date" required value={formDespesa.vencimento} onChange={e => setFormDespesa({...formDespesa, vencimento: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:border-amber-500" />
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-100 dark:border-stone-700">
                      <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest block mb-2">Plano de Pagamento</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between bg-white dark:bg-stone-800 px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700">
                          <span className="text-xs font-medium text-stone-500">Parcelas:</span>
                          <input type="number" min="1" max="24" value={formDespesa.parcelas} onChange={e => setFormDespesa({...formDespesa, parcelas: parseInt(e.target.value)})} className="w-12 text-center bg-transparent font-bold focus:outline-none" />
                        </div>
                        <select value={formDespesa.frequencia} onChange={e => setFormDespesa({...formDespesa, frequencia: e.target.value})} className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-bold focus:border-amber-500">
                          <option value="Mensal">Mensal</option>
                          <option value="Quinzenal">Quinzenal</option>
                          <option value="Semanal">Semanal</option>
                        </select>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-500">A 1ª parcela já foi paga?</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setFormDespesa({...formDespesa, pago: "Não"})} className={`px-3 py-1 rounded text-xs font-bold transition-all ${formDespesa.pago === "Não" ? "bg-red-100 text-red-600 border border-red-200" : "bg-stone-200 text-stone-500"}`}>Não</button>
                          <button type="button" onClick={() => setFormDespesa({...formDespesa, pago: "Sim"})} className={`px-3 py-1 rounded text-xs font-bold transition-all ${formDespesa.pago === "Sim" ? "bg-emerald-100 text-emerald-600 border border-emerald-200" : "bg-stone-200 text-stone-500"}`}>Sim, já paguei</button>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-sm py-3.5 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md active:scale-[0.98]">
                      <Save size={16} /> Salvar no Cofre Contábil
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm p-6 flex flex-col h-full max-h-[600px]">
                  <h4 className="font-black text-stone-900 dark:text-white mb-4 flex items-center gap-2 border-b border-stone-100 dark:border-stone-700 pb-3">
                    <AlertTriangle size={18} className="text-red-500"/> Quitar Contas (Dar Baixa)
                  </h4>
                  
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {DESPESAS_MOCK.filter(d => d.status === "Pendente").map(desp => (
                      <div key={desp.id} className="p-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400">{desp.categoria}</span>
                          <span className="text-xs font-bold text-red-500 flex items-center gap-1"><CalendarDays size={12}/> Vence: {desp.vencimento}</span>
                        </div>
                        <h5 className="font-bold text-stone-900 dark:text-white text-sm line-clamp-1">{desp.descricao}</h5>
                        {desp.fornecedor && <p className="text-xs text-stone-500 flex items-center gap-1 mt-1"><Factory size={10}/> {desp.fornecedor}</p>}
                        
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-lg font-black text-stone-900 dark:text-white">R$ {desp.valor.toFixed(2).replace('.', ',')}</p>
                          <button onClick={() => quitarDespesa(desp.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg text-xs font-bold transition-colors">
                            <CheckCircle2 size={14}/> Pagar
                          </button>
                        </div>
                      </div>
                    ))}
                    {DESPESAS_MOCK.filter(d => d.status === "Pendente").length === 0 && (
                      <div className="text-center py-10 opacity-50">
                         <CheckCircle2 size={40} className="mx-auto mb-2 text-emerald-500" />
                         <p className="font-bold">Tudo em dia!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-ABA 2: FORNECEDORES OMNI (B2B E I.A.) */}
          {abaDespesas === "fornecedores" && (
            <div className="animate-in fade-in duration-300">
              <div className="p-6 border-b border-stone-100 dark:border-stone-700 flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input 
                    type="text" value={buscaFornecedor} onChange={(e) => setBuscaFornecedor(e.target.value)}
                    placeholder="Buscar fornecedor por Razão Social ou CNPJ..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all text-stone-900 dark:text-white shadow-sm" 
                  />
                </div>
                <button onClick={() => setModalNovoFornecedor(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-black bg-amber-600 border-amber-600 text-white hover:bg-amber-700 transition-all shadow-md active:scale-95 shrink-0">
                  <Plus size={18} /> Cadastrar Indústria
                </button>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-stone-50 dark:bg-stone-900/50 border-b border-stone-100 dark:border-stone-700 text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-400 font-bold">
                      <th className="p-5">Razão Social & Dados</th>
                      <th className="p-5">Segmento (CNAE)</th>
                      <th className="p-5 text-center">Contato Direto</th>
                      <th className="p-5 text-center">Central de Negociação (I.A.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-700/50">
                    {fornecedoresFiltrados.length === 0 ? (
                      <tr><td colSpan={4} className="p-12 text-center text-stone-400"><Factory size={48} className="mx-auto mb-3 opacity-20" /><p className="font-bold">Nenhum fornecedor homologado.</p></td></tr>
                    ) : (
                      fornecedoresFiltrados.map((forn) => (
                        <tr key={forn.id} className="group hover:bg-stone-50 dark:hover:bg-stone-700/20 transition-colors bg-white dark:bg-stone-800">
                          <td className="p-5">
                            <p className="font-bold text-stone-900 dark:text-white flex items-center gap-2">{forn.nome}</p>
                            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 font-mono mt-0.5">CNPJ: {forn.cnpj}</p>
                          </td>
                          <td className="p-5">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                              {forn.categoria}
                            </span>
                          </td>
                          <td className="p-5 text-center">
                            <p className="text-sm font-bold text-stone-900 dark:text-white">{forn.contato}</p>
                            <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{forn.telefone}</p>
                          </td>
                          <td className="p-5 text-center">
                            <button onClick={() => abrirNegociadorB2B(forn)} className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:bg-amber-600 dark:hover:bg-amber-500 hover:text-white transition-all shadow-sm mx-auto group/btn">
                              <Handshake size={14} className="group-hover/btn:scale-110 transition-transform" /> Negociador IA
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 ABA 4: O CEO ARTIFICIAL (RELATÓRIOS PREDITIVOS) */}
      {/* ====================================================================== */}
      {abaAtiva === "ceo_ia" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-right-8 duration-500">
          <div className="xl:col-span-5 bg-white dark:bg-stone-800 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
              <BrainCircuit size={32} />
            </div>
            <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2">Conselheiro Baply A.I.</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium max-w-sm mb-8">
              A Inteligência Artificial analisa o seu Unit Economics (CAC x LTV), cruza os dados de inadimplência e sugere as melhores estratégias de Growth.
            </p>
            <button 
              onClick={gerarRelatorioCEO} disabled={analisandoDados}
              className="w-full max-w-xs flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {analisandoDados ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="group-hover:scale-110 transition-transform" />} 
              {analisandoDados ? "Calculando Unit Economics..." : "Gerar Diagnóstico"}
            </button>
          </div>

          <div className="xl:col-span-7 bg-stone-900 dark:bg-stone-950 rounded-[2rem] border border-stone-800 shadow-xl overflow-hidden flex flex-col relative min-h-[400px]">
            <div className="p-6 border-b border-stone-800 flex justify-between items-center bg-white/5 shrink-0">
              <h3 className="font-black text-white flex items-center gap-2"><FileText size={18} className="text-indigo-400" /> Relatório Executivo de Growth</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {!relatorioCEO ? (
                 <div className="h-full flex flex-col items-center justify-center text-stone-500">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm text-center">Aguardando solicitação.</p>
                 </div>
              ) : (
                <div className="text-stone-300 text-sm leading-relaxed space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div dangerouslySetInnerHTML={{ 
                    __html: relatorioCEO.replace(/\n\n/g, '</p><p className="mt-2">').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>').replace(/### (.*?)<br\/>/g, '<h3 class="text-indigo-400 text-xl font-black mt-4 mb-3">$1</h3>') 
                  }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 MODAL: NOVO CLIENTE */}
      {/* ====================================================================== */}
      {modalNovoCliente && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={fecharModalNovoCliente}></div>

          <div className="relative w-full max-w-lg bg-stone-50 dark:bg-stone-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-950 shrink-0">
              <div>
                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-500" /> Cadastrar Cliente
                </h2>
                <p className="text-sm font-medium text-stone-500">Amplie sua base central de contatos.</p>
              </div>
              <button onClick={fecharModalNovoCliente} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-5 mb-6">
                <label className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <MapPin size={14} /> Auto-Preenchimento por CEP
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ex: 01001-000" 
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all font-medium text-stone-700 dark:text-stone-300 shadow-sm"
                  />
                  <button onClick={() => toast.info("Integração com ViaCEP em breve!")} className="bg-indigo-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm shrink-0">
                    Buscar
                  </button>
                </div>
              </div>

              <form onSubmit={salvarNovoCliente} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome Completo *</label>
                  <input 
                    type="text" required
                    value={formCliente.nome} onChange={e => setFormCliente({...formCliente, nome: e.target.value})}
                    placeholder="Ex: Ana Costa" 
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white shadow-sm font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">WhatsApp *</label>
                    <input 
                      type="text" required
                      value={formCliente.telefone} onChange={e => setFormCliente({...formCliente, telefone: e.target.value})}
                      placeholder="(11) 99999-9999" 
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white shadow-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">CPF / CNPJ</label>
                    <input 
                      type="text" 
                      value={formCliente.cpf} onChange={e => setFormCliente({...formCliente, cpf: e.target.value})}
                      placeholder="000.000.000-00" 
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white shadow-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Endereço Completo</label>
                  <textarea 
                    value={formCliente.endereco} onChange={e => setFormCliente({...formCliente, endereco: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF" rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-stone-900 dark:text-white shadow-sm resize-none font-medium"
                  />
                </div>

                <button 
                  type="submit" disabled={salvandoCliente}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-lg py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {salvandoCliente ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} 
                  {salvandoCliente ? "Salvando no Cofre..." : "Salvar Cliente"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 MODAL: NEGOCIADOR DE COBRANÇA CRM 4.0 (I.A. + FIFO VISUAL) */}
      {/* ====================================================================== */}
      {modalCobranca && clienteAlvo && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={fecharModalCRM}></div>

          <div className="relative w-full max-w-lg bg-stone-50 dark:bg-stone-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-950 shrink-0">
              <div>
                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <MessageCircleHeart size={20} className="text-rose-500" /> Estúdio 360º
                </h2>
                <p className="text-sm font-medium text-stone-500">Concierge Financeiro e FIFO Automático.</p>
              </div>
              <button onClick={fecharModalCRM} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className={`border rounded-2xl p-5 relative overflow-hidden ${clienteAlvo.atraso > 0 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"}`}>
                {clienteAlvo.atraso > 0 ? (
                  <AlertTriangle size={80} className="absolute -right-4 -bottom-4 text-rose-200 dark:text-rose-900/30 opacity-50" />
                ) : (
                  <Target size={80} className="absolute -right-4 -bottom-4 text-emerald-200 dark:text-emerald-900/30 opacity-50" />
                )}
                <h3 className={`font-black mb-1 relative z-10 ${clienteAlvo.atraso > 0 ? "text-rose-900 dark:text-rose-300" : "text-emerald-900 dark:text-emerald-300"}`}>{clienteAlvo.cliente}</h3>
                <div className={`space-y-1 relative z-10 text-sm font-medium ${clienteAlvo.atraso > 0 ? "text-rose-700 dark:text-rose-400/80" : "text-emerald-700 dark:text-emerald-400/80"}`}>
                  {clienteAlvo.atraso > 0 ? (
                    <>
                      <p>Dívida Total: <strong className="text-rose-900 dark:text-rose-300 text-lg">R$ {clienteAlvo.valor_pendente.toFixed(2).replace('.', ',')}</strong></p>
                      <p>Risco: <strong className="text-red-600 dark:text-red-400 uppercase tracking-wider">{clienteAlvo.risco} ({clienteAlvo.atraso} dias)</strong></p>
                    </>
                  ) : (
                    <>
                      <p>LTV (Total Gasto): <strong className="text-emerald-900 dark:text-emerald-300 text-lg">R$ {clienteAlvo.ltv.toFixed(2).replace('.', ',')}</strong></p>
                      <p>Cashback Disponível: <strong className="text-emerald-900 dark:text-emerald-300">R$ {clienteAlvo.cashback.toFixed(2).replace('.', ',')}</strong></p>
                    </>
                  )}
                </div>
              </div>

              {/* O NOVO SISTEMA FIFO (CASCATA VISUAL) */}
              {clienteAlvo.atraso > 0 && (
                <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-4"><Landmark size={14}/> Abatimento Inteligente (FIFO)</h4>
                  
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-400 flex items-center justify-center shrink-0"><DollarSign size={16} /></div>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">R$</span>
                      <input 
                        type="number" 
                        value={valorPagamento}
                        onChange={(e) => setValorPagamento(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Valor pago pela cliente..." 
                        min="0" step="0.01"
                        className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold focus:outline-none focus:border-rose-500 text-stone-900 dark:text-white transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const faturasDaCliente = FATURAS_MOCK.filter(f => f.cliente_id === clienteAlvo.id);
                      let saldoRestante = Number(valorPagamento) || 0;

                      return faturasDaCliente.map((fat) => {
                        let valorAbatido = 0;
                        if (saldoRestante >= fat.valor) {
                          valorAbatido = fat.valor;
                          saldoRestante -= fat.valor;
                        } else if (saldoRestante > 0) {
                          valorAbatido = saldoRestante;
                          saldoRestante = 0;
                        }
                        const pct = (valorAbatido / fat.valor) * 100;
                        const isQuitada = pct === 100;

                        return (
                          <div key={fat.id} className="relative bg-stone-50 dark:bg-stone-900/50 rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out ${isQuitada ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40'}`} style={{ width: `${pct}%` }}></div>
                            <div className="relative z-10 p-3 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 dark:text-stone-400">{fat.mes} • {fat.id}</p>
                                <p className={`text-sm font-bold ${isQuitada ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-900 dark:text-white'}`}>R$ {fat.valor.toFixed(2).replace('.', ',')}</p>
                              </div>
                              <div className="text-right">
                                {valorAbatido > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-wider">- R$ {valorAbatido.toFixed(2).replace('.', ',')}</span>}
                                {isQuitada && <CheckCircle2 size={16} className="text-emerald-500 mt-1 inline-block ml-2"/>}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {Number(valorPagamento) > 0 && (
                    <button onClick={() => { toast.success("FIFO Executado! Saldo devedor atualizado e registrado no Log de Auditoria."); setValorPagamento(""); }} className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-sm py-3 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md active:scale-[0.98] mt-4">
                      <Save size={16} /> Processar Abatimento e Gerar Recibo
                    </button>
                  )}
                </div>
              )}

              {/* O ESTÚDIO DE I.A. (RÉGUA DE TOM) */}
              <div className="space-y-4 bg-indigo-50/50 dark:bg-indigo-500/5 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                <label className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BrainCircuit size={14} /> Tone Slider (I.A. Copilot)
                </label>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    <span className={tomCobranca === 1 ? "text-indigo-600 dark:text-indigo-400" : ""}>🥰 Empático</span>
                    <span className={tomCobranca === 5 ? "text-rose-600 dark:text-rose-400" : ""}>🚨 Ultimato</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" value={tomCobranca} onChange={(e) => setTomCobranca(Number(e.target.value))}
                    className="w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="text-center mt-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-stone-900 px-3 py-1 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                      {tomCobranca === 1 && "Nível 1: Super Amigável e Compreensivo"}
                      {tomCobranca === 2 && "Nível 2: Lembrete Gentil (Padrão)"}
                      {tomCobranca === 3 && "Nível 3: Profissional e Direto"}
                      {tomCobranca === 4 && "Nível 4: Firme (Foco na Quebra de Acordo)"}
                      {tomCobranca === 5 && "Nível 5: Implacável (Aviso de Bloqueio Serasa)"}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={gerarMensagemIA}
                  disabled={gerandoMensagem}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-sm py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {gerandoMensagem ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {gerandoMensagem ? "Gerando Script..." : "Escrever Mensagem e Link Dinâmico"}
                </button>
              </div>

              {/* A ÁREA DA MENSAGEM GERADA E ZAP */}
              {mensagemGerada && (
                <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-300">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex justify-between">
                    <span>Mensagem Otimizada</span>
                    <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Salva em Rascunho</span>
                  </label>
                  <textarea 
                    value={mensagemGerada}
                    onChange={(e) => setMensagemGerada(e.target.value)}
                    rows={7}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-all dark:text-white resize-none shadow-inner"
                  />
                  
                  <a 
                    href={`https://wa.me/${clienteAlvo.telefone}?text=${encodeURIComponent(mensagemGerada)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => toast.success("Redirecionando... O rascunho continua salvo se precisar voltar.")}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-black text-sm py-4 rounded-xl transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98] mt-4 group"
                  >
                    <MessageCircle size={18} className="group-hover:-translate-y-1 transition-transform" />
                    Ir para o WhatsApp
                  </a>
                  
                  <button 
                    onClick={() => {
                      toast.success("Ação arquivada no Histórico de Contatos!");
                      fecharModalCRM();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-sm py-3 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors mt-2"
                  >
                    Marcar como Contatado e Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 MODAL: NOVO FORNECEDOR (COM INTEGRAÇÃO CNPJ / BRASIL API) */}
      {/* ====================================================================== */}
      {modalNovoFornecedor && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalNovoFornecedor(false)}></div>

          <div className="relative w-full max-w-lg bg-stone-50 dark:bg-stone-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-950 shrink-0">
              <div>
                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Factory size={20} className="text-amber-500" /> Homologar Fornecedor
                </h2>
                <p className="text-sm font-medium text-stone-500">Conecte sua cadeia de suprimentos.</p>
              </div>
              <button onClick={() => setModalNovoFornecedor(false)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 mb-6">
                <label className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <SearchCode size={14} /> Auto-Preenchimento via Receita Federal
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" value={formFornecedor.cnpj} onChange={e => setFormFornecedor({...formFornecedor, cnpj: e.target.value})}
                    placeholder="Digite o CNPJ sem pontuação..." 
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-950 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all font-medium text-stone-700 dark:text-stone-300 shadow-sm"
                  />
                  <button onClick={buscarCNPJ} disabled={buscandoCnpj} className="bg-amber-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-sm shrink-0 disabled:opacity-50 flex items-center gap-2">
                    {buscandoCnpj ? <Loader2 size={16} className="animate-spin"/> : "Consultar"}
                  </button>
                </div>
              </div>

              <form onSubmit={salvarNovoFornecedor} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Razão Social / Nome Fantasia *</label>
                  <input 
                    type="text" required value={formFornecedor.nome} onChange={e => setFormFornecedor({...formFornecedor, nome: e.target.value})}
                    placeholder="Ex: Indústria Têxtil Buddemeyer S.A." 
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all text-stone-900 dark:text-white shadow-sm font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">CNAE / Categoria Fornecida</label>
                  <input 
                    type="text" value={formFornecedor.categoria} onChange={e => setFormFornecedor({...formFornecedor, categoria: e.target.value})}
                    placeholder="Ex: Confecção de roupas íntimas" 
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-600 dark:text-stone-400 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">WhatsApp Comercial</label>
                    <input 
                      type="text" value={formFornecedor.telefone} onChange={e => setFormFornecedor({...formFornecedor, telefone: e.target.value})}
                      placeholder="(00) 00000-0000" 
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all text-stone-900 dark:text-white shadow-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Nome do Representante</label>
                    <input 
                      type="text" value={formFornecedor.contato} onChange={e => setFormFornecedor({...formFornecedor, contato: e.target.value})}
                      placeholder="Ex: Carlos (Sul)" 
                      className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all text-stone-900 dark:text-white shadow-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">Endereço Fiscal / Galpão</label>
                  <textarea 
                    value={formFornecedor.endereco} onChange={e => setFormFornecedor({...formFornecedor, endereco: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF" rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all text-stone-900 dark:text-white shadow-sm resize-none font-medium"
                  />
                </div>

                <button type="submit" disabled={buscandoCnpj} className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white font-black text-lg py-4 rounded-xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/30 active:scale-[0.98] disabled:opacity-50 mt-4">
                  {buscandoCnpj ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} Salvar no Cofre B2B
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🚀 MODAL: NEGOCIADOR I.A. B2B (MÁQUINA DE DESCONTOS) */}
      {/* ====================================================================== */}
      {modalFornecedorIA && fornecedorAlvo && (
        <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setModalFornecedorIA(false)}></div>

          <div className="relative w-full max-w-md bg-stone-50 dark:bg-stone-900 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-stone-200 dark:border-stone-800">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-950 shrink-0">
              <div>
                <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                  <Handshake size={20} className="text-amber-500" /> Negociador Corporativo
                </h2>
                <p className="text-sm font-medium text-stone-500">I.A. treinada em Procurement B2B.</p>
              </div>
              <button onClick={() => setModalFornecedorIA(false)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 relative overflow-hidden">
                <Building2 size={80} className="absolute -right-4 -bottom-4 text-amber-200 dark:text-amber-900/30 opacity-50" />
                <h3 className="font-black text-amber-900 dark:text-amber-300 mb-1 relative z-10 line-clamp-1">{fornecedorAlvo.nome}</h3>
                <div className="space-y-1 relative z-10 text-sm font-medium text-amber-700 dark:text-amber-400/80">
                  <p>CNPJ: <strong className="font-mono">{fornecedorAlvo.cnpj}</strong></p>
                  <p>Representante: <strong>{fornecedorAlvo.contato}</strong></p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex items-center gap-1.5"><BrainCircuit size={14} /> Estratégia de Abordagem Corporativa</label>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setEstrategiaFornIA("desconto")} className={`py-3 px-4 rounded-xl border text-sm font-bold text-left transition-all ${estrategiaFornIA === "desconto" ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-300"}`}>
                    💸 Negociar Desconto Antecipado (PIX)
                  </button>
                  <button onClick={() => setEstrategiaFornIA("prazo")} className={`py-3 px-4 rounded-xl border text-sm font-bold text-left transition-all ${estrategiaFornIA === "prazo" ? "bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-300"}`}>
                    ⏳ Solicitar Prorrogação de Boleto
                  </button>
                  <button onClick={() => setEstrategiaFornIA("atraso")} className={`py-3 px-4 rounded-xl border text-sm font-bold text-left transition-all ${estrategiaFornIA === "atraso" ? "bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/50 text-rose-700 dark:text-rose-300" : "bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 hover:border-stone-300"}`}>
                    🚚 Reclamação Logística (Atraso de Carga)
                  </button>
                </div>
                
                <button onClick={gerarMensagemFornIA} disabled={gerandoMensagem} className="w-full flex items-center justify-center gap-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-sm py-3.5 rounded-xl hover:bg-stone-800 dark:hover:bg-white transition-all shadow-md active:scale-[0.98] disabled:opacity-50 mt-2">
                  {gerandoMensagem ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Elaborar Script B2B
                </button>
              </div>

              {msgFornecedorIA && (
                <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-300">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest flex justify-between">
                    <span>E-mail / WhatsApp Corporativo</span>
                  </label>
                  <textarea value={msgFornecedorIA} onChange={(e) => setMsgFornecedorIA(e.target.value)} rows={9} className="w-full px-4 py-3 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all dark:text-white resize-none shadow-inner" />
                  
                  <a href={`https://wa.me/${fornecedorAlvo.telefone}?text=${encodeURIComponent(msgFornecedorIA)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white font-black text-sm py-4 rounded-xl transition-all shadow-lg shadow-[#25D366]/30 active:scale-[0.98] mt-4">
                    <MessageCircle size={18} /> Enviar para o Representante
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
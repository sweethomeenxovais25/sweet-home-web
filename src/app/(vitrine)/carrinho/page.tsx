"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

export default function CarrinhoPage() {
  const { items, subtotal, atualizarQuantidade, removerItem } = useCart();

  const formatarPreco = (valor: number) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // === FASE 5: INTELIGÊNCIA DO WHATSAPP ===
  const numeroWhatsApp = "5581900000000"; // Substitua pelo número real da loja (Apenas números, com DDI e DDD)

  const finalizarPedidoWhatsApp = () => {
    if (items.length === 0) return;

    // Passo 5.2: Formatar a string elegante
    let texto = "Olá, *Sweet Home*! 🏡\nGostaria de finalizar o meu pedido:\n\n";
    
    items.forEach((item) => {
      const precoFinal = item.precoPromocional || item.preco;
      texto += `▪ ${item.quantidade}x *${item.nome}* - ${formatarPreco(precoFinal * item.quantidade)}\n`;
    });

    texto += `\n*Subtotal:* ${formatarPreco(subtotal)}`;
    texto += `\n*Frete:* A combinar`;
    texto += `\n\nAguardo as instruções para pagamento e entrega!`;

    // Passo 5.3: Gerar URL dinâmica e redirecionar
    const textoCodificado = encodeURIComponent(texto);
    const urlWa = `https://wa.me/${numeroWhatsApp}?text=${textoCodificado}`;
    
    // Abre o WhatsApp em uma nova aba
    window.open(urlWa, "_blank");
  };
  // ==========================================

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-grow">
        <h1 className="text-3xl font-bold text-brand-dark mb-8">Seu Carrinho</h1>
        <div className="bg-white shadow-sm rounded-2xl p-12 border border-brand/10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-brand-accent mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <p className="text-xl text-brand-dark mb-6">O seu carrinho está vazio no momento.</p>
          <Link href="/produtos" className="px-8 py-3 bg-brand-dark text-white rounded-full font-medium hover:bg-brand transition-colors inline-block">
            Continuar Explorando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
      <h1 className="text-3xl font-bold text-brand-dark mb-8 border-b border-brand/20 pb-6">
        Finalizar Pedido
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl shadow-sm border border-brand/10 items-center">
              <img src={item.imagem} alt={item.nome} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl" />
              
              <div className="flex-1 text-center sm:text-left w-full">
                <h3 className="text-lg font-bold text-brand-dark">{item.nome}</h3>
                <p className="text-brand-accent text-sm mt-1 uppercase tracking-wider">{item.categoria}</p>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xl font-bold text-brand-dark">
                    {formatarPreco(item.precoPromocional || item.preco)}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-full bg-gray-50">
                      <button onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)} className="px-4 py-2 text-gray-500 hover:text-brand-dark transition-colors">-</button>
                      <span className="text-sm font-bold w-8 text-center">{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)} className="px-4 py-2 text-gray-500 hover:text-brand-dark transition-colors">+</button>
                    </div>
                    <button onClick={() => removerItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand/10 h-fit sticky top-28">
          <h2 className="text-xl font-bold text-brand-dark mb-6 border-b border-brand/10 pb-4">Resumo do Pedido</h2>
          
          <div className="space-y-4 text-brand-dark mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">{formatarPreco(subtotal)}</span>
            </div>
            {/* Passo 5.1: Futuro input de Cupom pode entrar aqui */}
            <div className="flex justify-between items-center pt-2">
              <input type="text" placeholder="Cupom de desconto" className="w-full mr-2 px-3 py-2 border border-brand/20 rounded-lg text-sm focus:outline-none focus:border-brand" />
              <button className="bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand transition-colors">Aplicar</button>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-500">Frete</span>
              <span className="text-brand font-medium">A combinar</span>
            </div>
          </div>
          
          <div className="border-t border-brand/10 pt-4 mb-8 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-3xl font-extrabold text-brand-dark">{formatarPreco(subtotal)}</span>
          </div>

          {/* O Botão agora chama a nossa função inteligente */}
          <button 
            onClick={finalizarPedidoWhatsApp}
            className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#1ebe5d] transition-colors flex justify-center items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Pedir pelo WhatsApp
          </button>
          
          <p className="text-xs text-center text-brand-accent mt-4">
            Ao clicar, você será direcionado ao nosso WhatsApp com os itens do seu carrinho já listados.
          </p>
        </div>
      </div>
    </div>
  );
}
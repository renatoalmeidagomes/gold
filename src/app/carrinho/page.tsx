'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { cart, removeFromCart, config, createOrder, confirmPayment, products } = useStore();
  const [pickup, setPickup] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  // Mapear itens do carrinho para incluir detalhes dos produtos atuais
  const cartWithDetails = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    const colorIndex = product?.colors.indexOf(item.selectedColor) || 0;
    return {
      ...item,
      title: product?.title || 'Produto Removido',
      price: product?.price || 0,
      image: product?.images[colorIndex] || product?.images[0] || ''
    };
  });

  const subtotal = cartWithDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = pickup ? 0 : config.shippingFee;
  const total = subtotal + shipping;

  const handleFinalize = () => {
    const id = createOrder(pickup);
    setOrderId(id);
    setShowPix(true);
  };

  if (hasPaid) {
    return (
      <main className="min-h-screen bg-brand-black text-white"><Header /><div className="container mx-auto px-4 pt-40 pb-20 text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><i className="fa-solid fa-check text-4xl text-black"></i></div>
        <h1 className="font-heading font-black text-4xl uppercase mb-4">Sucesso!</h1>
        <p className="text-gray-400 mb-10">Pedido <span className="text-brand-gold">#{orderId}</span> recebido.</p>
        <Link href="/perfil" className="bg-brand-gold text-black font-black px-10 py-4 rounded-xl uppercase text-xs">Ver Pedidos</Link>
      </div><Footer /></main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="font-heading font-black text-3xl md:text-5xl uppercase mb-10 text-center">Meu <span className="text-brand-gold">Kit</span></h1>

        {cart.length === 0 && !showPix ? (
          <div className="text-center py-20 bg-brand-dark rounded-3xl border border-white/5">
            <i className="fa-solid fa-cart-shopping text-6xl text-gray-700 mb-6"></i>
            <p className="text-gray-400 font-bold uppercase tracking-widest mb-8">Seu carrinho está vazio.</p>
            <Link href="/#colecao" className="bg-brand-gold text-black font-black px-10 py-4 rounded-xl uppercase tracking-widest text-sm">Ver Modelos</Link>
          </div>
        ) : showPix ? (
          <div className="max-w-md mx-auto bg-brand-dark p-8 rounded-3xl border border-brand-gold/20 text-center">
            <h2 className="font-heading font-black text-xl uppercase mb-6 text-brand-gold">Pagamento PIX</h2>
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-2xl">
               <p className="text-black font-bold text-xs mb-2">Escaneie o QR Code</p>
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PIX-PAYLOAD-PLACEHOLDER`} alt="QR PIX" className="w-56 h-56" />
            </div>
            <button onClick={() => { confirmPayment(orderId!); setHasPaid(true); }} className="w-full bg-brand-gold text-black font-black py-5 rounded-2xl uppercase text-xs">JÁ PAGUEI, CONFIRMAR!</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {cartWithDetails.map((item) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="bg-brand-dark p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                  <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-xs uppercase truncate max-w-[200px]">{item.title}</h3>
                    <p className="text-[10px] text-brand-gold uppercase font-bold">{item.selectedSize} / {item.selectedColor}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="bg-brand-black px-2 py-0.5 rounded text-[10px] font-black text-gray-400 border border-white/5 uppercase">{item.quantity} UNIDADES</span>
                       <p className="text-white font-black text-xs">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(`${item.id}-${item.selectedSize}-${item.selectedColor}`)} className="text-gray-500 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash"></i></button>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 sticky top-28">
                <h2 className="font-heading font-black text-xl uppercase mb-6">Resumo</h2>
                <div className="grid grid-cols-2 gap-2 mb-8 p-1 bg-brand-black rounded-xl border border-white/5">
                  <button onClick={() => setPickup(false)} className={`py-3 rounded-lg text-[9px] font-black uppercase ${!pickup ? 'bg-brand-gold text-black' : 'text-gray-500'}`}>Entrega</button>
                  <button onClick={() => setPickup(true)} className={`py-3 rounded-lg text-[9px] font-black uppercase ${pickup ? 'bg-brand-gold text-black' : 'text-gray-500'}`}>Retirada</button>
                </div>
                <div className="space-y-4 mb-8 text-xs font-bold uppercase tracking-wider">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Frete</span><span className={pickup ? 'text-green-500' : ''}>{pickup ? 'GRÁTIS' : `R$ ${config.shippingFee.toFixed(2)}`}</span></div>
                  <div className="pt-4 border-t border-white/5 flex justify-between text-white text-lg font-black font-heading"><span>Total</span><span className="text-brand-gold">R$ {total.toFixed(2)}</span></div>
                </div>
                <button onClick={handleFinalize} className="w-full bg-brand-gold text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 transition-all">Finalizar Kit</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

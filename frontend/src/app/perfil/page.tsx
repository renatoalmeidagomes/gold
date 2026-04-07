'use client';
import React from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';

export default function ProfilePage() {
  const { currentUser, logoutUser, orders, updateOrderStatus } = useStore();
  const router = useRouter();
  const userInitial = (currentUser?.name || '').trim().charAt(0).toUpperCase() || 'U';

  if (!currentUser) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  if (currentUser.role === 'ADMIN') {
    if (typeof window !== 'undefined') router.push('/admin');
    return null;
  }

  const userOrders = orders.filter(o => o.userId === currentUser.id);

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Finalizado');
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao confirmar entrega.');
    }
  };

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="w-full md:w-1/3 bg-brand-dark p-8 rounded-3xl border border-white/5">
            <div className="w-20 h-20 rounded-full bg-brand-gold text-black flex items-center justify-center font-black text-3xl mb-6">
              {userInitial}
            </div>
            <h1 className="font-heading font-black text-2xl uppercase mb-2">{currentUser.name}</h1>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mb-8">{currentUser.email}</p>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest mb-1">WhatsApp</p>
                <p className="text-sm font-medium">{currentUser.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest mb-1">Endereco de entrega</p>
                <p className="text-sm font-medium">{currentUser.address}</p>
              </div>
            </div>

            <button onClick={() => { logoutUser(); router.push('/'); }} className="w-full mt-10 border border-white/10 text-gray-500 hover:text-white py-4 rounded-xl uppercase text-[10px] font-black tracking-widest transition-colors">
              Sair da Conta
            </button>
          </div>

          <div className="flex-1 w-full">
            <h2 className="font-heading font-black text-3xl uppercase mb-10">
              Meus <span className="text-brand-gold">Pedidos</span>
            </h2>

            {userOrders.length === 0 ? (
              <div className="p-20 bg-brand-dark rounded-3xl border border-white/5 text-center">
                <p className="text-gray-500 uppercase font-black text-xs tracking-widest">Nenhum pedido realizado ainda.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map(order => (
                  <div key={order.id} className="bg-brand-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Pedido #{order.id}</p>
                        <p className="text-xs text-white font-medium mt-1">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase">
                          Pedido: {order.status}
                        </span>
                        <span className="bg-white/5 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                          Pagamento: {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {order.paymentProof && (
                      <div className="mb-6 p-4 rounded-2xl border border-white/5 bg-brand-black/30">
                        <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest mb-3">Comprovante enviado</p>
                        <SafeImage src={order.paymentProof} alt="Comprovante do pedido" className="w-full max-w-xs rounded-xl border border-white/10" />
                      </div>
                    )}

                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <SafeImage src={item.selectedImageUrl} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-xs font-bold uppercase">{item.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{item.selectedSize} / {item.selectedColor}</p>
                          </div>
                          <p className="text-xs font-black">R$ {item.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <span className="text-xs uppercase font-bold text-gray-400">Total</span>
                        <div className="font-black text-lg text-brand-gold font-heading">R$ {order.total.toFixed(2)}</div>
                      </div>

                      {order.status === 'Entregue' && (
                        <button onClick={() => handleConfirmDelivery(order.id)} className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                          Confirmar recebimento
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

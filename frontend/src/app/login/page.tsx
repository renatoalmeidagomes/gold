'use client';
import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const { registerUser, loginUser, currentUser } = useStore();
  const router = useRouter();

  if (currentUser) {
    router.push(currentUser.role === 'ADMIN' ? '/admin' : '/perfil');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      await registerUser(formData);
      alert('Cadastro realizado! Faça login agora.');
      setIsRegister(false);
    } else {
      const isAdmin = await loginUser(formData.email, formData.password, 'ADMIN');
      if (isAdmin) {
        router.push('/admin');
        return;
      }

      const isClient = await loginUser(formData.email, formData.password, 'CLIENTE');
      if (isClient) router.push('/perfil');
      else alert('E-mail ou senha incorretos.');
    }
  };

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-20 flex justify-center">
        <div className="w-full max-w-md bg-brand-dark p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="font-heading font-black text-3xl uppercase">{isRegister ? 'Criar Conta' : 'Entrar'}</h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-2">Área do Cliente Ecommerce</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <input required type="text" placeholder="Nome Completo" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-brand-gold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            )}
            <input required type="email" placeholder="E-mail" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-brand-gold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            {isRegister && (
              <>
                <input required type="text" placeholder="WhatsApp (Ex: 33999999999)" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-brand-gold" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <input required type="text" placeholder="Endereço de Entrega" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-brand-gold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </>
            )}
            <input required type="password" placeholder="Senha" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-4 text-white outline-none focus:border-brand-gold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <button type="submit" className="w-full bg-brand-gold text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm hover:opacity-90 transition-opacity">
              {isRegister ? 'Finalizar Cadastro' : 'Acessar Conta'}
            </button>
          </form>

          <button onClick={() => setIsRegister(!isRegister)} className="w-full text-center mt-6 text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors">
            {isRegister ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastrar-se'}
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}





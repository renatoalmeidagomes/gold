'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, currentUser, config } = useStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuLinks = [
    { name: 'Início', href: '/#inicio', icon: 'fa-house' },
    { name: 'Modelos', href: '/#colecao', icon: 'fa-shirt' },
    { name: 'A Loja', href: '/#sobre', icon: 'fa-store' },
    { name: 'Contato', href: '/#contato', icon: 'fa-envelope' },
  ];

  return (
    <>
      <nav id="navbar" className={`fixed w-full z-40 transition-all duration-300 py-3 ${isScrolled ? 'bg-brand-black/95 backdrop-blur-md border-b border-white/5' : 'bg-brand-black/90 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:py-4 md:backdrop-blur-none'}`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white text-2xl focus:outline-none mr-2"><i className="fa-solid fa-bars-staggered"></i></button>
            <Link href="/" className="flex items-center gap-3 z-50">
              {config.logo ? (
                <img src={config.logo} alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <>
                  <div className="logo-fallback flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand-gold text-brand-gold font-bold bg-brand-dark">BG</div>
                  <span className="font-heading font-bold text-lg md:text-xl tracking-widest uppercase text-white">Black Gold</span>
                </>
              )}
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center font-medium text-sm absolute left-1/2 transform -translate-x-1/2">
            {menuLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-white hover:text-brand-gold transition-colors uppercase tracking-widest text-[11px] font-bold">{link.name}</Link>
            ))}
          </div>

          <div className="flex items-center gap-4 md:gap-6 z-50">
            {/* Identificação do Cliente */}
            <Link href={currentUser ? "/perfil" : "/login"} className="flex items-center gap-2 group">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${currentUser ? 'border-brand-gold bg-brand-gold/10 text-brand-gold' : 'border-white/20 text-white group-hover:border-brand-gold'}`}>
                <i className={`fa-solid ${currentUser ? 'fa-user-check' : 'fa-user'} text-xs`}></i>
              </div>
              <div className="hidden lg:block text-left leading-none">
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">{currentUser ? 'Bem-vindo' : 'Minha Conta'}</p>
                <p className="text-[10px] text-white font-bold uppercase truncate max-w-[80px]">{currentUser ? currentUser.name.split(' ')[0] : 'Entrar'}</p>
              </div>
            </Link>

            <Link href="/carrinho" className="relative text-white hover:text-brand-gold transition-all text-xl">
              <i className="fa-solid fa-cart-shopping"></i>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Menu Mobile */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 left-0 h-full w-72 bg-brand-dark z-50 transform transition-transform duration-300 md:hidden shadow-2xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center"><span className="font-heading font-bold text-sm tracking-widest uppercase text-white">Menu</span><button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white text-2xl"><i className="fa-solid fa-xmark"></i></button></div>
        <div className="flex flex-col py-6 px-6 space-y-6 font-heading font-medium text-lg uppercase">
          {menuLinks.map(link => (
            <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-brand-gold flex items-center gap-4"><i className={`fa-solid ${link.icon} w-6 text-brand-gold`}></i> {link.name}</Link>
          ))}
          <Link href={currentUser ? "/perfil" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="pt-6 border-t border-white/10 text-white flex items-center gap-4"><i className="fa-solid fa-user-circle w-6 text-brand-gold"></i> {currentUser ? 'Meu Perfil' : 'Fazer Login'}</Link>
        </div>
      </div>
    </>
  );
}

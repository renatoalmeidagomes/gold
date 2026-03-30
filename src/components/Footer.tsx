'use client';
import React from 'react';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { config } = useStore();

  return (
    <footer id="contato" className="bg-brand-black pt-16 md:pt-20 pb-24 md:pb-10 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          <div>
            <span className="font-heading font-black text-2xl tracking-widest uppercase block mb-4 text-gradient-gold">Black Gold</span>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6 font-medium uppercase tracking-wider">
              Referência em Grife e Tendências.<br />A loja 01 de Almenara - MG.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href={`https://instagram.com/${config.instagram}`} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors text-lg">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-brand-gold hover:text-brand-gold transition-colors text-lg">
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-heading font-black text-brand-gold text-xs uppercase tracking-[0.3em] mb-2">Mapa do Site</h4>
            <a href="/#inicio" className="text-gray-400 hover:text-white text-xs uppercase font-bold tracking-widest">Início</a>
            <a href="/#colecao" className="text-gray-400 hover:text-white text-xs uppercase font-bold tracking-widest">Modelos</a>
            <a href="/#sobre" className="text-gray-400 hover:text-white text-xs uppercase font-bold tracking-widest">A Loja</a>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-4">
            <h4 className="font-heading font-black text-brand-gold text-xs uppercase tracking-[0.3em] mb-2">Informações</h4>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-location-dot text-brand-gold"></i> Almenara - MG
            </p>
            <div className="mt-4 flex gap-4 text-2xl text-gray-700">
              <i className="fa-brands fa-cc-visa"></i>
              <i className="fa-brands fa-cc-mastercard"></i>
              <i className="fa-brands fa-pix"></i>
            </div>
          </div>

        </div>
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-gray-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Black Gold Almenara. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

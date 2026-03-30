import React from 'react';

export default function About() {
  return (
    <section id="sobre" className="relative py-16 md:py-24 overflow-hidden border-y border-brand-gold/10">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516826957135-700edeb5f9fa?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/90 to-transparent"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-brand-gold flex items-center justify-center bg-brand-dark text-brand-gold font-bold text-2xl">BG</div>
            <div>
              <h2 className="font-heading font-extrabold text-xl md:text-3xl uppercase tracking-tighter text-white">@blackgold_almenara</h2>
              <p className="text-brand-gold text-xs md:text-sm tracking-widest mt-1 font-bold uppercase">A LOJA 01 DE ALMENARA 🚀</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm md:text-lg mb-8 leading-relaxed font-light">
            Nascemos para elevar o padrão da moda masculina no Vale do Jequitinhonha. Trazendo as maiores tendências de grife e o estilo urbano que você vê nos grandes centros, agora disponível em Almenara.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 text-center md:text-left">
            <div>
              <p className="text-brand-gold font-black text-2xl md:text-3xl">+3k</p>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Seguidores</p>
            </div>
            <div>
              <p className="text-brand-gold font-black text-2xl md:text-3xl">100%</p>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Original</p>
            </div>
          </div>
          <a href="https://www.instagram.com/blackgold_almenara/" target="_blank" className="bg-gradient-gold text-black font-bold py-3.5 px-8 rounded-full hover:opacity-90 transition-opacity w-full sm:w-auto inline-flex items-center justify-center text-sm md:text-base shadow-xl uppercase">
            <i className="fa-brands fa-instagram text-xl mr-2"></i> Seguir no Insta
          </a>
        </div>
      </div>
    </section>
  );
}



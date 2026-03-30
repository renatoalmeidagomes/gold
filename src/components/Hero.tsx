import React from 'react';

export default function Hero() {
  return (
    <section id="inicio" className="hero-bg h-[100svh] md:min-h-screen flex flex-col justify-center relative pt-16 md:pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/40 via-transparent to-brand-black"></div>
      <div className="container mx-auto px-4 md:px-6 relative z-10 text-center flex flex-col items-center mt-10 md:mt-0">
        <span className="bg-black/50 backdrop-blur-sm border border-brand-gold/30 text-brand-gold font-medium tracking-[0.2em] uppercase text-xs px-4 py-1.5 rounded-full mb-6">01 DE ALMENARA</span>
        <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 leading-[1.1] text-white">
          SEU KIT NOVO <br />
          <span className="text-gradient-gold uppercase">ESTÁ AQUI.</span>
        </h1>
        <p className="text-gray-300 text-sm md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 font-light px-4">
          Referência em Grife e Tendências. No estilo dos melhores, com a qualidade que você exige. 🔥
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <a href="#colecao" className="bg-gradient-gold text-black font-bold py-3.5 md:py-4 px-8 md:px-10 rounded-sm hover:opacity-90 transition-opacity w-full sm:w-auto text-sm md:text-base tracking-widest uppercase text-center">Ver Catálogo</a>
        </div>
      </div>
    </section>
  );
}



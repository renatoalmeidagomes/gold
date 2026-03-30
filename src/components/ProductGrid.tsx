'use client';
import React, { useState } from 'react';
import { useStore, Product, CartItem } from '@/context/StoreContext';

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart, currentUser } = useStore();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const selectedColor = product.colors[selectedColorIndex] || 'Padrão';
  const currentImage = product.images[selectedColorIndex] || product.images[0] || '';

  const handleAddToCart = () => {
    if (!currentUser) {
      alert("Atenção: Você precisa criar uma conta ou fazer login para montar seu kit.");
      window.location.href = '/login';
      return;
    }

    const item: CartItem = {
      id: product.id,
      selectedSize,
      selectedColor,
      quantity: 1
    };

    addToCart(item);
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-10 right-10 bg-brand-gold text-black font-black px-6 py-3 rounded-lg shadow-2xl z-50 animate-bounce';
    toast.innerText = 'Adicionado ao Kit! 🛍️';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  return (
    <div className="product-card flex flex-col group">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-dark border border-white/5 shadow-2xl mb-6">
        {product.badge && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-brand-gold text-black text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg">{product.badge}</span>
          </div>
        )}
        <img src={currentImage} alt={product.title} className="w-full h-full object-cover transition-all duration-700 ease-in-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4">
          <div className="price-tag px-4 py-2 rounded-lg border border-white/10 bg-black/60 backdrop-blur-md">
            <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest mb-1">{product.category}</p>
            <p className="text-xl font-black text-white">R$ {product.price.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      <div className="px-2">
        <h3 className="font-heading font-bold text-lg uppercase tracking-tight mb-2 text-white truncate">{product.title}</h3>
        
        <div className="space-y-4">
          {product.sizes.length > 0 && (
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`w-9 h-9 text-[10px] font-black rounded-lg border transition-all ${selectedSize === size ? 'bg-brand-gold border-brand-gold text-black' : 'border-white/10 text-white hover:border-brand-gold/50'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}

          {product.colors.length > 0 && (
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-2">Cor / Estampa</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button key={color} onClick={() => setSelectedColorIndex(index)} className={`px-3 py-2 text-[9px] font-black rounded-lg border transition-all ${selectedColorIndex === index ? 'bg-white border-white text-black' : 'border-white/10 text-white hover:border-white/30'}`}>{color}</button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleAddToCart} className="w-full bg-white text-black font-black py-4 rounded-xl mt-4 flex items-center justify-center gap-2 hover:bg-brand-gold transition-colors uppercase text-xs tracking-widest">ADICIONAR AO KIT</button>
        </div>
      </div>
    </div>
  );
};

export default function ProductGrid() {
  const { products } = useStore();

  return (
    <section id="colecao" className="py-20 bg-brand-black">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="font-heading font-black text-3xl md:text-5xl uppercase mb-4 text-white">Nossos <span className="text-brand-gold">Modelos</span></h2>
          <div className="w-24 h-1 bg-brand-gold mx-auto mb-6"></div>
          <p className="text-gray-400 uppercase tracking-[0.2em] text-[10px] md:text-xs">Estilo Grife • Black Gold</p>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-gray-600 font-black uppercase text-xs tracking-widest">Nenhum produto cadastrado no catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

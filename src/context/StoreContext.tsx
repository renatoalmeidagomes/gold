'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Category = 'CAMISAS' | 'RELOGIOS' | 'TENIS' | 'CALCAS' | 'BERMUDAS';

export interface Product { id: string; title: string; description: string; price: number; category: Category; images: string[]; sizes: string[]; colors: string[]; badge?: string; }
export interface CartItem { id: string; selectedSize: string; selectedColor: string; quantity: number; }
export interface User { id: string; name: string; email: string; phone: string; address: string; password?: string; createdAt: string; }
export interface Order { id: string; userId: string; items: any[]; subtotal: number; shipping: number; total: number; date: string; status: 'Pendente' | 'Pago' | 'Entregue' | 'Cancelado'; pickup: boolean; paymentDetails?: { time: string; amount: number; method: string; }; couponApplied?: string; }

export interface Coupon {
  code: string;
  discount: number; // Porcentagem (ex: 10 para 10%)
}

interface StoreConfig { whatsapp: string; instagram: string; pixKey: string; pixReceiverName: string; pixCity: string; shippingFee: number; logo?: string; }

interface StoreContextType {
  products: Product[]; cart: CartItem[]; config: StoreConfig; users: User[]; currentUser: User | null; orders: Order[]; coupons: Coupon[];
  updateConfig: (newConfig: StoreConfig) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  registerUser: (user: User) => void;
  loginUser: (email: string, pass: string) => boolean;
  logoutUser: () => void;
  createOrder: (pickup: boolean, coupon?: Coupon) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  confirmPayment: (orderId: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  addCoupon: (c: Coupon) => void;
  removeCoupon: (code: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper para WhatsApp: Garante o 55
export const formatWhatsApp = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean.length === 11) return `55${clean}`; // Celular comum sem 55
  if (clean.length === 10) return `55${clean}`; // Fixo ou sem o 9
  return clean; // Já tem 55 ou é outro formato
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [config, setConfig] = useState<StoreConfig>({ whatsapp: '5533999999999', instagram: 'blackgold_almenara', pixKey: '', pixReceiverName: 'BLACK GOLD', pixCity: 'ALMENARA', shippingFee: 15.00, logo: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([{ code: 'GOLD10', discount: 10 }]);

  useEffect(() => {
    try {
      const saved = {
        cart: localStorage.getItem('bg-cart'),
        config: localStorage.getItem('bg-config'),
        products: localStorage.getItem('bg-products'),
        users: localStorage.getItem('bg-users'),
        orders: localStorage.getItem('bg-orders'),
        user: localStorage.getItem('bg-current-user'),
        coupons: localStorage.getItem('bg-coupons')
      };
      if (saved.cart) setCart(JSON.parse(saved.cart));
      if (saved.config) setConfig(JSON.parse(saved.config));
      if (saved.products) setProducts(JSON.parse(saved.products));
      if (saved.users) setUsers(JSON.parse(saved.users));
      if (saved.orders) setOrders(JSON.parse(saved.orders));
      if (saved.user) setCurrentUser(JSON.parse(saved.user));
      if (saved.coupons) setCoupons(JSON.parse(saved.coupons));
    } catch (e) { console.error(e); }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('bg-products', JSON.stringify(products));
      localStorage.setItem('bg-config', JSON.stringify(config));
      localStorage.setItem('bg-cart', JSON.stringify(cart));
      localStorage.setItem('bg-users', JSON.stringify(users));
      localStorage.setItem('bg-orders', JSON.stringify(orders));
      localStorage.setItem('bg-current-user', JSON.stringify(currentUser));
      localStorage.setItem('bg-coupons', JSON.stringify(coupons));
    }
  }, [products, config, cart, users, orders, currentUser, coupons, isHydrated]);

  const updateConfig = (newConfig: StoreConfig) => setConfig(newConfig);
  const addProduct = (product: Product) => setProducts(prev => [product, ...prev]);
  const updateProduct = (upd: Product) => setProducts(prev => prev.map(p => p.id === upd.id ? upd : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const registerUser = (user: User) => setUsers(prev => [...prev, user]);
  const logoutUser = () => setCurrentUser(null);
  const loginUser = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) { setCurrentUser(user); return true; }
    return false;
  };

  const createOrder = (pickup: boolean, coupon?: Coupon) => {
    if (!currentUser) return '';
    const orderItems = cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      return { ...item, title: p?.title, price: p?.price, selectedImageUrl: p?.images[0] };
    });
    let subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (coupon) subtotal = subtotal * (1 - coupon.discount / 100);
    
    const shipping = pickup ? 0 : config.shippingFee;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: currentUser.id,
      items: orderItems,
      subtotal, shipping, total: subtotal + shipping,
      date: new Date().toISOString(),
      status: 'Pendente',
      pickup,
      couponApplied: coupon?.code
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    return newOrder.id;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const confirmPayment = (id: string) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Pago', paymentDetails: { time: new Date().toLocaleTimeString(), amount: o.total, method: 'PIX' } } : o));

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === newItem.id && p.selectedSize === newItem.selectedSize && p.selectedColor === newItem.selectedColor);
      if (existing) return prev.map(p => (p === existing) ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, newItem];
    });
  };
  const removeFromCart = (cartId: string) => setCart(prev => prev.filter(p => `${p.id}-${p.selectedSize}-${p.selectedColor}` !== cartId));
  const clearCart = () => setCart([]);

  const addCoupon = (c: Coupon) => setCoupons(prev => [...prev, c]);
  const removeCoupon = (code: string) => setCoupons(prev => prev.filter(c => c.code !== code));

  return (
    <StoreContext.Provider value={{ 
      products, cart, config, users, currentUser, orders, coupons,
      updateConfig, addProduct, updateProduct, deleteProduct, registerUser, loginUser, logoutUser, createOrder, updateOrderStatus, confirmPayment, addToCart, removeFromCart, clearCart, addCoupon, removeCoupon 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};

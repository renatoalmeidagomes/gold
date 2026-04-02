'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getProductsActionV3, addProductActionV3, updateProductAction, deleteProductAction, 
  getCategoriesAction, addCategoryAction, updateCategoryAction, deleteCategoryAction,
  getConfigAction, updateConfigAction,
  registerUserAction, loginUserAction, getUsersAction,
  createOrderAction, getOrdersAction, updateOrderStatusAction, confirmPaymentAction
} from '@/app/server-actions';

export interface Category { id: string; name: string; }
export interface Product { id: string; title: string; description: string; price: number; category: string; images: string[]; sizes: string[]; colors: string[]; badge?: string; }
export interface CartItem { id: string; selectedSize: string; selectedColor: string; quantity: number; }
export interface User { id: string; name: string; email: string; phone: string; address: string; password?: string; createdAt: string; }
export interface Order { id: string; userId: string; items: any[]; subtotal: number; shipping: number; total: number; date: string; status: 'Pendente' | 'Pago' | 'Entregue' | 'Cancelado'; pickup: boolean; paymentDetails?: { time: string; amount: number; method: string; }; couponApplied?: string; }

export interface Coupon {
  code: string;
  discount: number;
}

interface StoreConfig {
  storeName: string;
  whatsapp: string;
  instagram: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  pixKey: string;
  pixReceiverName: string;
  pixCity: string;
  shippingFee: number;
  logo?: string;
}

interface StoreContextType {
  products: Product[]; categories: Category[]; cart: CartItem[]; config: StoreConfig; users: User[]; currentUser: User | null; orders: Order[]; coupons: Coupon[];
  updateConfig: (newConfig: StoreConfig) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  registerUser: (user: User) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<boolean>;
  logoutUser: () => void;
  createOrder: (pickup: boolean, coupon?: Coupon) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  confirmPayment: (orderId: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  addCoupon: (c: Coupon) => void;
  removeCoupon: (code: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const formatWhatsApp = (num: string) => {
  const clean = num.replace(/\D/g, '');
  if (clean.length === 11) return `55${clean}`;
  if (clean.length === 10) return `55${clean}`;
  return clean;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [config, setConfig] = useState<StoreConfig>({
    storeName: 'Ecommerce',
    whatsapp: '5533999999999',
    instagram: 'ecommerce_almenara',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    pixKey: '',
    pixReceiverName: 'ECOMMERCE',
    pixCity: 'ALMENARA',
    shippingFee: 15.00,
    logo: ''
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([{ code: 'ECOMMERCE10', discount: 10 }]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dbProducts, dbCategories, dbConfig, dbUsers, dbOrders] = await Promise.all([
          getProductsActionV3(),
          getCategoriesAction(),
          getConfigAction(),
          getUsersAction(),
          getOrdersAction()
        ]);
        
        setProducts(dbProducts as any);
        setCategories(dbCategories as any);
        if (dbConfig) setConfig(dbConfig as any);
        setUsers(dbUsers as any);
        setOrders(dbOrders as any);

        const saved = {
          cart: localStorage.getItem('bg-cart'),
          user: localStorage.getItem('bg-current-user'),
          coupons: localStorage.getItem('bg-coupons')
        };
        if (saved.cart) setCart(JSON.parse(saved.cart));
        if (saved.user) setCurrentUser(JSON.parse(saved.user));
        if (saved.coupons) setCoupons(JSON.parse(saved.coupons));
      } catch (e) { console.error(e); }
      setIsHydrated(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('bg-cart', JSON.stringify(cart));
      localStorage.setItem('bg-current-user', JSON.stringify(currentUser));
      localStorage.setItem('bg-coupons', JSON.stringify(coupons));
    }
  }, [cart, currentUser, coupons, isHydrated]);

  const updateConfig = async (newConfig: StoreConfig) => {
    setConfig(newConfig);
    await updateConfigAction(newConfig);
  };
  
  const addProduct = async (product: Product) => {
    const saved = await addProductActionV3(product);
    setProducts(prev => [saved as any, ...prev]);
  };

  const updateProduct = async (upd: Product) => {
    const saved = await updateProductAction(upd.id, upd);
    setProducts(prev => prev.map(p => p.id === upd.id ? saved as any : p));
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await deleteProductAction(id);
  };

  const addCategory = async (name: string) => {
    const saved = await addCategoryAction(name);
    setCategories(prev => {
      const exists = prev.some(c => c.id === (saved as any).id);
      if (exists) return prev.map(c => c.id === (saved as any).id ? (saved as any) : c);
      return [...prev, saved as any].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  const updateCategory = async (id: string, name: string) => {
    const previousName = categories.find(c => c.id === id)?.name;
    const saved = await updateCategoryAction(id, name);

    setCategories(prev =>
      prev
        .map(c => c.id === id ? (saved as any) : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    if (previousName && previousName !== (saved as any).name) {
      setProducts(prev =>
        prev.map(p =>
          p.category === previousName ? { ...p, category: (saved as any).name } : p
        )
      );
    }
  };

  const deleteCategory = async (id: string) => {
    await deleteCategoryAction(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const registerUser = async (user: User) => {
    const saved = await registerUserAction(user);
    setUsers(prev => [...prev, saved as any]);
  };

  const logoutUser = () => setCurrentUser(null);
  
  const loginUser = async (email: string, pass: string) => {
    const user = await loginUserAction(email, pass);
    if (user) { setCurrentUser(user as any); return true; }
    return false;
  };

  const createOrder = async (pickup: boolean, coupon?: Coupon) => {
    if (!currentUser) return '';
    const orderItems = cart.map(item => {
      const p = products.find(prod => prod.id === item.id);
      return { ...item, title: p?.title, price: p?.price, selectedImageUrl: p?.images[0] };
    });
    let subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (coupon) subtotal = subtotal * (1 - coupon.discount / 100);
    
    const shipping = pickup ? 0 : config.shippingFee;
    
    const orderData = {
      userId: currentUser.id,
      items: orderItems,
      subtotal, shipping, total: subtotal + shipping,
      status: 'Pendente',
      pickup,
      couponApplied: coupon?.code
    };

    const newOrder = await createOrderAction(orderData);
    setOrders(prev => [newOrder as any, ...prev]);
    setCart([]);
    return newOrder.id;
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    await updateOrderStatusAction(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const confirmPayment = async (id: string) => {
    const paymentDetails = { time: new Date().toLocaleTimeString(), amount: 0, method: 'PIX' };
    await confirmPaymentAction(id, paymentDetails);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Pago', paymentDetails } : o));
  };

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
      categories,
      updateConfig, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, registerUser, loginUser, logoutUser, createOrder, updateOrderStatus, confirmPayment, addToCart, removeFromCart, clearCart, addCoupon, removeCoupon 
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


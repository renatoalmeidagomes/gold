'use client';
import React, { useEffect, useState } from 'react';
import { useStore, Product, Category, User, Order, Coupon, formatWhatsApp } from '@/context/StoreContext';
import { uploadImageActionV3 } from '@/app/server-actions';
import SafeImage from '@/components/SafeImage';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'clients' | 'users' | 'config' | 'coupons' | 'categories'>('orders');
  
  const { config, updateConfig, products, categories, addProduct, updateProduct, deleteProduct, addCategory, updateCategory, deleteCategory, users, currentUser, createUserByAdmin, updateUserByAdmin, setUserActiveStatus, loginUser, logoutUser, orders, updateOrderStatus, confirmPayment, coupons, addCoupon, removeCoupon } = useStore();

  const [clientSearch, setClientSearch] = useState('');
  const [clientDateFilter, setClientDateFilter] = useState<'todos' | '3meses' | 'sumidos'>('todos');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [newAdminUser, setNewAdminUser] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    password: '',
    role: 'CLIENTE' as 'CLIENTE' | 'ADMIN'
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  
  // Estados para Novo Cupom
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0 });

  // Estados para Novo Produto
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Product>({
    id: '',
    title: '',
    description: '',
    price: 0,
    category: '',
    images: [''],
    sizes: [],
    colors: []
  });

  const [isEditing, setIsEditing] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const imageUrl = await uploadImageActionV3(formData);

        if (index !== undefined) {
          const imgs = [...newProduct.images];
          imgs[index] = imageUrl;
          setNewProduct({...newProduct, images: imgs});
        } else {
          updateConfig({ ...config, logo: imageUrl });
        }
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const getUserInitial = (name?: string) => (name || '').trim().charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      setIsLoggedIn(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!newProduct.category && categories.length > 0) {
      setNewProduct(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, newProduct.category]);

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.category || newProduct.images[0] === '') {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateProduct(newProduct);
        setIsEditing(false);
      } else {
        const productToAdd = { ...newProduct, id: Math.random().toString(36).substr(2, 9) };
        await addProduct(productToAdd);
      }

      setShowAddForm(false);
      setNewProduct({ id: '', title: '', description: '', price: 0, category: categories[0]?.name || '', images: [''], sizes: [], colors: [] });
      alert('Produto salvo com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar produto. Verifique sua conexão com o banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (p: Product) => {
    setNewProduct(p);
    setIsEditing(true);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      alert('Informe o nome da categoria.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, name);
      } else {
        await addCategory(name);
      }

      setNewCategoryName('');
      setEditingCategory(null);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao salvar categoria.');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Excluir categoria "${category.name}"?`)) return;

    try {
      await deleteCategory(category.id);
      if (newProduct.category === category.name) {
        setNewProduct(prev => ({ ...prev, category: categories[0]?.name || '' }));
      }
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao excluir categoria.');
    }
  };

  const handleCreateUser = async () => {
    if (!newAdminUser.name || !newAdminUser.email) {
      alert('Nome e e-mail são obrigatórios.');
      return;
    }

    if (!editingUserId && !newAdminUser.password) {
      alert('Senha é obrigatória para novo usuário.');
      return;
    }

    try {
      if (editingUserId) {
        await updateUserByAdmin(editingUserId, newAdminUser);
        alert('Usuário atualizado com sucesso.');
      } else {
        await createUserByAdmin(newAdminUser);
        alert('Usuário cadastrado com sucesso.');
      }
      setNewAdminUser({
        name: '',
        email: '',
        username: '',
        phone: '',
        address: '',
        password: '',
        role: 'CLIENTE'
      });
      setEditingUserId(null);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao salvar usuário.');
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id);
    setNewAdminUser({
      name: u.name || '',
      email: u.email || '',
      username: u.username || '',
      phone: u.phone || '',
      address: u.address || '',
      password: '',
      role: u.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleUserActive = async (u: User) => {
    const nextStatus = !(u.isActive !== false);
    const actionLabel = nextStatus ? 'reativar' : 'inativar';
    if (!confirm(`Deseja ${actionLabel} o usuário ${u.email}?`)) return;

    try {
      await setUserActiveStatus(u.id, nextStatus);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao alterar status do usuário.');
    }
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setNewAdminUser({
      name: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      password: '',
      role: 'CLIENTE'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await loginUser(user, pass, 'ADMIN');
    if (ok) {
      setIsLoggedIn(true);
      return;
    }
    alert('Credenciais inválidas ou sem permissão de administrador.');
  };

  const getClientLastPurchase = (userId: string) => {
    const userOrders = orders.filter(o => o.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return userOrders.length > 0 ? new Date(userOrders[0].date) : null;
  };

  const handleAdvanceOrderStatus = async (order: Order) => {
    const nextStatus = order.status === 'Pendente' ? 'Confirmado' : order.status === 'Confirmado' ? 'Entregue' : null;
    if (!nextStatus) return;

    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao atualizar status do pedido.');
    }
  };

  const handleConfirmPayment = async (order: Order) => {
    try {
      await confirmPayment(order.id);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Erro ao confirmar pagamento.');
    }
  };

  const filteredClients = users.filter(u => {
    if (u.role !== 'CLIENTE') return false;
    const matchesSearch = u.name.toLowerCase().includes(clientSearch.toLowerCase()) || u.email.toLowerCase().includes(clientSearch.toLowerCase());
    const lastPurchase = getClientLastPurchase(u.id);
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    if (clientDateFilter === '3meses') return matchesSearch && lastPurchase && lastPurchase >= threeMonthsAgo;
    if (clientDateFilter === 'sumidos') return matchesSearch && (!lastPurchase || lastPurchase < threeMonthsAgo);
    return matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-brand-dark p-8 rounded-2xl border border-white/5 w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full border-2 border-brand-gold flex items-center justify-center bg-brand-black overflow-hidden mx-auto mb-4">
              {config.logo ? (
                <SafeImage src={config.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-brand-gold font-bold text-2xl">BG</span>
              )}
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="E-mail ou username" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-gold" value={user} onChange={(e) => setUser(e.target.value)} />
              <input type="password" placeholder="Senha" className="w-full bg-brand-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-gold" value={pass} onChange={(e) => setPass(e.target.value)} />
              <button type="submit" className="w-full bg-brand-gold text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm">Entrar</button>
            </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-brand-dark border-r border-white/5 p-6 space-y-2">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-full border border-brand-gold flex items-center justify-center bg-brand-black overflow-hidden">
            {config.logo ? (
              <SafeImage src={config.logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-brand-gold font-bold text-xs">BG</span>
            )}
          </div>
          <span className="font-heading font-bold text-sm tracking-widest uppercase text-white tracking-[0.2em]">Admin Ecommerce</span>
        </div>
        <nav className="space-y-1">
          <button onClick={() => { setActiveTab('orders'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'orders' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-receipt"></i> <span className="text-xs font-bold uppercase tracking-widest">Pedidos</span></button>
          <button onClick={() => { setActiveTab('clients'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'clients' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-users"></i> <span className="text-xs font-bold uppercase tracking-widest">Clientes</span></button>
          <button onClick={() => { setActiveTab('users'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'users' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-user-shield"></i> <span className="text-xs font-bold uppercase tracking-widest">Usuários</span></button>
          <button onClick={() => { setActiveTab('coupons'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'coupons' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-ticket"></i> <span className="text-xs font-bold uppercase tracking-widest">Cupons</span></button>
          <button onClick={() => { setActiveTab('categories'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'categories' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-tags"></i> <span className="text-xs font-bold uppercase tracking-widest">Categorias</span></button>
          <button onClick={() => { setActiveTab('products'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'products' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-box"></i> <span className="text-xs font-bold uppercase tracking-widest">Produtos</span></button>
          <button onClick={() => { setActiveTab('config'); setSelectedClient(null); }} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'config' ? 'bg-brand-gold text-black' : 'text-gray-400 hover:bg-white/5'}`}><i className="fa-solid fa-gears"></i> <span className="text-xs font-bold uppercase tracking-widest">Configurações</span></button>
        </nav>
        <button onClick={() => { logoutUser(); setIsLoggedIn(false); }} className="mt-8 w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-gray-400 hover:bg-white/5"><i className="fa-solid fa-right-from-bracket"></i> <span className="text-xs font-bold uppercase tracking-widest">Sair</span></button>
      </aside>

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="space-y-8">
            <h2 className="font-heading font-black text-3xl uppercase text-white">Usuários</h2>
            <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 space-y-4 max-w-4xl">
              <h3 className="text-brand-gold font-black text-[10px] uppercase tracking-widest">{editingUserId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={newAdminUser.name} onChange={e => setNewAdminUser({ ...newAdminUser, name: e.target.value })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs" placeholder="Nome" />
                <input value={newAdminUser.email} onChange={e => setNewAdminUser({ ...newAdminUser, email: e.target.value })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs" placeholder="E-mail" />
                <input value={newAdminUser.phone} onChange={e => setNewAdminUser({ ...newAdminUser, phone: e.target.value })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs" placeholder="WhatsApp" />
                <input value={newAdminUser.address} onChange={e => setNewAdminUser({ ...newAdminUser, address: e.target.value })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs" placeholder="Endereço" />
                <input value={newAdminUser.password} onChange={e => setNewAdminUser({ ...newAdminUser, password: e.target.value })} type="password" className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs" placeholder={editingUserId ? "Senha (deixe em branco para manter)" : "Senha"} />
                <select value={newAdminUser.role} onChange={e => setNewAdminUser({ ...newAdminUser, role: e.target.value as 'CLIENTE' | 'ADMIN', username: e.target.value === 'CLIENTE' ? '' : newAdminUser.username })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs uppercase font-black">
                  <option value="CLIENTE">Cliente</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {newAdminUser.role === 'ADMIN' && (
                  <input value={newAdminUser.username} onChange={e => setNewAdminUser({ ...newAdminUser, username: e.target.value })} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs md:col-span-2" placeholder="Username do Admin (opcional, se vazio usa o e-mail)" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleCreateUser} className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest">{editingUserId ? 'Salvar alterações' : 'Cadastrar usuário'}</button>
                {editingUserId && (
                  <button onClick={resetUserForm} className="bg-white/5 text-white font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest">Cancelar edição</button>
                )}
              </div>
            </div>

            <div className="bg-brand-dark rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] text-brand-gold uppercase font-black">
                  <tr><th className="p-6">Nome</th><th className="p-6">Tipo</th><th className="p-6">Status</th><th className="p-6">E-mail</th><th className="p-6">Username</th><th className="p-6 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 uppercase font-bold text-xs">{u.name}</td>
                      <td className="p-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white'}`}>{u.role}</span></td>
                      <td className="p-6"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${u.isActive !== false ? 'bg-green-600 text-white' : 'bg-red-700 text-white'}`}>{u.isActive !== false ? 'ATIVO' : 'INATIVO'}</span></td>
                      <td className="p-6 text-xs text-white">{u.email}</td>
                      <td className="p-6 text-xs text-gray-300">{u.username || '-'}</td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => handleEditUser(u)} className="bg-white/5 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-brand-gold hover:text-black">Editar</button>
                        <button onClick={() => handleToggleUserActive(u)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase ${u.isActive !== false ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-green-700 text-white hover:bg-green-600'}`}>{u.isActive !== false ? 'Inativar' : 'Reativar'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {activeTab === 'clients' && !selectedClient && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h2 className="font-heading font-black text-3xl uppercase text-white">Clientes</h2>
              <div className="flex bg-brand-dark p-1 rounded-xl border border-white/5">
                <button onClick={() => setClientDateFilter('todos')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${clientDateFilter === 'todos' ? 'bg-brand-gold text-black' : 'text-gray-500'}`}>Todos</button>
                <button onClick={() => setClientDateFilter('3meses')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${clientDateFilter === '3meses' ? 'bg-brand-gold text-black' : 'text-gray-500'}`}>Últimos 3 Meses</button>
                <button onClick={() => setClientDateFilter('sumidos')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${clientDateFilter === 'sumidos' ? 'bg-brand-gold text-black' : 'text-gray-500'}`}>Sumidos (+3m)</button>
              </div>
            </div>
            <input type="text" placeholder="Buscar cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="w-full bg-brand-dark border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-brand-gold transition-all" />
            <div className="bg-brand-dark rounded-3xl border border-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-[10px] text-brand-gold uppercase font-black">
                  <tr><th className="p-6">Nome</th><th className="p-6">Última Compra</th><th className="p-6">WhatsApp</th><th className="p-6 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 uppercase font-bold text-xs">{u.name}</td>
                      <td className="p-6 text-[10px] font-black text-gray-500 uppercase">{getClientLastPurchase(u.id)?.toLocaleDateString() || 'Nunca comprou'}</td>
                      <td className="p-6">
                        <a href={`https://wa.me/${formatWhatsApp(u.phone)}`} target="_blank" className="text-green-500 hover:text-green-400 flex items-center gap-2 font-black text-[10px] uppercase">
                          <i className="fa-brands fa-whatsapp text-lg"></i> {u.phone}
                        </a>
                      </td>
                      <td className="p-6 text-right"><button onClick={() => setSelectedClient(u)} className="bg-white/5 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-brand-gold hover:text-black">Ver Histórico</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <h2 className="font-heading font-black text-3xl uppercase text-white">Cupons de Desconto</h2>
            <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 max-w-md">
              <h3 className="text-brand-gold font-black text-[10px] uppercase tracking-widest mb-6">Criar Novo Cupom</h3>
              <div className="space-y-4">
                <input placeholder="CÓDIGO (EX: BLACK10)" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none focus:border-brand-gold uppercase font-bold" />
                <input type="number" placeholder="% DE DESCONTO" value={newCoupon.discount || ''} onChange={e => setNewCoupon({...newCoupon, discount: parseInt(e.target.value)})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none focus:border-brand-gold" />
                <button onClick={() => { if(newCoupon.code && newCoupon.discount) { addCoupon(newCoupon); setNewCoupon({code:'', discount:0}); } }} className="w-full bg-brand-gold text-black font-black py-4 rounded-xl uppercase text-xs">Ativar Cupom</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map(c => (
                <div key={c.code} className="bg-brand-dark p-6 rounded-2xl border border-brand-gold/20 flex justify-between items-center">
                  <div><p className="text-brand-gold font-black text-lg">{c.code}</p><p className="text-[10px] text-gray-500 font-bold uppercase">{c.discount}% DE DESCONTO</p></div>
                  <button onClick={() => removeCoupon(c.code)} className="text-red-500 hover:text-red-400 p-2"><i className="fa-solid fa-trash"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <h2 className="font-heading font-black text-3xl uppercase text-white">Categorias</h2>
            <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 max-w-xl space-y-4">
              <h3 className="text-brand-gold font-black text-[10px] uppercase tracking-widest">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <div className="flex gap-3">
                <input
                  placeholder="NOME DA CATEGORIA"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold uppercase font-bold text-xs"
                />
                <button onClick={handleSaveCategory} className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                  {editingCategory ? 'Atualizar' : 'Salvar'}
                </button>
                {editingCategory && (
                  <button onClick={() => { setEditingCategory(null); setNewCategoryName(''); }} className="bg-white/5 text-white font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-brand-dark p-6 rounded-2xl border border-brand-gold/20 flex justify-between items-center gap-4">
                  <p className="text-brand-gold font-black text-sm uppercase">{c.name}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditCategory(c)} className="bg-white/5 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-brand-gold hover:text-black">Editar</button>
                    <button onClick={() => handleDeleteCategory(c)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-500">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FICHA CLIENTE */}
        {activeTab === 'clients' && selectedClient && (
          <div className="space-y-8">
            <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-white uppercase text-[9px] font-black flex items-center gap-2"><i className="fa-solid fa-arrow-left"></i> Voltar</button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 text-center">
                <div className="w-20 h-20 rounded-full bg-brand-gold text-black flex items-center justify-center font-black text-3xl mx-auto mb-6">{getUserInitial(selectedClient.name)}</div>
                <h3 className="font-heading font-black text-xl uppercase text-white mb-2">{selectedClient.name}</h3>
                <p className="text-gray-500 text-[10px] font-bold mb-8">{selectedClient.email}</p>
                <div className="text-left space-y-4 border-t border-white/5 pt-6">
                  <p className="text-[9px] text-brand-gold font-black uppercase">Endereço</p><p className="text-xs text-white leading-relaxed">{selectedClient.address}</p>
                </div>
                <a href={`https://wa.me/${formatWhatsApp(selectedClient.phone)}`} target="_blank" className="w-full mt-10 bg-green-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] uppercase hover:bg-green-500 transition-all"><i className="fa-brands fa-whatsapp text-lg"></i> Chamar no Whats</a>
              </div>
              <div className="md:col-span-2 space-y-6">
                <h4 className="font-heading font-black text-xl uppercase text-white">Histórico Total</h4>
                {orders.filter(o => o.userId === selectedClient.id).map(order => (
                  <div key={order.id} className="bg-brand-dark p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-brand-gold uppercase">Pedido #{order.id} • {new Date(order.date).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <span className="text-[9px] font-black uppercase text-white">{order.status}</span>
                        <span className="text-[9px] font-black uppercase text-gray-400">{order.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex items-center gap-2 bg-brand-black p-2 rounded-lg border border-white/5"><SafeImage src={it.selectedImageUrl} className="w-8 h-8 rounded object-cover" /><p className="text-[9px] text-white font-bold uppercase">{it.title} ({it.selectedSize})</p></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ... Pedidos, Produtos e Config mantidos ... */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="font-heading font-black text-3xl uppercase text-white mb-8">Pedidos</h2>
            {orders.map(order => {
              const client = users.find(u => u.id === order.userId);
              const canConfirmOrder = order.status === 'Pendente';
              const canMarkDelivered = order.status === 'Confirmado';
              const canConfirmPayment = order.paymentStatus === 'Aguardando confirmacao';
              return (
                <div key={order.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center font-black text-black">{getUserInitial(client?.name)}</div>
                      <div>
                        <h4 className="text-white font-bold uppercase text-xs">{client?.name || 'Cliente'}</h4>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">#{order.id} • {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a href={`https://wa.me/${formatWhatsApp(client?.phone || '')}`} target="_blank" className="text-green-500 hover:text-green-400 transition-colors"><i className="fa-brands fa-whatsapp text-lg"></i></a>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-brand-gold/10 text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase">Pedido: {order.status}</span>
                      <span className="bg-white/5 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Pagamento: {order.paymentStatus}</span>
                    </div>

                    {order.paymentProof && (
                      <div className="mb-4">
                        <p className="text-[10px] text-brand-gold font-black uppercase tracking-widest mb-2">Comprovante PIX</p>
                        <SafeImage src={order.paymentProof} alt="Comprovante PIX" className="w-full max-w-xs rounded-xl border border-white/10" />
                      </div>
                    )}

                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 mb-2">
                        <SafeImage src={item.selectedImageUrl} className="w-8 h-8 rounded object-cover" />
                        <span className="text-[10px] text-white font-bold uppercase">{item.title} (x{item.quantity}) - {item.selectedSize}</span>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div className="text-right md:text-left font-black text-brand-gold text-xs uppercase">Total: R$ {order.total.toFixed(2)}</div>
                      <div className="flex flex-wrap gap-2">
                        {canConfirmPayment && (
                          <button onClick={() => handleConfirmPayment(order)} className="bg-green-600 text-white font-black px-4 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                            Confirmar pagamento
                          </button>
                        )}
                        {canConfirmOrder && (
                          <button onClick={() => handleAdvanceOrderStatus(order)} className="bg-brand-gold text-black font-black px-4 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                            Confirmar pedido
                          </button>
                        )}
                        {canMarkDelivered && (
                          <button onClick={() => handleAdvanceOrderStatus(order)} className="bg-blue-600 text-white font-black px-4 py-3 rounded-xl uppercase text-[10px] tracking-widest">
                            Marcar como entregue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="font-heading font-black text-3xl uppercase text-white mb-8">Configurações</h2>
            <div className="bg-brand-dark p-8 rounded-3xl border border-white/5 space-y-6">
              <div>
                <label className="text-[10px] text-brand-gold font-black uppercase tracking-widest block mb-4">Logo da Loja</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl border border-white/10 bg-brand-black flex items-center justify-center overflow-hidden">
                    {config.logo ? <SafeImage src={config.logo} className="w-full h-full object-contain" /> : <i className="fa-solid fa-image text-gray-700 text-2xl"></i>}
                  </div>
                  <label className="bg-white/5 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-brand-gold hover:text-black transition-all">
                    Alterar Logo
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                  </label>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <input value={config.storeName || ''} onChange={e => updateConfig({...config, storeName: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold uppercase" placeholder="Nome da Empresa" />
                <input value={config.instagram || ''} onChange={e => updateConfig({...config, instagram: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Instagram (usuario ou @usuario)" />
                <input value={config.addressLine1 || ''} onChange={e => updateConfig({...config, addressLine1: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Endereço - Linha 1" />
                <input value={config.addressLine2 || ''} onChange={e => updateConfig({...config, addressLine2: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Endereço - Linha 2" />
                <input value={config.addressLine3 || ''} onChange={e => updateConfig({...config, addressLine3: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Endereço - Linha 3" />
                <input value={config.whatsapp} onChange={e => updateConfig({...config, whatsapp: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="WhatsApp (Ex: 5533999999999)" />
                <input value={config.pixKey} onChange={e => updateConfig({...config, pixKey: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Chave PIX" />
                <input value={config.pixReceiverName} onChange={e => updateConfig({...config, pixReceiverName: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Nome Recebedor" />
                <input value={config.pixCity} onChange={e => updateConfig({...config, pixCity: e.target.value})} className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs font-bold" placeholder="Cidade" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-black text-3xl uppercase text-white">Produtos</h2>
              <button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="bg-brand-gold text-black font-black px-6 py-3 rounded-xl uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <i className={`fa-solid ${showAddForm ? 'fa-xmark' : 'fa-plus'}`}></i>
                {showAddForm ? 'Cancelar' : 'Novo Produto'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-brand-dark p-8 rounded-3xl border border-brand-gold/20 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-brand-gold font-black text-xs uppercase tracking-[0.2em]">{isEditing ? 'Editando Produto' : 'Novo Produto'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] text-brand-gold font-black uppercase tracking-widest">Informações Básicas</label>
                    <input 
                      placeholder="NOME DO PRODUTO" 
                      value={newProduct.title} 
                      onChange={e => setNewProduct({...newProduct, title: e.target.value})} 
                      className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold uppercase font-bold text-xs" 
                    />
                    <textarea 
                      placeholder="DESCRIÇÃO" 
                      value={newProduct.description} 
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                      className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold text-xs h-32" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        placeholder="PREÇO (R$)" 
                        value={newProduct.price || ''} 
                        onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} 
                        className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold" 
                      />
                      <select 
                        value={newProduct.category} 
                        onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                        className="w-full bg-brand-black p-4 rounded-xl text-white outline-none border border-white/5 focus:border-brand-gold uppercase font-black text-[10px]"
                      >
                        {categories.length === 0 && <option value="">Cadastre uma categoria antes</option>}
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] text-brand-gold font-black uppercase tracking-widest">Imagens do Produto</label>
                    <div className="grid grid-cols-2 gap-4">
                      {newProduct.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-2xl border border-white/5 bg-brand-black overflow-hidden flex items-center justify-center group">
                          {img ? (
                            <>
                              <SafeImage src={img} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => {
                                  const imgs = newProduct.images.filter((_, i) => i !== idx);
                                  setNewProduct({...newProduct, images: imgs.length ? imgs : ['']});
                                }} 
                                className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
                              <i className="fa-solid fa-cloud-arrow-up text-gray-700 text-2xl mb-2"></i>
                              <span className="text-[8px] text-gray-500 font-black uppercase">Upload</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, idx)} />
                            </label>
                          )}
                        </div>
                      ))}
                      {newProduct.images.length < 4 && newProduct.images[newProduct.images.length - 1] !== '' && (
                        <button 
                          onClick={() => setNewProduct({...newProduct, images: [...newProduct.images, '']})}
                          className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-700 hover:border-brand-gold/30 hover:text-brand-gold transition-all"
                        >
                          <i className="fa-solid fa-plus text-xl mb-2"></i>
                          <span className="text-[8px] font-black uppercase">Mais Foto</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-4">
                      <label className="text-[10px] text-brand-gold font-black uppercase tracking-widest block mb-4">Tamanhos Disponíveis</label>
                      <div className="flex flex-wrap gap-2">
                        {['P', 'M', 'G', 'GG', 'XG', '34', '36', '38', '40', '42', '44'].map(size => (
                          <button 
                            key={size}
                            onClick={() => {
                              const sizes = newProduct.sizes.includes(size) 
                                ? newProduct.sizes.filter(s => s !== size) 
                                : [...newProduct.sizes, size];
                              setNewProduct({...newProduct, sizes});
                            }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black border transition-all ${newProduct.sizes.includes(size) ? 'bg-brand-gold border-brand-gold text-black' : 'bg-transparent border-white/10 text-gray-500'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAddProduct}
                  disabled={isSaving}
                  className={`w-full font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all shadow-xl ${isSaving ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-brand-gold text-black hover:scale-[1.02] shadow-brand-gold/10'}`}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Processando...
                    </span>
                  ) : (
                    isEditing ? 'Salvar Alterações' : 'Salvar Produto na Loja'
                  )}
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-brand-dark group rounded-2xl border border-white/5 overflow-hidden hover:border-brand-gold/30 transition-all">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <SafeImage src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 p-4">
                      <button onClick={() => startEdit(p)} className="w-full bg-brand-gold text-black font-black py-2 rounded-lg text-[9px] uppercase hover:scale-105 transition-transform">Editar Produto</button>
                      <button onClick={() => deleteProduct(p.id)} className="w-full bg-red-600 text-white font-black py-2 rounded-lg text-[9px] uppercase hover:scale-105 transition-transform">Excluir Produto</button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[8px] text-brand-gold font-black uppercase mb-1">{p.category}</p>
                    <h4 className="text-white font-bold text-[10px] truncate uppercase">{p.title}</h4>
                    <p className="text-white font-black text-xs mt-2">R$ {p.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}








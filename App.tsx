
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, X, ChevronRight, Package, Star, Zap, Trash2, 
  LayoutDashboard, Settings, Database, Users, BarChart3, ArrowUpRight, 
  Sparkles, Send, Check, Plus, Filter, LogOut, Shield, Info, Briefcase,
  Phone, Menu, Eye, AlertCircle, TrendingUp, Clock, CreditCard
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MOCK_PRODUCTS, INITIAL_ORDERS } from './constants';
import { Product, CartItem, ViewState, Order, Variant, ShopApplication, User } from './types';
import { generateProcurementAdvice } from './services/geminiService';

// --- Local Storage Helpers ---
const DB_KEYS = {
  PRODUCTS: 'bbd_db_products',
  ORDERS: 'bbd_db_orders',
  VENDORS: 'bbd_db_vendors',
  USER: 'bbd_db_user_v3'
};

const saveToDB = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const loadFromDB = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const LOGO_SRC = "https://i.ibb.co/VWV0pWp/buying-bd-logo.png";

const WhatsAppFAB = () => (
  <a
    href="https://wa.me/8801338353169"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-8 right-8 h-14 w-14 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-[60] group border-4 border-white"
  >
    <Phone className="h-6 w-6" />
    <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">
      সরাসরি যোগাযোগ করুন
    </span>
  </a>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-500">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-8 overflow-y-auto max-h-[85vh]">{children}</div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; onAddToCart: (item: CartItem) => void }> = ({ product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {product.isHot && <span className="absolute top-4 left-4 bg-orange-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest">হট</span>}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest">{product.region}</div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight text-sm md:text-base">{product.name}</h3>
          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black">{product.rating}</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 font-medium">{product.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {product.variants.map(v => (
            <button 
              key={v.id} 
              onClick={() => setSelectedVariant(v)}
              className={`px-3 py-1.5 text-[9px] font-black rounded-lg border-2 transition-all ${selectedVariant.id === v.id ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-100 text-slate-500 hover:border-indigo-100'}`}
            >
              {v.name}
            </button>
          ))}
        </div>
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="text-xl font-black text-slate-900">${(selectedVariant.discountPrice || selectedVariant.price).toFixed(2)}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">সেলার: {product.vendorName}</div>
          </div>
          <button 
            onClick={() => onAddToCart({
              productId: product.id, variantId: selectedVariant.id, name: product.name,
              variantName: selectedVariant.name, price: selectedVariant.discountPrice || selectedVariant.price,
              quantity: 1, image: product.image
            })}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setProducts(loadFromDB(DB_KEYS.PRODUCTS) || MOCK_PRODUCTS);
    setOrders(loadFromDB(DB_KEYS.ORDERS) || INITIAL_ORDERS);
    setApplications(loadFromDB(DB_KEYS.VENDORS) || []);
    setCurrentUser(loadFromDB(DB_KEYS.USER));
  }, []);

  useEffect(() => saveToDB(DB_KEYS.PRODUCTS, products), [products]);
  useEffect(() => saveToDB(DB_KEYS.ORDERS, orders), [orders]);
  useEffect(() => saveToDB(DB_KEYS.VENDORS, applications), [applications]);
  useEffect(() => saveToDB(DB_KEYS.USER, currentUser), [currentUser]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const recommendedProducts = products.filter(p => p.rating >= 4.8 || p.isRecommended).slice(0, 4);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (email === 'admin@buyingbd.com' && password === 'admin123') {
      const admin: User = { id: 'admin-0', email, role: 'admin', name: 'Root Admin' };
      setCurrentUser(admin);
      setIsLoginModalOpen(false);
      setView(ViewState.ADMIN);
      return;
    }

    const user: User = { id: Math.random().toString(), email, role: 'customer', name: email.split('@')[0] };
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView(ViewState.HOME);
    setIsAdminSidebarOpen(false);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === item.productId && i.variantId === item.variantId);
      if (exists) return prev.map(i => (i.productId === item.productId && i.variantId === item.variantId) ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, item];
    });
    setView(ViewState.CART);
  };

  const submitVendorApp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newApp: ShopApplication = {
      id: `APP-${Date.now()}`,
      fullName: fd.get('fullName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      shopName: fd.get('shopName') as string,
      businessCategory: fd.get('category') as string,
      description: fd.get('description') as string,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };
    setApplications([newApp, ...applications]);
    setIsShopModalOpen(false);
    alert('আবেদনটি পর্যালোচনার জন্য জমা দেওয়া হয়েছে!');
  };

  const handleAiAsk = async () => {
    if (!aiQuery.trim() || isAiLoading) return;
    const q = aiQuery;
    setAiQuery('');
    setAiHistory(prev => [...prev, { role: 'user', text: q }]);
    setIsAiLoading(true);
    const advice = await generateProcurementAdvice(q);
    setAiHistory(prev => [...prev, { role: 'ai', text: advice }]);
    setIsAiLoading(false);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const processOrder = () => {
    const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toLocaleDateString('bn-BD'),
      total,
      status: 'Pending',
      items: [...cart],
      paymentMethod: 'Corporate Credit',
      billingName: currentUser?.name || 'Guest Enterprise',
      billingEmail: currentUser?.email || 'guest@enterprise.bd'
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setView(ViewState.ORDER_SUCCESS);
  };

  if (view === ViewState.ADMIN && currentUser?.role === 'admin') {
    const chartData = [
      { name: 'সোম', revenue: 4000 },
      { name: 'মঙ্গল', revenue: 3000 },
      { name: 'বুধ', revenue: 2000 },
      { name: 'বৃহস্পতি', revenue: 2780 },
      { name: 'শুক্র', revenue: 1890 },
      { name: 'শনি', revenue: 2390 },
      { name: 'রবি', revenue: 3490 },
    ];

    return (
      <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row animate-in fade-in duration-300">
        <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center text-white sticky top-0 z-[60]">
          <div className="flex items-center space-x-2">
            <Shield className="text-indigo-500 h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest">সিস্টেম প্যানেল</span>
          </div>
          <button onClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}><Menu className="h-6 w-6" /></button>
        </div>

        <aside className={`${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform w-full md:w-64 bg-slate-900 p-6 flex flex-col fixed md:sticky h-screen z-50 overflow-y-auto`}>
          <div className="hidden md:flex items-center space-x-3 mb-12">
            <Shield className="text-indigo-500 h-6 w-6" />
            <span className="text-white font-black tracking-tighter uppercase">অ্যাডমিন হাব</span>
          </div>
          <nav className="flex-grow space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'সারসংক্ষেপ' },
              { id: 'inventory', icon: Database, label: 'ইনভেন্টরি' },
              { id: 'orders', icon: CreditCard, label: 'লেনদেন তালিকা' },
              { id: 'vendors', icon: Users, label: 'পার্টনার রিকোয়েস্ট' },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => { setAdminTab(tab.id); setIsAdminSidebarOpen(false); }}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${adminTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-white/5'}`}
              >
                <tab.icon className="h-4 w-4 mr-3" /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="pt-6 border-t border-white/5 space-y-2">
            <button onClick={() => setView(ViewState.HOME)} className="w-full flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase text-slate-400 hover:text-white transition-colors">
              <ArrowUpRight className="h-4 w-4 mr-3" /> মেইন সাইট
            </button>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase text-slate-500 hover:text-red-400">
              <LogOut className="h-4 w-4 mr-3" /> সাইন আউট
            </button>
          </div>
        </aside>

        <main className="flex-grow p-4 md:p-12 overflow-x-hidden">
          <header className="mb-10">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
              {adminTab === 'dashboard' ? 'পারফরম্যান্স হাব' : adminTab === 'inventory' ? 'ক্যাটালগ কন্ট্রোল' : adminTab === 'orders' ? 'অর্থনৈতিক লেনদেন' : 'পার্টনার নেটওয়ার্ক'}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">অ্যাডমিনিস্ট্রেশন • বাইয়িং বিডি</p>
          </header>

          {adminTab === 'dashboard' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'মোট বিক্রয়', val: `$${orders.reduce((a, b) => a + b.total, 0).toLocaleString()}`, icon: BarChart3, trend: '+১২%', color: 'indigo' },
                  { label: 'সক্রিয় পণ্য', val: products.length, icon: Database, trend: '+৪', color: 'amber' },
                  { label: 'নতুন আবেদন', val: applications.filter(a => a.status === 'Pending').length, icon: Clock, trend: 'পেন্ডিং', color: 'rose' },
                  { label: 'সিস্টেম হেলথ', val: '১০০%', icon: TrendingUp, trend: 'অনলাইন', color: 'emerald' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className={`h-10 w-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-4`}><s.icon className="h-5 w-5"/></div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{s.label}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900">{s.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-8">রাজস্ব রিপোর্ট (৭ দিন)</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {adminTab === 'inventory' && (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-black uppercase tracking-widest text-sm">ইনভেন্টরি লিস্ট</h2>
                <button onClick={() => setIsNewAssetModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> নতুন ডিজিটাল অ্যাসেট
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">পণ্যের নাম</th>
                      <th className="px-6 py-4">ক্যাটাগরি</th>
                      <th className="px-6 py-4">রেটিং</th>
                      <th className="px-6 py-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-700">
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 flex items-center">
                          <img src={p.image} className="h-10 w-10 rounded-xl mr-4 object-cover" />
                          <div>
                            <div className="font-black text-slate-900">{p.name}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-tight">ভেন্ডর: {p.vendorName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] uppercase font-black">{p.category}</span>
                        </td>
                        <td className="px-6 py-5 flex items-center text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500 mr-1"/> {p.rating}
                        </td>
                        <td className="px-6 py-5">
                          <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100"><h2 className="font-black uppercase tracking-widest text-sm">লেনদেন ট্র্যাকার</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">আইডি</th>
                      <th className="px-6 py-4">ক্লায়েন্ট</th>
                      <th className="px-6 py-4">মূল্য</th>
                      <th className="px-6 py-4">স্ট্যাটাস</th>
                      <th className="px-6 py-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold">
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-slate-50">
                        <td className="px-6 py-5 text-slate-400 font-black">#{o.id}</td>
                        <td className="px-6 py-5">
                          <div className="text-slate-900">{o.billingName}</div>
                          <div className="text-[9px] text-slate-400">{o.billingEmail}</div>
                        </td>
                        <td className="px-6 py-5 font-black text-indigo-600">${o.total.toFixed(2)}</td>
                        <td className="px-6 py-5">
                          <select 
                            value={o.status} 
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                            className="bg-slate-50 text-[9px] font-black uppercase p-2 rounded-xl outline-none cursor-pointer"
                          >
                            <option value="Pending">পেন্ডিং</option>
                            <option value="Completed">সম্পন্ন</option>
                            <option value="Refunded">রিফান্ডেড</option>
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <button onClick={() => setSelectedOrder(o)} className="text-indigo-600 hover:underline flex items-center text-[10px] uppercase font-black"><Eye className="h-4 w-4 mr-1"/> ডিটেইলস</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'vendors' && (
            <div className="space-y-6">
              <h2 className="font-black uppercase tracking-widest text-sm">পার্টনার রিকোয়েস্ট</h2>
              {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                  <p className="font-black uppercase text-slate-400 text-xs">কোনো পেন্ডিং আবেদন নেই</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {applications.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-lg text-slate-900 mb-1">{app.shopName}</h3>
                          <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] uppercase font-black inline-block">{app.businessCategory}</div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : app.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                          {app.status === 'Pending' ? 'পেন্ডিং' : app.status === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-4">"{app.description}"</p>
                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">তারিখ: {app.date}</div>
                         <div className="flex space-x-2">
                           {app.status === 'Pending' && (
                             <>
                               <button onClick={() => setApplications(applications.map(a => a.id === app.id ? {...a, status: 'Approved'} : a))} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:scale-95 transition-all"><Check className="h-4 w-4" /></button>
                               <button onClick={() => setApplications(applications.map(a => a.id === app.id ? {...a, status: 'Rejected'} : a))} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 active:scale-95 transition-all"><X className="h-4 w-4" /></button>
                             </>
                           )}
                           <button className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200"><Eye className="h-4 w-4" /></button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* অর্ডার ডিটেইলস মোডাল */}
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`অর্ডার বিবরণ #${selectedOrder?.id}`}>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">গ্রাহক</p>
                  <p className="font-black text-sm">{selectedOrder.billingName}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">পেমেন্ট মেথড</p>
                  <p className="font-black text-sm">{selectedOrder.paymentMethod}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">আইটেম লিস্ট</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                          {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-black text-xs">{item.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{item.variantName} x {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                 <p className="font-black uppercase text-xs tracking-widest">সর্বমোট ভ্যালু</p>
                 <p className="font-black text-xl text-indigo-600">${selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={isNewAssetModalOpen} onClose={() => setIsNewAssetModalOpen(false)} title="মার্কেটপ্লেসে নতুন পণ্য যোগ করুন">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const newP: Product = {
              id: `p-${Date.now()}`,
              name: fd.get('name') as string,
              description: fd.get('description') as string,
              category: 'Subscription',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800',
              variants: [{id: 'v1', name: 'ফুল লাইসেন্স', price: Number(fd.get('price'))}],
              vendorName: 'বাইয়িং বিডি ইন-হাউজ',
              rating: 5.0,
              reviewsCount: 0,
              specs: { 'Status': 'অফিশিয়াল', 'Delivery': 'তাৎক্ষণিক' },
              region: 'Global'
            };
            setProducts([newP, ...products]);
            setIsNewAssetModalOpen(false);
          }}>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">পণ্যের শিরোনাম</label>
              <input required name="name" placeholder="নেটফ্লিক্স প্রিমিয়াম / অ্যাডোবি সলিউশন..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">শুরু মূল্য (USD)</label>
              <input required name="price" type="number" placeholder="প্রাইস লিখুন" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">বিস্তারিত বিবরণ</label>
              <textarea required name="description" placeholder="ফিচার এবং ব্যবহারের নিয়মাবলী লিখুন..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32" />
            </div>
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">অ্যাসেট পাবলিশ করুন</button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white animate-in fade-in duration-500">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center px-4 md:px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => setView(ViewState.HOME)}>
            <img src={LOGO_SRC} className="h-8 w-8 mr-2" />
            <span className="text-lg md:text-xl font-black tracking-tighter">বাইয়িং<span className="text-indigo-600">বিডি</span></span>
          </div>

          <div className="flex-grow max-w-md mx-6 md:mx-12 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); if(view !== ViewState.CATALOG) setView(ViewState.CATALOG); }}
                placeholder="সফটওয়্যার, লাইসেন্স বা গিফট কার্ড খুঁজুন..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/10" 
              />
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <button onClick={() => setView(ViewState.CATALOG)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hidden sm:block">মার্কেট</button>
            {currentUser?.role === 'admin' && (
              <button onClick={() => setView(ViewState.ADMIN)} className="flex items-center text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                <Shield className="h-3 w-3 mr-1" /> সিস্টেম
              </button>
            )}
            <button onClick={() => setView(ViewState.CART)} className="relative p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <ShoppingCart className="h-4 w-4" />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] h-4 w-4 flex items-center justify-center rounded-full font-black">{cart.length}</span>}
            </button>
            {currentUser ? (
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500">লগ আউট</button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="bg-slate-900 text-white px-4 md:px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200">লগইন</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {view === ViewState.HOME && (
          <div className="animate-in fade-in duration-700">
            <section className="bg-slate-900 py-20 md:py-32 px-6 relative overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <span className="bg-indigo-600 text-white text-[9px] px-3 py-1.5 rounded-lg font-black uppercase mb-6 inline-block tracking-widest">B2B ডিজিটাল ইকোসিস্টেম</span>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 max-w-3xl leading-[0.95]">আপনার বিজনেসের জন্য <br/><span className="text-indigo-500">ডিজিটাল অ্যাসেট।</span></h1>
                <p className="text-base md:text-lg text-slate-400 max-w-xl mb-10 font-medium leading-relaxed">সব ধরণের প্রিমিয়াম সাবস্ক্রিপশন, লাইসেন্স এবং গিফট কার্ড এখন এক জায়গায়। বাংলাদেশের সবচেয়ে বিশ্বস্ত বি২বি মার্কেটপ্লেস।</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setView(ViewState.CATALOG)} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95">শপ ভিজিট করুন</button>
                  <button onClick={() => setIsShopModalOpen(true)} className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all backdrop-blur-lg active:scale-95">পার্টনার হোন</button>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full opacity-20 pointer-events-none blur-[120px] bg-indigo-600 rounded-full"></div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">সেরা ডিলসমূহ</h2>
                </div>
                <button onClick={() => setView(ViewState.CATALOG)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center group">
                  ক্যাটালগ দেখুন <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
              </div>
            </section>

            <section className="bg-slate-50 py-24 border-y border-slate-100">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Zap className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">তাত্ক্ষণিক ডেলিভারি</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">অর্ডার করার সাথে সাথেই আপনার ডিজিটাল লাইসেন্স কি বা কোড আপনার প্রোফাইলে এবং ইমেইলে পাঠিয়ে দেওয়া হবে।</p>
                  </div>
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Shield className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">সম্পূর্ণ গ্যারান্টি</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">প্রতিটি পণ্য সরাসরি ভেন্ডর থেকে সংগ্রহ করা এবং ১০০% ভেরিফাইড। আপনার ডিজিটাল সিকিউরিটি আমাদের অগ্রাধিকার।</p>
                  </div>
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Briefcase className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">বিজনেসের জন্য বিশেষ ছাড়</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">কর্পোরেট একাউন্টের জন্য বাল্ক অর্ডার এবং বিশেষ পেমেন্ট ফ্লেক্সিবিলিটি। আপনার টিমের গ্রোথ আমাদের লক্ষ্য।</p>
                  </div>
               </div>
            </section>
          </div>
        )}

        {view === ViewState.CATALOG && (
          <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">ডিজিটাল <br/><span className="text-indigo-600">ক্যাটালগ।</span></h1>
              <div className="flex flex-wrap items-center gap-3">
                 <button className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
                   <Filter className="h-3 w-3 mr-2" /> ফিল্টার করুন
                 </button>
                 <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-3 rounded-2xl tracking-widest">
                   {filteredProducts.length}টি পণ্য অনলাইন
                 </div>
              </div>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
              </div>
            ) : (
              <div className="py-32 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-slate-400">দুঃখিত, কোনো পণ্য পাওয়া যায়নি।</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase underline tracking-widest">সার্চ ক্লিয়ার করুন</button>
              </div>
            )}
          </div>
        )}

        {view === ViewState.CART && (
          <div className="max-w-3xl mx-auto px-6 py-24 animate-in fade-in duration-300">
             <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">আপনার চেকআউট</h2>
             {cart.length > 0 ? (
               <div className="space-y-4">
                 {cart.map(item => (
                   <div key={`${item.productId}-${item.variantId}`} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center space-x-6">
                       <img src={item.image} className="h-14 w-14 md:h-16 md:w-16 rounded-2xl object-cover shadow-sm" />
                       <div>
                         <h4 className="font-black text-slate-900 text-sm md:text-base mb-1">{item.name}</h4>
                         <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{item.variantName}</p>
                       </div>
                     </div>
                     <div className="flex items-center space-x-6">
                       <span className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                       <button onClick={() => setCart(cart.filter(i => !(i.productId === item.productId && i.variantId === item.variantId)))} className="h-8 w-8 flex items-center justify-center bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                         <Trash2 className="h-4 w-4"/>
                       </button>
                     </div>
                   </div>
                 ))}
                 <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] mt-12 text-white shadow-2xl shadow-indigo-100">
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">সর্বমোট পরিশোধ্য</span>
                      <span className="text-3xl font-black text-indigo-400">${cart.reduce((a,b) => a + b.price * b.quantity, 0).toFixed(2)}</span>
                    </div>
                    <button onClick={processOrder} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform">অর্ডার নিশ্চিত করুন</button>
                 </div>
               </div>
             ) : (
               <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100">
                 <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="font-black uppercase tracking-widest text-slate-400">আপনার কার্টটি বর্তমানে খালি।</p>
                 <button onClick={() => setView(ViewState.CATALOG)} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest underline">মার্কেটে ফিরে যান</button>
               </div>
             )}
          </div>
        )}

        {view === ViewState.ORDER_SUCCESS && (
          <div className="max-w-lg mx-auto py-32 text-center px-6">
            <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100"><Check className="h-10 w-10"/></div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">অর্ডার সফল!</h1>
            <p className="text-slate-500 font-medium mb-10 text-sm md:text-base leading-relaxed">আপনার লেনদেনটি সফলভাবে সম্পন্ন হয়েছে। শীঘ্রই আপনার পোর্টালে ডিজিটাল কি এবং ইনভয়েস দেখতে পাবেন।</p>
            <button onClick={() => setView(ViewState.HOME)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:-translate-y-1 transition-transform">হোমে ফিরে যান</button>
          </div>
        )}
      </main>

      {/* এআই চ্যাটবট */}
      <div className="fixed bottom-24 right-8 z-50">
         <button onClick={() => setIsAiOpen(!isAiOpen)} className="bg-slate-900 text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white">
           {isAiOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
         </button>
         {isAiOpen && (
           <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
             <div className="p-5 bg-slate-900 text-white flex items-center space-x-3">
               <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
               <div>
                 <span className="font-black uppercase tracking-widest text-[9px] block">স্মার্ট এআই অ্যাডভাইজার</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">বাইয়িং বিডি স্পেশাল সাপোর্ট</span>
               </div>
             </div>
             <div className="flex-grow p-6 overflow-y-auto space-y-4 text-[13px] font-medium leading-relaxed bg-slate-50/30">
               {aiHistory.length === 0 && (
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
                    আমি আপনাকে কীভাবে সাহায্য করতে পারি? যেকোনো সফটওয়্যার বা গিফট কার্ডের বিষয়ে প্রশ্ন করুন।
                 </div>
               )}
               {aiHistory.map((h, i) => (
                 <div key={i} className={`p-4 rounded-2xl shadow-sm ${h.role === 'ai' ? 'bg-indigo-600 text-white self-start mr-8' : 'bg-white text-slate-900 self-end ml-8 border border-slate-100'}`}>
                   {h.text}
                 </div>
               ))}
               {isAiLoading && <div className="p-4 bg-indigo-50 text-indigo-400 rounded-2xl animate-pulse flex items-center space-x-2"><Clock className="h-4 w-4"/> <span>অ্যানালাইসিস করছি...</span></div>}
             </div>
             <div className="p-4 bg-white border-t border-slate-100 flex space-x-2">
               <input value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()} placeholder="এখানে লিখুন..." className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none text-[13px] font-bold" />
               <button onClick={handleAiAsk} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Send className="h-4 w-4" /></button>
             </div>
           </div>
         )}
      </div>

      <WhatsAppFAB />

      {/* মোডালসমূহ */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="নিরাপদ প্রবেশপথ">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">ইউজার ইমেইল / কর্পোরেট আইডি</label>
            <input name="email" type="email" required placeholder="আপনার ইমেইল" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-indigo-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">সিক্রেট পাসওয়ার্ড</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-indigo-200 transition-colors" />
          </div>
          <div className="pt-4">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">লগইন করুন</button>
            <p className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest leading-loose">নিরাপদ এন্টারপ্রাইজ প্রোটোকল দ্বারা এনক্রিপ্টেড। রুট এক্সেসের জন্য সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।</p>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isShopModalOpen} onClose={() => setIsShopModalOpen(false)} title="ভেন্ডর হিসেবে পার্টনারশিপ আবেদন">
        <form className="space-y-4" onSubmit={submitVendorApp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <input required name="fullName" placeholder="পূর্ণ আইনি নাম" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
             <input required name="email" type="email" placeholder="অফিশিয়াল ইমেইল" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <input required name="shopName" placeholder="প্রতিষ্ঠানের নাম" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
             <select name="category" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm cursor-pointer">
               <option>SaaS প্রোভাইডার</option>
               <option>সফটওয়্যার এজেন্সি</option>
               <option>গিফট কার্ড ডিলার</option>
               <option>অন্যান্য</option>
             </select>
          </div>
          <textarea required name="description" placeholder="আপনার ব্যবসা এবং পণ্যের উৎস সম্পর্কে সংক্ষেপে লিখুন..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32" />
          <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">আবেদন জমা দিন</button>
        </form>
      </Modal>

      <footer className="bg-slate-900 text-slate-500 py-24 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-8">
                <img src={LOGO_SRC} className="h-8 w-8 mr-2 grayscale brightness-200" />
                <span className="text-white font-black text-xl tracking-tighter">বাইয়িংবিডি</span>
              </div>
              <p className="max-w-sm text-sm font-medium leading-relaxed">বাংলাদেশের প্রগতিশীল এন্টারপ্রাইজ সমূহের জন্য নির্ভরযোগ্য ডিজিটাল অ্যাসেট প্রকিউরমেন্ট পোর্টাল। সরাসরি ভেন্ডর এক্সেস এবং সিকিউর ডেলিভারি আমাদের মূল প্রতিশ্রুতি।</p>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">অফিশিয়াল সাপোর্ট</span>
                  <a href="tel:+8801338353169" className="text-white font-black text-xs hover:text-indigo-400 transition-colors">+৮৮০ ১৩৩৮-৩৫৩১৬৯</a>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">হেড কোয়ার্টার</span>
                  <span className="text-white font-black text-xs">ঢাকা, বাংলাদেশ</span>
                </div>
              </div>
           </div>
           <div>
              <h5 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">কুইক লিঙ্ক</h5>
              <ul className="space-y-4 text-xs font-bold">
                 <li><button onClick={() => setView(ViewState.CATALOG)} className="hover:text-indigo-400 transition-colors">ডিজিটাল মার্কেট</button></li>
                 <li><button onClick={() => setIsShopModalOpen(true)} className="hover:text-indigo-400 transition-colors">ভেন্ডর হাব</button></li>
                 <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-indigo-400 transition-colors">লগইন করুন</button></li>
                 <li><button onClick={() => setView(ViewState.HOME)} className="hover:text-indigo-400 transition-colors">হোম পেজ</button></li>
              </ul>
           </div>
           <div>
              <h5 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">আইনি নীতিমালা</h5>
              <ul className="space-y-4 text-xs font-bold">
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">শর্তাবলী ও নিয়মাবলী</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">গোপনীয়তা সুরক্ষা</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">রিফান্ড ও চার্জব্যাক</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">ভেন্ডর কোড অফ কন্ডাক্ট</li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
           <span>© ২০২৪ বাইয়িং বিডি এন্টারপ্রাইজ • কপিরাইট সংরক্ষিত</span>
           <div className="flex items-center space-x-6">
             <span className="text-indigo-500">সিকিউর গেটওয়ে</span>
             <span className="text-slate-700">|</span>
             <span className="text-indigo-500">তাত্ক্ষণিক ডেলিভারি সিস্টেম</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

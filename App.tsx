
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

// --- Local Storage Constants ---
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
      ওয়াটসঅ্যাপ কনসিয়ার্জ
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

  // Persistence
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);

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

  // Derived logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const recommendedProducts = products.filter(p => p.rating >= 4.8 || p.isRecommended).slice(0, 4);

  // Handlers
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

  // UI Components for Admin
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
      <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
        {/* Mobile Nav */}
        <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center text-white sticky top-0 z-[60]">
          <div className="flex items-center space-x-2">
            <Shield className="text-indigo-500 h-5 w-5" />
            <span className="font-black text-xs uppercase tracking-widest">অ্যাডমিন কনসোল</span>
          </div>
          <button onClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}><Menu className="h-6 w-6" /></button>
        </div>

        {/* Sidebar */}
        <aside className={`${isAdminSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform w-full md:w-64 bg-slate-900 p-6 flex flex-col fixed md:sticky h-screen z-50 overflow-y-auto`}>
          <div className="hidden md:flex items-center space-x-3 mb-12">
            <Shield className="text-indigo-500 h-6 w-6" />
            <span className="text-white font-black tracking-tighter uppercase">অ্যাডমিন কনসোল</span>
          </div>
          <nav className="flex-grow space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'অ্যানালিটিক্স' },
              { id: 'inventory', icon: Database, label: 'ইনভেন্টরি' },
              { id: 'orders', icon: CreditCard, label: 'লেনদেন' },
              { id: 'vendors', icon: Users, label: 'পার্টনার' },
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
              <ArrowUpRight className="h-4 w-4 mr-3" /> লাইভ সাইট
            </button>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-xl text-xs font-black uppercase text-slate-500 hover:text-red-400">
              <LogOut className="h-4 w-4 mr-3" /> সাইন আউট
            </button>
          </div>
        </aside>

        <main className="flex-grow p-4 md:p-12 overflow-x-hidden">
          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                {adminTab === 'dashboard' ? 'পারফরম্যান্স হাব' : adminTab === 'inventory' ? 'ক্যাটালগ ম্যানেজমেন্ট' : adminTab === 'orders' ? 'অর্থনৈতিক লেনদেন' : 'পার্টনার নেটওয়ার্ক'}
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">গ্লোবাল মার্কেটপ্লেস কন্ট্রোল</p>
            </div>
          </header>

          {adminTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'মোট লেনদেন', val: `$${orders.reduce((a, b) => a + b.total, 0).toLocaleString()}`, icon: BarChart3, trend: '+১২.৫%', color: 'indigo' },
                  { label: 'সক্রিয় অ্যাসেট', val: products.length, icon: Database, trend: '+৪', color: 'amber' },
                  { label: 'অপেক্ষমাণ আবেদন', val: applications.filter(a => a.status === 'Pending').length, icon: Clock, trend: 'বেশি', color: 'rose' },
                  { label: 'সাফল্যের হার', val: '৯৯.৪%', icon: TrendingUp, trend: 'স্থিতিশীল', color: 'emerald' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                       <div className={`h-10 w-10 rounded-xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}><s.icon className="h-5 w-5"/></div>
                       <span className="text-[9px] font-black text-emerald-500">{s.trend}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{s.label}</p>
                    <p className="text-xl md:text-2xl font-black text-slate-900">{s.val}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400 mb-8">রাজস্ব প্রক্ষেপণ (৭ দিন)</h3>
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
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '12px'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {adminTab === 'inventory' && (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-black uppercase tracking-widest text-sm">অ্যাসেট ক্যাটালগ</h2>
                <button onClick={() => setIsNewAssetModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center shadow-lg shadow-indigo-200">
                  <Plus className="h-4 w-4 mr-2" /> নতুন অ্যাসেট যোগ করুন
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">পণ্যের বিবরণ</th>
                      <th className="px-6 py-4">ক্যাটাগরি</th>
                      <th className="px-6 py-4">রেটিং</th>
                      <th className="px-6 py-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-700">
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 flex items-center">
                          <img src={p.image} className="h-10 w-10 rounded-xl mr-4 object-cover ring-2 ring-slate-100" />
                          <div>
                            <div className="font-black text-slate-900">{p.name}</div>
                            <div className="text-[9px] text-slate-400 uppercase tracking-tighter">সেলার: {p.vendorName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] uppercase font-black">{p.category}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-amber-500"><Star className="h-3 w-3 fill-amber-500 mr-1"/> {p.rating}</div>
                        </td>
                        <td className="px-6 py-5">
                          <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all">
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
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="p-6 border-b border-slate-100"><h2 className="font-black uppercase tracking-widest text-sm">কর্পোরেট লেনদেন</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">ইনভয়েস আইডি</th>
                      <th className="px-6 py-4">ক্লায়েন্ট</th>
                      <th className="px-6 py-4">মোট মূল্য</th>
                      <th className="px-6 py-4">স্ট্যাটাস</th>
                      <th className="px-6 py-4">বিস্তারিত</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold">
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-slate-50">
                        <td className="px-6 py-5 font-black text-slate-400 tracking-tighter">#{o.id}</td>
                        <td className="px-6 py-5">
                          <div className="text-slate-900">{o.billingName}</div>
                          <div className="text-[9px] text-slate-400 lowercase">{o.billingEmail}</div>
                        </td>
                        <td className="px-6 py-5 font-black text-indigo-600">${o.total.toFixed(2)}</td>
                        <td className="px-6 py-5">
                          <select 
                            value={o.status} 
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                            className={`text-[9px] font-black uppercase p-2 rounded-xl outline-none border-none cursor-pointer ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}
                          >
                            <option value="Pending">পেন্ডিং</option>
                            <option value="Processing">প্রসেসিং</option>
                            <option value="Completed">সম্পন্ন</option>
                            <option value="Refunded">রিফান্ডেড</option>
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <button className="text-indigo-600 hover:underline flex items-center"><Eye className="h-4 w-4 mr-1"/> দেখুন</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminTab === 'vendors' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end mb-4">
                <h2 className="font-black uppercase tracking-widest text-sm">মার্কেটপ্লেস পার্টনার</h2>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100">{applications.length}টি আবেদন</div>
              </div>
              {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-slate-200">
                  <p className="font-black uppercase text-slate-400 text-xs">কোনো আবেদন নেই</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {applications.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-black text-lg text-slate-900 leading-tight mb-1">{app.shopName}</h3>
                          <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] uppercase font-black inline-block mb-3">{app.businessCategory}</div>
                          <p className="text-xs text-slate-500 font-medium italic">"{app.description}"</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : app.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                          {app.status === 'Pending' ? 'পেন্ডিং' : app.status === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                        </div>
                      </div>
                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">তারিখ: {app.date}</div>
                         <div className="flex space-x-2">
                           {app.status === 'Pending' && (
                             <>
                               <button onClick={() => setApplications(applications.map(a => a.id === app.id ? {...a, status: 'Approved'} : a))} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:scale-95"><Check className="h-4 w-4" /></button>
                               <button onClick={() => setApplications(applications.map(a => a.id === app.id ? {...a, status: 'Rejected'} : a))} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 active:scale-95"><X className="h-4 w-4" /></button>
                             </>
                           )}
                           <button className="p-3 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-200 active:scale-95"><Eye className="h-4 w-4" /></button>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <Modal isOpen={isNewAssetModalOpen} onClose={() => setIsNewAssetModalOpen(false)} title="মার্কেটপ্লেস অ্যাসেট যোগ করুন">
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const newP: Product = {
              id: `p-${Date.now()}`,
              name: fd.get('name') as string,
              description: fd.get('description') as string,
              category: 'Subscription',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800',
              variants: [{id: 'v1', name: 'এন্টারপ্রাইজ লাইসেন্স', price: Number(fd.get('price'))}],
              vendorName: 'Buying BD Direct',
              rating: 5.0,
              reviewsCount: 0,
              specs: { 'Status': 'অফিশিয়াল', 'Delivery': 'তাৎক্ষণিক' },
              region: 'Global'
            };
            setProducts([newP, ...products]);
            setIsNewAssetModalOpen(false);
          }}>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">অ্যাসেট লেবেল</label>
              <input required name="name" placeholder="নেটফ্লিক্স প্রিমিয়াম / অ্যাডোবি স্যুট..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">প্রাইস (ইউএসডি)</label>
              <input required name="price" type="number" placeholder="শুরু মূল্য ($)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">অ্যাসেট স্পেসিফিকেশন</label>
              <textarea required name="description" placeholder="ইউজার লিমিট, মেয়াদ এবং ডেলিভারি মেথড উল্লেখ করুন..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32" />
            </div>
            <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-[0.98] transition-transform">অ্যাসেট ডেপ্লয় করুন</button>
          </form>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
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
            {/* Hero */}
            <section className="bg-slate-900 py-20 md:py-32 px-6 relative overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <span className="bg-indigo-600 text-white text-[9px] px-3 py-1.5 rounded-lg font-black uppercase mb-6 inline-block tracking-widest">B2B ডিজিটাল সাপ্লাই চেইন</span>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 max-w-3xl leading-[0.95]">এন্টারপ্রাইজ অ্যাসেট <br/><span className="text-indigo-500">প্রকিউরমেন্ট।</span></h1>
                <p className="text-base md:text-lg text-slate-400 max-w-xl mb-10 font-medium leading-relaxed">বাল্ক সফটওয়্যার লাইসেন্সিং, এমপ্লয়ী বেনিফিট এবং ডিজিটাল ইনফ্রাস্ট্রাকচার টুলস - সবই এখন এক জায়গায় institutional গ্রেড নিরাপত্তায়।</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setView(ViewState.CATALOG)} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5">মার্কেটপ্লেস দেখুন</button>
                  <button onClick={() => setIsShopModalOpen(true)} className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-all backdrop-blur-lg">পার্টনার হিসেবে যোগ দিন</button>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full opacity-20 pointer-events-none blur-[120px] bg-indigo-600 rounded-full"></div>
            </section>

            {/* Recommended Products */}
            <section className="max-w-7xl mx-auto px-6 py-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">সেরা রিকমেন্ডেশন</h2>
                </div>
                <button onClick={() => setView(ViewState.CATALOG)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center group">
                  সবগুলো দেখুন <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} />)}
              </div>
            </section>

            {/* Features */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Zap className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">তাৎক্ষণিক ডেলিভারি</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই লাইসেন্স কি এবং এক্সেস ডিটেইলস আপনার পোর্টালে পাঠিয়ে দেওয়া হবে।</p>
                  </div>
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Shield className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">ভেরিফাইড সোর্স</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">প্রতিটি অ্যাসেট সরাসরি ভেন্ডর থেকে সংগ্রহ করা হয় এবং প্রতিটি লেনদেনের নিরাপত্তা নিশ্চিত করা হয়।</p>
                  </div>
                  <div className="flex flex-col items-start group">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 group-hover:-translate-y-1 transition-transform"><Briefcase className="text-indigo-600 h-6 w-6" /></div>
                    <h3 className="font-black uppercase tracking-widest text-sm mb-4">এন্টারপ্রাইজ ক্রেডিট</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">একই কর্পোরেট ওয়ালেটের মাধ্যমে একাধিক ডিপার্টমেন্টের খরচ নিয়ন্ত্রণ এবং ম্যানেজ করার সুবিধা।</p>
                  </div>
               </div>
            </section>
          </div>
        )}

        {view === ViewState.CATALOG && (
          <div className="max-w-7xl mx-auto px-6 py-20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-16">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">ডিজিটাল <br/><span className="text-indigo-600">ইনভেন্টরি।</span></h1>
              <div className="flex flex-wrap items-center gap-3">
                 <button className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">
                   <Filter className="h-3 w-3 mr-2" /> ফিল্টার করুন
                 </button>
                 <div className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-4 py-3 rounded-2xl tracking-widest">
                   {filteredProducts.length}টি অ্যাসেট অনলাইন
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
                <p className="font-black uppercase tracking-widest text-slate-400">আপনার সার্চের সাথে কোনো পণ্য মেলেনি।</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase underline tracking-widest">সার্চ ক্লিয়ার করুন</button>
              </div>
            )}
          </div>
        )}

        {view === ViewState.CART && (
          <div className="max-w-3xl mx-auto px-6 py-24 animate-in fade-in duration-300">
             <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">কেনাকাটার তালিকা</h2>
             {cart.length > 0 ? (
               <div className="space-y-4">
                 {cart.map(item => (
                   <div key={`${item.productId}-${item.variantId}`} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center space-x-6">
                       <img src={item.image} className="h-14 w-14 md:h-16 md:w-16 rounded-2xl object-cover" />
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
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">মোট মূল্য</span>
                      <span className="text-3xl font-black text-indigo-400">${cart.reduce((a,b) => a + b.price * b.quantity, 0).toFixed(2)}</span>
                    </div>
                    <button onClick={processOrder} className="w-full bg-indigo-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform">অর্ডার নিশ্চিত করুন</button>
                 </div>
               </div>
             ) : (
               <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100">
                 <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                 <p className="font-black uppercase tracking-widest text-slate-400">আপনার কার্ট খালি।</p>
                 <button onClick={() => setView(ViewState.CATALOG)} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest underline">মার্কেটপ্লেস দেখুন</button>
               </div>
             )}
          </div>
        )}

        {view === ViewState.ORDER_SUCCESS && (
          <div className="max-w-lg mx-auto py-32 text-center px-6">
            <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100"><Check className="h-10 w-10"/></div>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">সফল হয়েছে!</h1>
            <p className="text-slate-500 font-medium mb-10 text-sm md:text-base leading-relaxed">আপনার অ্যাসেট কি এবং ডকুমেন্টেশন পার্টনার প্রোফাইলে যুক্ত করা হয়েছে। বিস্তারিত তথ্য আপনার ইমেইলে পাঠিয়ে দেওয়া হয়েছে।</p>
            <button onClick={() => setView(ViewState.HOME)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:-translate-y-1 transition-transform">হোম-এ ফিরে যান</button>
          </div>
        )}
      </main>

      {/* Floating AI Advisor */}
      <div className="fixed bottom-24 right-8 z-50">
         <button onClick={() => setIsAiOpen(!isAiOpen)} className="bg-slate-900 text-white h-14 w-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white">
           {isAiOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
         </button>
         {isAiOpen && (
           <div className="absolute bottom-20 right-0 w-80 md:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col h-[500px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
             <div className="p-5 bg-slate-900 text-white flex items-center space-x-3">
               <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Sparkles className="h-4 w-4" /></div>
               <div>
                 <span className="font-black uppercase tracking-widest text-[9px] block">AI কনসালট্যান্ট</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">গেমিনি প্রো দ্বারা চালিত</span>
               </div>
             </div>
             <div className="flex-grow p-6 overflow-y-auto space-y-4 text-[13px] font-medium leading-relaxed bg-slate-50/30">
               {aiHistory.length === 0 && (
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 text-slate-500 text-xs italic">
                    আমি আজ আপনাকে কীভাবে সাহায্য করতে পারি? আপনার টিমের প্রয়োজনে সঠিক সফটওয়্যার খুঁজে পেতে আমাকে প্রশ্ন করুন।
                 </div>
               )}
               {aiHistory.map((h, i) => (
                 <div key={i} className={`p-4 rounded-2xl shadow-sm ${h.role === 'ai' ? 'bg-indigo-600 text-white self-start mr-8' : 'bg-white text-slate-900 self-end ml-8 border border-slate-100'}`}>
                   {h.text}
                 </div>
               ))}
               {isAiLoading && <div className="p-4 bg-indigo-50 text-indigo-400 rounded-2xl animate-pulse flex items-center space-x-2"><Clock className="h-4 w-4"/> <span>মার্কেট এনালাইসিস করছি...</span></div>}
             </div>
             <div className="p-4 bg-white border-t border-slate-100 flex space-x-2">
               <input value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()} placeholder="লাইসেন্সিং বা পণ্য সম্পর্কে জিজ্ঞাসা করুন..." className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 outline-none text-[13px] font-bold" />
               <button onClick={handleAiAsk} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"><Send className="h-4 w-4" /></button>
             </div>
           </div>
         )}
      </div>

      <WhatsAppFAB />

      {/* Modals */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="নিরাপত্তা যাচাই">
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">কর্পোরেট আইডি / অ্যাডমিন ইমেইল</label>
            <input name="email" type="email" required placeholder="name@org.bd" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">এক্সেস টোকেন</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
          </div>
          <div className="pt-4">
            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-600 transition-all">লগইন করুন</button>
            <div className="mt-8 p-4 bg-indigo-50 rounded-2xl flex items-start space-x-3">
              <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-indigo-900/60 leading-normal uppercase tracking-widest">শুধুমাত্র অনুমোদিত কর্পোরেট একাউন্ট ব্যবহার করা যাবে। অ্যাডমিনরা নির্ধারিত রুট তথ্য ব্যবহার করুন।</p>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isShopModalOpen} onClose={() => setIsShopModalOpen(false)} title="পার্টনার হওয়ার আবেদন">
        <form className="space-y-4" onSubmit={submitVendorApp}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">পূর্ণ নাম (আইনি অনুযায়ী)</label>
               <input required name="fullName" placeholder="নাম লিখুন" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">অফিশিয়াল ইমেইল</label>
               <input required name="email" type="email" placeholder="contact@shop.bd" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">ব্যবসার নাম</label>
               <input required name="shopName" placeholder="টেকসলিউশনস বিডি" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">পণ্যের ক্যাটাগরি</label>
               <select name="category" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none">
                 <option>SaaS প্রোভাইডার</option>
                 <option>সফটওয়্যার এজেন্সি</option>
                 <option>ডিজিটাল আর্টিস্ট</option>
                 <option>গিফট কার্ড হোলসেলার</option>
               </select>
             </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">ব্যবসা সম্পর্কে সংক্ষেপে</label>
            <textarea required name="description" placeholder="আপনার পণ্য সংগ্রহ এবং ভেরিফিকেশন পদ্ধতি সম্পর্কে বিস্তারিত লিখুন..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-32" />
          </div>
          <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">আবেদন জমা দিন</button>
        </form>
      </Modal>

      <footer className="bg-slate-900 text-slate-500 py-24 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-8">
                <img src={LOGO_SRC} className="h-8 w-8 mr-2 grayscale brightness-200" />
                <span className="text-white font-black text-xl tracking-tighter">বাইয়িংবিডি</span>
              </div>
              <p className="max-w-sm text-sm font-medium leading-relaxed">বাংলাদেশের এন্টারপ্রাইজ মার্কেটের জন্য ঐক্যবদ্ধ ডিজিটাল অ্যাসেট প্রকিউরমেন্ট পোর্টাল। ভেরিফাইড SaaS, বাল্ক লাইসেন্সিং এবং গিফট কার্ডের নির্ভরযোগ্য মাধ্যম।</p>
              <div className="mt-8 flex items-center space-x-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">সরাসরি সাপোর্ট</span>
                  <a href="tel:+8801338353169" className="text-white font-black text-xs hover:text-indigo-400 transition-colors">+৮৮০ ১৩৩৮-৩৫৩১৬৯</a>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">প্রধান কার্যালয়</span>
                  <span className="text-white font-black text-xs">ঢাকা, বাংলাদেশ</span>
                </div>
              </div>
           </div>
           <div>
              <h5 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">মার্কেটপ্লেস</h5>
              <ul className="space-y-4 text-xs font-bold">
                 <li><button onClick={() => setView(ViewState.CATALOG)} className="hover:text-indigo-400 transition-colors">ডিজিটাল ক্যাটালগ</button></li>
                 <li><button onClick={() => setIsShopModalOpen(true)} className="hover:text-indigo-400 transition-colors">ভেন্ডর রেজিস্ট্রেশন</button></li>
                 <li><button onClick={() => setIsLoginModalOpen(true)} className="hover:text-indigo-400 transition-colors">পার্টনার এক্সেস</button></li>
                 <li><button onClick={() => setView(ViewState.HOME)} className="hover:text-indigo-400 transition-colors">B2B সলিউশনস</button></li>
              </ul>
           </div>
           <div>
              <h5 className="text-white font-black uppercase text-[10px] tracking-widest mb-6">নীতিমালা</h5>
              <ul className="space-y-4 text-xs font-bold">
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">SLA ও শর্তাবলী</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">প্রাইভেসি প্রোটোকল</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">রিফান্ড ও ডিস্পিউট</li>
                 <li className="hover:text-indigo-400 cursor-pointer transition-colors">ভেন্ডর স্ট্যান্ডার্ড</li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest">
           <span>© ২০২৪ বাইয়িং বিডি এন্টারপ্রাইজ • সর্বস্বত্ব সংরক্ষিত</span>
           <div className="flex items-center space-x-6">
             <span className="text-indigo-500">সিকিউর প্রোটোকল</span>
             <span className="text-slate-700">|</span>
             <span className="text-indigo-500">তাৎক্ষণিক ডেলিভারি</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

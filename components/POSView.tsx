import React, { useState, useMemo } from 'react';
import { POS_MENU, POSMenuItem } from '../posData';
import { ShoppingCart, Plus, Minus, Trash2, Search, CreditCard, Tag, Ban, Send } from 'lucide-react';

interface OrderLine {
  id: string;
  item: POSMenuItem;
  quantity: number;
}

const POSView: React.FC = () => {
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group menu by categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    POS_MENU.forEach(item => cats.add(item.category));
    return Array.from(cats).sort();
  }, []);

  const filteredItems = useMemo(() => {
    let items = POS_MENU;
    if (selectedCategory) {
      items = items.filter(item => item.category === selectedCategory);
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(lowerQ));
    }
    return items;
  }, [searchQuery, selectedCategory]);

  const addToOrder = (item: POSMenuItem) => {
    setOrderLines(prev => {
      const existing = prev.find(line => line.item.id === item.id);
      if (existing) {
        return prev.map(line =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { id: crypto.randomUUID(), item, quantity: 1 }];
    });
  };

  const updateQuantity = (lineId: string, delta: number) => {
    setOrderLines(prev => prev.map(line => {
      if (line.id === lineId) {
        const newQuantity = line.quantity + delta;
        return newQuantity > 0 ? { ...line, quantity: newQuantity } : line;
      }
      return line;
    }));
  };

  const removeLine = (lineId: string) => {
    setOrderLines(prev => prev.filter(line => line.id !== lineId));
  };

  const clearOrder = () => {
    setOrderLines([]);
  };

  const subtotal = orderLines.reduce((sum, line) => sum + (line.item.price * line.quantity), 0);
  const tax = subtotal * 0.15; // 15% GST assumed
  const total = subtotal + tax;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>

      {/* Left Pane - Order */}
      <div className="w-1/3 flex flex-col bg-slate-900/60 backdrop-blur-xl border-r border-white/10 relative z-10 shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/10 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-emerald-400" /> Current Order
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {orderLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
              <p className="font-medium tracking-wide">No items in order</p>
            </div>
          ) : (
            orderLines.map(line => (
              <div key={line.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-all border border-white/5 hover:border-white/20">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100 truncate">{line.item.name}</h3>
                  <p className="text-sm text-emerald-400/80">${line.item.price.toFixed(2)} <span className="text-slate-500 text-xs ml-1">each</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-slate-950/50 rounded-lg p-1 border border-white/5">
                    <button onClick={() => updateQuantity(line.id, -1)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all active:scale-95">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-mono font-medium">{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.id, 1)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all active:scale-95">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-mono font-bold text-slate-100 tracking-wider">
                    ${(line.item.price * line.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeLine(line.id)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-all active:scale-95">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 space-y-4">
          <div className="flex justify-between text-slate-400 font-medium tracking-wide">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-400 font-medium tracking-wide">
            <span>Tax (15%)</span>
            <span className="font-mono text-slate-200">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-3xl font-bold text-white pt-4 border-t border-white/10">
            <span>Total</span>
            <span className="font-mono text-emerald-400">${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3 pt-6">
            <button onClick={clearOrder} className="col-span-1 py-4 bg-slate-800 hover:bg-rose-600 border border-white/10 hover:border-transparent rounded-xl font-bold flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group">
              <Ban className="h-6 w-6 mb-2 text-rose-400 group-hover:text-white transition-colors" />
              <span className="text-sm tracking-wider">VOID</span>
            </button>
            <button className="col-span-1 py-4 bg-slate-800 hover:bg-amber-500 border border-white/10 hover:border-transparent rounded-xl font-bold flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group">
              <Tag className="h-6 w-6 mb-2 text-amber-400 group-hover:text-white transition-colors" />
              <span className="text-sm tracking-wider">DISC</span>
            </button>
            <button className="col-span-1 py-4 bg-slate-800 hover:bg-indigo-500 border border-white/10 hover:border-transparent rounded-xl font-bold flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95 group">
              <Send className="h-6 w-6 mb-2 text-indigo-400 group-hover:text-white transition-colors" />
              <span className="text-sm tracking-wider">SEND</span>
            </button>
            <button className="col-span-1 py-4 bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 rounded-xl font-bold flex flex-col items-center justify-center transition-all hover:scale-[1.02] active:scale-95">
              <CreditCard className="h-6 w-6 mb-2 text-white" />
              <span className="text-sm tracking-wider text-white">PAY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane - Items & Categories */}
      <div className="w-2/3 flex flex-col relative z-10">
        {/* Top Bar - Search & Info */}
        <div className="p-6 bg-white/5 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
          <div className="relative w-1/2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner placeholder-slate-500"
            />
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setSelectedCategory(null)} className={`px-6 py-3 rounded-xl font-bold tracking-wide transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800/50 border border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              All Items
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="p-4 bg-slate-900/40 backdrop-blur-sm border-b border-white/5 overflow-x-auto whitespace-nowrap custom-scrollbar">
          <div className="flex space-x-3 px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-3 rounded-xl font-bold tracking-wide min-w-[130px] transition-all hover:scale-[1.02] active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/50' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto bg-transparent custom-scrollbar">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToOrder(item)}
                className="group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-indigo-400/50 rounded-2xl p-4 h-32 flex flex-col justify-between items-start text-left transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-95"
              >
                <span className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">{item.name}</span>
                <div className="w-full flex justify-between items-end mt-2">
                  <span className="text-xs font-medium text-slate-500 truncate max-w-[50%] uppercase tracking-wider">{item.category}</span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">${item.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="p-6 bg-white/5 rounded-full border border-white/10">
                  <Search className="h-12 w-12 text-slate-600" />
              </div>
              <p className="text-xl font-medium tracking-wide">No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSView;

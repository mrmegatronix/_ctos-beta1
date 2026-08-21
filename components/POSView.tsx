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
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Pane - Order */}
      <div className="w-1/3 flex flex-col bg-gray-800 border-r border-gray-700">
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <h2 className="text-xl font-bold text-blue-400 flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" /> Current Order
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {orderLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
              <p>No items in order</p>
            </div>
          ) : (
            orderLines.map(line => (
              <div key={line.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold truncate">{line.item.name}</h3>
                  <p className="text-sm text-gray-400">${line.item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-900 rounded-lg">
                    <button onClick={() => updateQuantity(line.id, -1)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-l-lg transition-colors">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 font-mono">{line.quantity}</span>
                    <button onClick={() => updateQuantity(line.id, 1)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-r-lg transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-mono font-bold">
                    ${(line.item.price * line.quantity).toFixed(2)}
                  </div>
                  <button onClick={() => removeLine(line.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-gray-900 border-t border-gray-700 space-y-3">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Tax (15%)</span>
            <span className="font-mono">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-white pt-2 border-t border-gray-700">
            <span>Total</span>
            <span className="font-mono text-green-400">${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 pt-4">
            <button onClick={clearOrder} className="col-span-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold flex flex-col items-center justify-center transition-colors">
              <Ban className="h-5 w-5 mb-1" />
              Void
            </button>
            <button className="col-span-1 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold flex flex-col items-center justify-center transition-colors">
              <Tag className="h-5 w-5 mb-1" />
              Disc
            </button>
            <button className="col-span-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold flex flex-col items-center justify-center transition-colors">
              <Send className="h-5 w-5 mb-1" />
              Send
            </button>
            <button className="col-span-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex flex-col items-center justify-center transition-colors">
              <CreditCard className="h-5 w-5 mb-1" />
              Pay
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane - Items & Categories */}
      <div className="w-2/3 flex flex-col">
        {/* Top Bar - Search & Info */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              All Items
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex space-x-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 rounded-lg font-bold min-w-[120px] shadow-sm transition-transform active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-blue-500 text-white shadow-blue-500/50' 
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToOrder(item)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-3 h-28 flex flex-col justify-between items-start text-left transition-all active:scale-95 shadow-sm hover:shadow-blue-500/20"
              >
                <span className="font-bold text-sm line-clamp-2 leading-tight">{item.name}</span>
                <div className="w-full flex justify-between items-end mt-2">
                  <span className="text-xs text-gray-400 truncate max-w-[60%]">{item.category}</span>
                  <span className="font-mono font-bold text-green-400">${item.price.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Search className="h-16 w-16 opacity-20" />
              <p className="text-xl">No items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default POSView;

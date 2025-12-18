import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Package, Plus, Edit2, Trash2, Search, Grid, List, MoreHorizontal, Eye } from 'lucide-react';
import { products } from '@/data/products';
import gsap from 'gsap';

const AdminProducts: React.FC = () => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  useEffect(() => {
    gsap.fromTo('.product-item', 
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }
    );
  }, [viewMode]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Products Management</h1>
            <p className="text-gray-500 mt-1">Manage your product catalog</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl border transition-colors ${viewMode === 'grid' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#111111] border-white/5 text-gray-400 hover:text-white'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl border transition-colors ${viewMode === 'list' ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-[#111111] border-white/5 text-gray-400 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 12).map((product) => (
              <div 
                key={product.id} 
                className="product-item bg-[#111111] rounded-2xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
              >
                <div className="relative aspect-square bg-[#1a1a1a] p-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2.5 bg-white/10 rounded-xl hover:bg-orange-500 transition-colors">
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2.5 bg-white/10 rounded-xl hover:bg-blue-500 transition-colors">
                      <Edit2 className="w-5 h-5 text-white" />
                    </button>
                    <button className="p-2.5 bg-white/10 rounded-xl hover:bg-red-500 transition-colors">
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-medium text-white truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-orange-400">${product.price}</span>
                    <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">In Stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 10).map((product) => (
                  <tr key={product.id} className="product-item border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                        </div>
                        <span className="font-medium text-white truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 capitalize hidden md:table-cell">{product.category}</td>
                    <td className="p-4 font-bold text-orange-400">${product.price}</td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full text-sm">In Stock</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useInventory, DbProduct } from '@/hooks/useInventory';
import { 
  Package, AlertTriangle, TrendingDown, DollarSign, 
  Search, Edit2, Plus, Minus, Check, X, RefreshCw 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminInventory: React.FC = () => {
  const { 
    products, 
    loading, 
    lowStockProducts, 
    outOfStockProducts,
    totalInventoryValue,
    updateStock,
    updateLowStockThreshold,
    refetch
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [newThreshold, setNewThreshold] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (product: DbProduct) => {
    if (product.stock_quantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/20' };
    }
    if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: 'Low Stock', color: 'text-amber-400 bg-amber-500/20' };
    }
    return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-500/20' };
  };

  const handleEditClick = (product: DbProduct) => {
    setEditingProduct(product);
    setNewQuantity(product.stock_quantity);
    setNewThreshold(product.low_stock_threshold);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    setIsUpdating(true);
    const stockUpdated = await updateStock(editingProduct.id, newQuantity);
    if (stockUpdated && newThreshold !== editingProduct.low_stock_threshold) {
      await updateLowStockThreshold(editingProduct.id, newThreshold);
    }
    setIsUpdating(false);
    setEditingProduct(null);
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Out of Stock',
      value: outOfStockProducts.length,
      icon: TrendingDown,
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Inventory Value',
      value: `$${totalInventoryValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Inventory Management</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Track stock levels and manage inventory</p>
          </div>
          <Button
            onClick={refetch}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statsCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-[#111111] rounded-xl sm:rounded-2xl border border-white/5 p-3 sm:p-5"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-amber-400">Low Stock Alerts</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full"
                >
                  <span className="text-sm text-white">{product.name}</span>
                  <span className="text-xs text-amber-400 font-medium">
                    {product.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-[#111111] border-white/5 text-white placeholder:text-gray-500"
          />
        </div>

        {/* Inventory Table */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">SKU</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Threshold</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr
                      key={product.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                            <img
                              src={product.image || ''}
                              alt={product.name}
                              className="w-10 h-10 object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-medium text-white block truncate max-w-[200px]">
                              {product.name}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-400 font-mono text-sm hidden md:table-cell">
                        {product.sku || '-'}
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${product.stock_quantity === 0 ? 'text-red-400' : product.stock_quantity <= product.low_stock_threshold ? 'text-amber-400' : 'text-white'}`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 hidden sm:table-cell">
                        {product.low_stock_threshold}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(product)}
                          className="hover:bg-blue-500/20"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="bg-[#111111] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Update Stock</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <img
                    src={editingProduct.image || ''}
                    alt={editingProduct.name}
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-white">{editingProduct.name}</p>
                    <p className="text-sm text-gray-500">{editingProduct.sku}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Stock Quantity</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNewQuantity(Math.max(0, newQuantity - 1))}
                      className="border-white/10"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={newQuantity}
                      onChange={(e) => setNewQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-24 text-center bg-white/5 border-white/10"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNewQuantity(newQuantity + 1)}
                      className="border-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Low Stock Threshold</label>
                  <Input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 border-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                  >
                    {isUpdating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;

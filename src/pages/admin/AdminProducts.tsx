import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { products } from '@/data/products';

const AdminProducts: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-5 h-5" /> Add Product</button>
      </div>
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted"><tr className="text-left"><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Actions</th></tr></thead>
          <tbody>
            {products.slice(0, 8).map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-4 flex items-center gap-3"><img src={p.image} className="w-12 h-12 object-contain bg-muted rounded" />{p.name}</td>
                <td className="p-4 capitalize">{p.category}</td>
                <td className="p-4 font-bold">${p.price}</td>
                <td className="p-4"><span className="text-success">In Stock</span></td>
                <td className="p-4 flex gap-2"><button className="p-2 hover:bg-muted rounded-lg"><Edit className="w-4 h-4" /></button><button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
);

export default AdminProducts;

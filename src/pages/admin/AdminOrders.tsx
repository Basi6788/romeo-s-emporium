import React from 'react';
import AdminLayout from '@/components/AdminLayout';

const AdminOrders: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders Management</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <p className="text-muted-foreground text-center py-12">No orders yet. Orders will appear here when customers place them.</p>
      </div>
    </div>
  </AdminLayout>
);

export default AdminOrders;

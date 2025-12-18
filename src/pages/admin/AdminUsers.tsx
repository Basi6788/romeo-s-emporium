import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users } from 'lucide-react';

const AdminUsers: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users Activity</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="text-center py-12"><Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">User activity tracking coming soon.</p></div>
      </div>
    </div>
  </AdminLayout>
);

export default AdminUsers;

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Shield, CheckCircle } from 'lucide-react';

const AdminSecurity: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Web Security</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {['SSL Certificate', 'Firewall', 'DDoS Protection', 'Data Encryption'].map(item => (
          <div key={item} className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4">
            <Shield className="w-10 h-10 text-success" />
            <div><h3 className="font-bold">{item}</h3><p className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="w-4 h-4 text-success" /> Active</p></div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminSecurity;

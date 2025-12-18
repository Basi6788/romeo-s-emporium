import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings } from 'lucide-react';

const AdminLoginControl: React.FC = () => (
  <AdminLayout>
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Login Controllers</h1>
      <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-4">
        {['Two-Factor Authentication', 'Password Policy', 'Session Timeout', 'Login Attempts Limit'].map(item => (
          <div key={item} className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <span className="font-medium">{item}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default AdminLoginControl;

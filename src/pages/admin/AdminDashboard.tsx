import React from 'react';
import { TrendingUp, Package, Users, DollarSign, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminLayout from '@/components/AdminLayout';

const salesData = [
  { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 },
];

const recentOrders = [
  { id: '#12345', status: 'Completed', amount: 129.99 },
  { id: '#12346', status: 'Processing', amount: 89.99 },
  { id: '#12347', status: 'Shipped', amount: 249.99 },
];

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Sales', value: '$12,345', icon: DollarSign, change: '+12%' },
    { label: 'Orders', value: '156', icon: ShoppingCart, change: '+8%' },
    { label: 'Products', value: '89', icon: Package, change: '+5%' },
    { label: 'Users', value: '1,234', icon: Users, change: '+15%' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, change }) => (
            <div key={label} className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-sm text-success flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> {change}
                </span>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h3 className="font-bold mb-4">Sales Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-6">
            <h3 className="font-bold mb-4">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <h3 className="font-bold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <span className="font-medium">{order.id}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                }`}>{order.status}</span>
                <span className="font-bold">${order.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

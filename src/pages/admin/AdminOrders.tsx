import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Package, Truck, CheckCircle, Clock, Search, Filter, MoreHorizontal } from 'lucide-react';
import gsap from 'gsap';

const orders = [
  { id: '#ORD-001', customer: 'John Doe', email: 'john@example.com', total: 299.99, status: 'Delivered', date: '2024-01-15', items: 3 },
  { id: '#ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 149.50, status: 'Processing', date: '2024-01-14', items: 2 },
  { id: '#ORD-003', customer: 'Mike Johnson', email: 'mike@example.com', total: 599.00, status: 'Shipped', date: '2024-01-13', items: 5 },
  { id: '#ORD-004', customer: 'Sarah Wilson', email: 'sarah@example.com', total: 89.99, status: 'Pending', date: '2024-01-12', items: 1 },
  { id: '#ORD-005', customer: 'Alex Brown', email: 'alex@example.com', total: 450.00, status: 'Delivered', date: '2024-01-11', items: 4 },
];

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Delivered: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle },
  Processing: { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Clock },
  Shipped: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Truck },
  Pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Clock },
};

const AdminOrders: React.FC = () => {
  useEffect(() => {
    gsap.fromTo('.order-row', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  const stats = [
    { label: 'Total Orders', value: '156', change: '+12 today', icon: Package, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Processing', value: '23', change: '5 pending', icon: Clock, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Shipped', value: '45', change: 'On the way', icon: Truck, gradient: 'from-orange-500 to-amber-500' },
    { label: 'Delivered', value: '88', change: 'This month', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Orders Management</h1>
            <p className="text-gray-500 mt-1">Track and manage customer orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, gradient }) => (
            <div key={label} className="bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-emerald-400 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#111111] border border-white/5 rounded-xl text-gray-400 hover:text-white hover:border-white/10 transition-colors">
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Order ID</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={order.id} className="order-row border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-white">{order.id}</span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-white">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                      </td>
                      <td className="p-4 text-gray-400 hidden md:table-cell">{order.date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white">${order.total.toFixed(2)}</span>
                        <p className="text-xs text-gray-500">{order.items} items</p>
                      </td>
                      <td className="p-4">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;

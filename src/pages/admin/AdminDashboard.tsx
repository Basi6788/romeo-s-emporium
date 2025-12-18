import React, { useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Package, Users, DollarSign, ShoppingCart, Plus, ChevronRight, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const salesData = [
  { name: 'Jan', sales: 50 },
  { name: 'Tue', sales: 120 },
  { name: 'Wed', sales: 280 },
  { name: 'Thu', sales: 180 },
  { name: 'Fri', sales: 350 },
  { name: 'Sat', sales: 280 },
];

const analyticsData = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 65 },
  { name: 'Wed', value: 85 },
  { name: 'Thu', value: 55 },
  { name: 'Fri', value: 95 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 80 },
];

const recentOrders = [
  { id: '#12345', status: 'Completed', statusColor: 'emerald', icon: '🛒' },
  { id: '#12346', status: 'Completed', statusColor: 'emerald', icon: '📦' },
  { id: '#12347', status: 'Completed', statusColor: 'orange', icon: '📱' },
];

const AdminDashboard: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stat-card', 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }
      );
      gsap.fromTo('.chart-card',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' }
      );
      gsap.fromTo('.order-item',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  const stats = [
    { label: 'Total Sales', value: '$12,345', icon: DollarSign, change: '+12%', up: true, gradient: 'from-orange-500 to-amber-500' },
    { label: 'Orders', value: '156', icon: ShoppingCart, change: '+8%', up: true, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Products', value: '89', icon: Package, change: '+5%', up: true, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Users', value: '1,234', icon: Users, change: '-2%', up: false, gradient: 'from-rose-500 to-pink-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
          </div>
          <Link 
            to="/admin/products" 
            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl font-medium text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, change, up, gradient }) => (
            <div 
              key={label} 
              className="stat-card bg-[#111111] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`flex items-center gap-1 text-sm font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {change}
                </span>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div ref={chartRef} className="grid lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="chart-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Sales Overview</h3>
              <button className="text-sm text-gray-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                View Details <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1a1a1a', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="url(#lineGradient)" 
                  strokeWidth={3}
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders */}
          <div className="chart-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Recent Orders</h3>
              <Link to="/admin/orders" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order, i) => (
                <div 
                  key={order.id} 
                  className="order-item flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-xl hover:bg-[#222] transition-colors cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    order.statusColor === 'emerald' ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                  }`}>
                    {order.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{order.id}</p>
                    <p className="text-sm text-gray-500">Compiled</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    order.statusColor === 'emerald' 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {order.statusColor === 'emerald' ? 'Green' : 'Orange'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="chart-card bg-[#111111] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Analytics</h3>
              <p className="text-sm text-gray-500">Total sales this week</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">$1,238.00</p>
              <p className="text-sm text-emerald-400">+15% from last week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={analyticsData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="value" 
                fill="url(#barGradient)" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="lg:hidden">
          <Link 
            to="/admin/products" 
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl font-medium text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

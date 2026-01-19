import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Package, Users, DollarSign, ShoppingCart, Plus, ChevronRight, ArrowUpRight, RefreshCw, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { useOrdersSubscription } from '@/hooks/useRealtimeOrders';

const COLORS = ['#f97316', '#22c55e', '#8b5cf6', '#06b6d4'];

const AdminDashboard: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const { orders, loading } = useOrdersSubscription();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Update timestamp when orders change
  useEffect(() => {
    if (orders.length > 0) {
      setLastUpdate(new Date());
    }
  }, [orders]);

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

  // Calculate real-time analytics
  const analytics = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    // Group orders by date for charts
    const ordersByDate = orders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[date]) {
        acc[date] = { count: 0, sales: 0 };
      }
      acc[date].count += 1;
      acc[date].sales += Number(order.total);
      return acc;
    }, {} as Record<string, { count: number; sales: number }>);

    const salesData = Object.entries(ordersByDate).map(([name, data]) => ({
      name,
      sales: data.sales,
      orders: data.count
    })).slice(-7);

    // Status distribution for pie chart
    const statusData = [
      { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
      { name: 'Processing', value: orders.filter(o => o.status === 'processing').length },
      { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
      { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
    ].filter(d => d.value > 0);

    // Hourly orders for today
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      const count = todayOrders.filter(o => {
        const orderHour = new Date(o.created_at).getHours();
        return orderHour === i;
      }).length;
      return { hour: `${hour}:00`, orders: count };
    }).filter((_, i) => i <= new Date().getHours() + 1);

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      salesData,
      statusData,
      hourlyData,
      avgOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    };
  }, [orders]);

  const stats = [
    { 
      label: 'Total Sales', 
      value: `$${analytics.totalSales.toFixed(2)}`, 
      icon: DollarSign, 
      change: 'Live', 
      up: true, 
      gradient: 'from-orange-500 to-amber-500',
      live: true
    },
    { 
      label: 'Orders', 
      value: analytics.totalOrders.toString(), 
      icon: ShoppingCart, 
      change: `${analytics.pendingOrders} pending`, 
      up: true, 
      gradient: 'from-emerald-500 to-teal-500',
      live: true
    },
    { 
      label: 'Avg Order', 
      value: `$${analytics.avgOrderValue.toFixed(2)}`, 
      icon: TrendingUp, 
      change: 'Per order', 
      up: true, 
      gradient: 'from-violet-500 to-purple-500',
      live: false
    },
    { 
      label: 'Delivered', 
      value: analytics.deliveredOrders.toString(), 
      icon: Package, 
      change: 'Completed', 
      up: true, 
      gradient: 'from-cyan-500 to-blue-500',
      live: false
    },
  ];

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order.id.slice(0, 8),
    customer: order.customer_name,
    total: Number(order.total),
    status: order.status,
    time: new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }));

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-purple-500/20 text-purple-400',
    delivered: 'bg-emerald-500/20 text-emerald-400'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Sales Dashboard</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Real-time data •</span> Updated {lastUpdate.toLocaleTimeString()}
            </p>
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
        <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, change, up, gradient, live }) => (
            <div 
              key={label} 
              className="stat-card bg-[#111111] rounded-xl sm:rounded-2xl border border-white/5 p-3 sm:p-5 hover:border-white/10 transition-all group relative overflow-hidden"
            >
              {live && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] sm:text-xs text-emerald-400">LIVE</span>
                </div>
              )}
              <div className="flex items-start justify-between mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-3xl font-bold text-white">{loading ? '...' : value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{label}</p>
              <p className="text-[10px] sm:text-xs text-emerald-400 mt-1 sm:mt-2 hidden sm:block">{change}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div ref={chartRef} className="grid lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="chart-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Sales Overview</h3>
                <p className="text-sm text-gray-500">Revenue by day</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span className="text-sm">Live</span>
              </div>
            </div>
            {analytics.salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.salesData}>
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
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1a1a1a', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
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
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                No sales data yet
              </div>
            )}
          </div>

          {/* Order Status Distribution */}
          <div className="chart-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Order Status</h3>
                <p className="text-sm text-gray-500">Distribution breakdown</p>
              </div>
            </div>
            {analytics.statusData.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <ResponsiveContainer width="100%" height={140} className="sm:!w-1/2 sm:!h-[180px]">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={55}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a1a', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full sm:flex-1 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-3">
                  {analytics.statusData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs sm:text-sm text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-gray-500">
                No orders yet
              </div>
            )}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Activity */}
          <div className="chart-card bg-[#111111] rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-white">Today's Activity</h3>
                <p className="text-xs sm:text-sm text-gray-500">Orders by hour</p>
              </div>
            </div>
            {analytics.hourlyData.length > 0 && analytics.hourlyData.some(d => d.orders > 0) ? (
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={analytics.hourlyData.slice(-12)}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 9 }}
                    interval={3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1a1a1a', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-gray-500 text-xs sm:text-sm">
                No orders today yet
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="chart-card lg:col-span-2 bg-[#111111] rounded-xl sm:rounded-2xl border border-white/5 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-sm sm:text-lg font-bold text-white">Recent Orders</h3>
                {orders.length > 0 && (
                  <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] sm:text-xs font-medium">
                    {orders.length}
                  </span>
                )}
              </div>
              <Link to="/admin/orders" className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-2">
                {recentOrders.slice(0, 3).map((order, i) => (
                  <div 
                    key={order.id} 
                    className="order-item flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-[#1a1a1a] rounded-lg sm:rounded-xl hover:bg-[#222] transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate text-xs sm:text-sm">{order.customer}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">#{order.id}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium capitalize ${statusColors[order.status]} hidden sm:inline-flex`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm">${order.total.toFixed(2)}</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-white transition-colors hidden sm:block" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[120px] sm:h-[200px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No orders yet</p>
                </div>
              </div>
            )}
          </div>
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

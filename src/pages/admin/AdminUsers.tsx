import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, UserCheck, UserX, Activity, Search, MoreHorizontal, Mail, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

const activityData = [
  { value: 20 }, { value: 45 }, { value: 30 }, { value: 60 }, 
  { value: 40 }, { value: 70 }, { value: 55 }, { value: 80 },
  { value: 65 }, { value: 90 }, { value: 75 }, { value: 85 },
];

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', lastActive: '2 mins ago', orders: 12, spent: 1299.99, avatar: '👨' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', lastActive: '15 mins ago', orders: 8, spent: 899.50, avatar: '👩' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'Inactive', lastActive: '2 days ago', orders: 3, spent: 299.00, avatar: '👨‍💼' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'Active', lastActive: '1 hour ago', orders: 15, spent: 2199.99, avatar: '👩‍💻' },
  { id: 5, name: 'Alex Brown', email: 'alex@example.com', status: 'Pending', lastActive: 'Never', orders: 0, spent: 0, avatar: '🧑' },
];

const AdminUsers: React.FC = () => {
  useEffect(() => {
    gsap.fromTo('.user-row', 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  const stats = [
    { label: 'Total Users', value: '1,234', change: '+89 this month', icon: Users, gradient: 'from-violet-500 to-purple-500' },
    { label: 'Active Users', value: '956', change: '78% of total', icon: UserCheck, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Inactive Users', value: '278', change: '22% of total', icon: UserX, gradient: 'from-rose-500 to-pink-500' },
    { label: 'Online Now', value: '127', change: 'Real-time', icon: Activity, gradient: 'from-orange-500 to-amber-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users Activity</h1>
          <p className="text-gray-500 mt-1">Monitor user engagement and activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, gradient }) => (
            <div key={label} className="bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xs text-emerald-400 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Activity Chart */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">User Activity Trend</h3>
            <span className="text-sm text-gray-500">Last 12 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#activityGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>

        {/* Users Table */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden md:table-cell">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden lg:table-cell">Last Active</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Orders</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Total Spent</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="user-row border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xl">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                        user.status === 'Inactive' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 hidden lg:table-cell">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {user.lastActive}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-white">{user.orders}</td>
                    <td className="p-4 font-bold text-orange-400 hidden sm:table-cell">${user.spent.toFixed(2)}</td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;

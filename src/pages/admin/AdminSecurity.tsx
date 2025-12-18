import React, { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Shield, Lock, AlertTriangle, CheckCircle, Eye, Key, Globe, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

const threatData = [{ value: 5 }, { value: 12 }, { value: 8 }, { value: 15 }, { value: 10 }, { value: 3 }, { value: 7 }, { value: 2 }];

const securityLogs = [
  { type: 'success', message: 'Successful login from 192.168.1.1', time: '2 mins ago', icon: CheckCircle },
  { type: 'warning', message: 'Multiple failed login attempts', time: '15 mins ago', icon: AlertTriangle },
  { type: 'info', message: 'New device added', time: '1 hour ago', icon: Globe },
  { type: 'success', message: 'Security scan completed', time: '3 hours ago', icon: Shield },
];

const AdminSecurity: React.FC = () => {
  useEffect(() => {
    gsap.fromTo('.security-card', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.1 });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-white">Web Security</h1><p className="text-gray-500 mt-1 text-sm sm:text-base">Monitor and protect your platform</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label: 'Security Score', value: '94%', icon: Shield, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Threats Blocked', value: '127', icon: Lock, gradient: 'from-orange-500 to-amber-500' },
            { label: 'Active Sessions', value: '3', icon: Activity, gradient: 'from-violet-500 to-purple-500' },
            { label: 'API Keys', value: '5', icon: Key, gradient: 'from-blue-500 to-cyan-500' }].map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="security-card bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}><Icon className="w-6 h-6 text-white" /></div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="security-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Threat Activity</h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={threatData}>
                <defs><linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} /><stop offset="100%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
                <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#threatGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="security-card bg-[#111111] rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[{ icon: Shield, label: 'Run Security Scan', color: 'emerald' }, { icon: Key, label: 'Rotate API Keys', color: 'orange' }, { icon: Lock, label: '2FA Settings', color: 'violet' }].map(({ icon: Icon, label, color }) => (
                <button key={label} className="w-full flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-xl hover:bg-white/5 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center`}><Icon className={`w-5 h-5 text-${color}-400`} /></div>
                  <span className="font-medium text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="security-card bg-[#111111] rounded-2xl border border-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Security Logs</h3>
          <div className="space-y-3">
            {securityLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#1a1a1a] rounded-xl">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${log.type === 'success' ? 'bg-emerald-500/20' : log.type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                  <log.icon className={`w-5 h-5 ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`} />
                </div>
                <div className="flex-1"><p className="text-white">{log.message}</p><p className="text-sm text-gray-500">{log.time}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurity;

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Shield, Globe, Clock, Ban, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import gsap from 'gsap';

const loginAttempts = [
  { email: 'john@example.com', ip: '192.168.1.100', status: 'Success', time: '2 mins ago', location: 'New York' },
  { email: 'unknown@test.com', ip: '203.0.113.42', status: 'Failed', time: '10 mins ago', location: 'Unknown' },
  { email: 'jane@example.com', ip: '192.168.1.105', status: 'Success', time: '25 mins ago', location: 'LA' },
  { email: 'admin@example.com', ip: '10.0.0.1', status: 'Blocked', time: '1 hour ago', location: 'Beijing' },
];

const AdminLoginControl: React.FC = () => {
  const [settings, setSettings] = useState({ twoFactor: true, ipWhitelist: false, sessionTimeout: 30, maxAttempts: 5 });

  useEffect(() => {
    gsap.fromTo('.control-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl sm:text-3xl font-bold text-white">Login Control</h1><p className="text-gray-500 mt-1 text-sm sm:text-base">Manage authentication settings</p></div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[{ label: 'Two-Factor', icon: Shield, color: 'violet', value: settings.twoFactor, key: 'twoFactor' },
            { label: 'IP Whitelist', icon: Globe, color: 'orange', value: settings.ipWhitelist, key: 'ipWhitelist' }].map(({ label, icon: Icon, color, value, key }) => (
            <div key={label} className="control-card bg-[#111111] rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-6 h-6 text-${color}-400`} />
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={value} onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })} className="sr-only peer" />
                  <div className={`w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${color}-500`}></div>
                </label>
              </div>
              <p className="font-medium text-white">{label}</p>
            </div>
          ))}
          <div className="control-card bg-[#111111] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4"><Clock className="w-6 h-6 text-emerald-400" /><span className="text-lg font-bold text-white">{settings.sessionTimeout}m</span></div>
            <p className="font-medium text-white">Session Timeout</p>
          </div>
          <div className="control-card bg-[#111111] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center justify-between mb-4"><Ban className="w-6 h-6 text-rose-400" /><span className="text-lg font-bold text-white">{settings.maxAttempts}</span></div>
            <p className="font-medium text-white">Max Attempts</p>
          </div>
        </div>

        <div className="control-card bg-[#111111] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-white">Login Attempts</h3><button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" />Refresh</button></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-white/5"><th className="text-left p-3 text-sm text-gray-500">Email</th><th className="text-left p-3 text-sm text-gray-500 hidden md:table-cell">IP</th><th className="text-left p-3 text-sm text-gray-500">Status</th><th className="text-left p-3 text-sm text-gray-500">Time</th></tr></thead>
              <tbody>
                {loginAttempts.map((a, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-white">{a.email}</td>
                    <td className="p-3 text-gray-400 font-mono text-sm hidden md:table-cell">{a.ip}</td>
                    <td className="p-3"><span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${a.status === 'Success' ? 'bg-emerald-500/20 text-emerald-400' : a.status === 'Failed' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{a.status === 'Success' ? <CheckCircle className="w-3 h-3" /> : a.status === 'Failed' ? <XCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}{a.status}</span></td>
                    <td className="p-3 text-gray-500 text-sm">{a.time}</td>
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

export default AdminLoginControl;

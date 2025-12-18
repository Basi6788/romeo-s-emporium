import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Bot, Send, Sparkles, Zap, Brain, MessageCircle } from 'lucide-react';
import gsap from 'gsap';

const suggestions = [
  { icon: '📊', text: 'Analyze sales trends' },
  { icon: '🎯', text: 'Suggest marketing strategies' },
  { icon: '📦', text: 'Optimize inventory' },
  { icon: '👥', text: 'User behavior insights' },
];

const AdminAI: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  useEffect(() => {
    gsap.fromTo('.ai-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 });
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'This is a demo response. Connect to an AI service for real responses.' }]);
    }, 1000);
    setInput('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Assistant</h1>
            <p className="text-gray-500 text-sm sm:text-base">Powered by advanced AI</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[{ label: 'AI Queries', value: '47', icon: MessageCircle, gradient: 'from-violet-500 to-purple-500' },
            { label: 'Insights', value: '12', icon: Brain, gradient: 'from-orange-500 to-amber-500' },
            { label: 'Automations', value: '8', icon: Zap, gradient: 'from-emerald-500 to-teal-500' }].map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="ai-card bg-[#111111] rounded-2xl border border-white/5 p-3 sm:p-5">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-2 sm:mb-3`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden">
          <div className="h-[350px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-[#1a1a1a] text-gray-300'}`}>
                  {msg.role === 'assistant' && <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-violet-400" /><span className="text-sm font-medium text-violet-400">AI</span></div>}
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-white/5 flex gap-2 overflow-x-auto">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => setInput(s.text)} className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-full text-sm text-gray-400 hover:text-white whitespace-nowrap">{s.icon} {s.text}</button>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 flex gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none" />
            <button onClick={handleSend} className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl text-white"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAI;

import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Bot, Send } from 'lucide-react';

const AdminAI: React.FC = () => {
  const [message, setMessage] = React.useState('');
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <div className="bg-card rounded-2xl border border-border/50 p-6 min-h-[400px] flex flex-col">
          <div className="flex-1 flex items-center justify-center text-muted-foreground"><Bot className="w-16 h-16 mr-4" /><span>AI Assistant ready to help with your store management.</span></div>
          <div className="flex gap-2 mt-4">
            <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask anything..." className="input-field flex-1" />
            <button className="btn-primary"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAI;

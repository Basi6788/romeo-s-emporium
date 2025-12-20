// src/pages/MepcoBill.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Search, Zap, Calendar, User, AlertTriangle } from 'lucide-react';

const MepcoBill = () => {
  const [refNo, setRefNo] = useState('');
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBill(null);

    // Basic check: 14 numbers hone chahiye
    if (refNo.length !== 14) {
      setError('Bhai 14 number ka reference code daalo.');
      return;
    }

    setLoading(true);

    try {
      // Ye tumhari apni API ko call karega jo humne Step 1 me banayi
      // Note: '/api/bill' Vercel par automatic chalega
      const response = await fetch(`/api/bill?refNo=${refNo}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kuch masla ho gaya hai.');
      }

      setBill(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white pb-24 transition-colors">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-lg">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            MEPCO Bill Check
          </h1>
          <p className="text-gray-500 mt-2">Reference number likh kar bill dekhein</p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={checkBill}>
            <input
              type="number"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="Ex: 15123456789012"
              className="w-full bg-gray-100 dark:bg-[#0f172a] p-4 rounded-xl text-center text-lg tracking-widest font-mono border border-transparent focus:border-purple-500 focus:outline-none"
            />
            
            <button
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <><Search size={20}/> Check Bill</>}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle size={16}/> {error}
            </div>
          )}
        </div>

        {/* Bill Result Card */}
        {bill && (
          <div className="mt-8 animate-fade-in-up">
            <div className="relative bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white">
                <p className="text-purple-200 text-xs font-bold uppercase tracking-wider">Payable Amount</p>
                <h2 className="text-4xl font-bold mt-1">{bill.payableAmount}</h2>
                <p className="text-sm mt-2 opacity-80">Due Date: {bill.dueDate}</p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="bg-purple-100 dark:bg-gray-800 p-3 rounded-full">
                    <User className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-lg">{bill.consumerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="bg-blue-100 dark:bg-gray-800 p-3 rounded-full">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Month</p>
                    <p className="font-semibold text-lg">{bill.billMonth}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500">After Due Date:</span>
                  <span className="font-bold text-red-500 text-lg">{bill.payableAfterDueDate}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MepcoBill;


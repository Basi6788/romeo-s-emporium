// File: src/pages/MepcoBill.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Search, User, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';

const MepcoBill = () => {
  const [refNo, setRefNo] = useState('');
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBill(null);

    if (refNo.length !== 14) {
      setError('Please enter a valid 14-digit Reference Number.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/bill?refNo=${refNo}`);
      const textData = await response.text();
      
      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        throw new Error("Server Error");
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bill.');
      }

      setBill(data);
    } catch (err: any) {
      console.error(err);
      setError('Automatic fetch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white pb-24 transition-colors">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            MEPCO Online Bill
          </h1>
          <p className="text-gray-500 mt-2">Enter 14-digit reference number</p>
        </div>

        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={checkBill}>
            <input
              type="number"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="Ex: 15123456789012"
              className="w-full bg-gray-100 dark:bg-[#0f172a] p-4 rounded-xl text-center text-lg tracking-widest font-mono border border-transparent focus:border-purple-500 focus:outline-none dark:text-white"
            />
            
            <button
              disabled={loading}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : <><Search size={20}/> Check Bill</>}
            </button>
          </form>

          {/* FALLBACK BUTTON AGAR ERROR AYE */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                <AlertTriangle size={18} />
                <span className="font-semibold text-sm">Server Busy</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                Official server slow hai. Aap direct link se check kar sakte hain:
              </p>
              <a 
                href={`https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-white rounded-lg transition-colors text-sm font-medium"
              >
                Open Official Website <ExternalLink size={14}/>
              </a>
            </div>
          )}
        </div>

        {bill && (
          <div className="mt-8 animate-fade-in-up">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30">
              <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 text-white">
                <p className="text-purple-200 text-xs font-bold uppercase tracking-wider">Payable Amount</p>
                <h2 className="text-4xl font-bold mt-1">{bill.payableAmount}</h2>
                <p className="text-sm mt-2 opacity-80">Due Date: {bill.dueDate}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="bg-purple-100 dark:bg-gray-800 p-3 rounded-full">
                    <User className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Consumer Name</p>
                    <p className="font-semibold text-lg capitalize">{bill.consumerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="bg-blue-100 dark:bg-gray-800 p-3 rounded-full">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bill Month</p>
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

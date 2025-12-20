import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Search, FileText, Zap, Calendar, User, MapPin, AlertCircle } from 'lucide-react';

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
      setError('Invalid Format: 14 Digits required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bill?refNo=${refNo}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Server Error');
      
      setBill(data);
    } catch (err: any) {
      setError('Connection Failed. Try again or open official site.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white pb-24">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* Search Section */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-purple-100 dark:border-gray-800 mb-6">
            <h1 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">MEPCO Bill Check</h1>
            <form onSubmit={checkBill} className="relative">
                <input
                    type="number"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="Enter 14-digit Reference No"
                    className="w-full bg-gray-100 dark:bg-[#0f172a] py-4 px-4 rounded-xl text-center text-lg font-mono tracking-widest border focus:border-purple-500 outline-none"
                />
                <button 
                    disabled={loading}
                    className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2"
                >
                    {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Get Bill Details'}
                </button>
            </form>
            {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-center text-sm">
                    {error} <br/>
                    <a href={`https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`} target="_blank" className="underline font-bold">Open Official Link</a>
                </div>
            )}
        </div>

        {/* DETAILED BILL RECEIPT (A to Z Text) */}
        {bill && (
          <div className="animate-fade-in-up space-y-4">
            
            {/* 1. Header & Amount */}
            <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-purple-200 text-xs font-bold uppercase tracking-wider">Payable Amount</p>
                        <h2 className="text-4xl font-bold mt-1">Rs {bill.charges.totalPayable}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-purple-200 text-xs">Due Date</p>
                        <p className="font-bold text-lg">{bill.billing.dueDate}</p>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 flex justify-between text-sm">
                    <span>After Due Date:</span>
                    <span className="font-bold text-red-200">Rs {bill.charges.totalAfterDue}</span>
                </div>
            </div>

            {/* 2. Consumer Info */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <User size={16}/> Consumer Information
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between border-b dark:border-gray-800 pb-2">
                        <span className="text-gray-500 text-sm">Name</span>
                        <span className="font-semibold text-right w-2/3">{bill.info.name}</span>
                    </div>
                    <div className="flex justify-between border-b dark:border-gray-800 pb-2">
                        <span className="text-gray-500 text-sm">Ref No</span>
                        <span className="font-mono font-semibold">{bill.info.refNo}</span>
                    </div>
                    <div className="flex justify-between border-b dark:border-gray-800 pb-2">
                        <span className="text-gray-500 text-sm">Address</span>
                        <span className="font-medium text-xs text-right w-2/3 text-gray-600 dark:text-gray-300">{bill.info.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-xs text-gray-500">Tariff</p>
                            <p className="font-semibold">{bill.info.tariff}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Load</p>
                            <p className="font-semibold">{bill.info.load}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Meter & Units */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <Zap size={16}/> Reading Details
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                        <p className="text-xs text-blue-600 dark:text-blue-400">Month</p>
                        <p className="font-bold text-blue-700 dark:text-blue-300">{bill.billing.month}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                        <p className="text-xs text-purple-600 dark:text-purple-400">Units</p>
                        <p className="font-bold text-purple-700 dark:text-purple-300 text-xl">{bill.billing.units}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                        <p className="text-xs text-green-600 dark:text-green-400">Reading</p>
                        <p className="font-bold text-green-700 dark:text-green-300">{bill.billing.presReading}</p>
                    </div>
                </div>
            </div>

            {/* 4. Bill Breakdown */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <FileText size={16}/> Charges Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Cost of Electricity</span>
                        <span className="font-semibold">{bill.charges.cost}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">GST / Tax</span>
                        <span className="font-semibold">{bill.charges.gst}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">TV Fee</span>
                        <span className="font-semibold">{bill.charges.tvFee}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">F.C Surcharge</span>
                        <span className="font-semibold">{bill.charges.fpa}</span>
                    </div>
                    <div className="border-t dark:border-gray-700 my-2"></div>
                    <div className="flex justify-between text-base font-bold text-purple-600">
                        <span>Total Payable</span>
                        <span>{bill.charges.totalPayable}</span>
                    </div>
                </div>
            </div>

          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MepcoBill;

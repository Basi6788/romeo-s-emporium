import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { Search, FileText, Zap, Calendar, User, MapPin, AlertCircle, Clock, History } from 'lucide-react';

// Type definition taake humein pata ho backend se kya data aana chahiye
interface BillData {
  status: boolean;
  info: {
    name: string;
    refNo: string;
    address: string;
    tariff: string;
    load: string;
    connectionDate: string; // New
    feederName: string;     // New
    division: string;       // New
  };
  billing: {
    month: string;
    dueDate: string;
    readingDate: string;
    issueDate: string;
    units: string;
    presReading: string;
    prevReading: string;
    meterNo: string;
  };
  charges: {
    costOfElectricity: string;
    gst: string;
    tvFee: string;
    electricityDuty: string; // New
    fcSurcharge: string;     // New
    qtrTariffAdj: string;    // New
    totalPayable: string;
    totalAfterDue: string;
  };
  history: Array<{           // New: Last 12 months history
    month: string;
    units: string;
    bill: string;
    payment: string;
  }>;
}

const MepcoBill = () => {
  const [refNo, setRefNo] = useState('');
  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBill(null);

    // Basic Validation
    if (refNo.length !== 14) {
      setError('Invalid Format: 14 Digits required');
      return;
    }

    setLoading(true);
    try {
      // Backend call
      const response = await fetch(`/api/bill?refNo=${refNo}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Bill not found or Server Error');
      
      setBill(data);
    } catch (err: any) {
      console.error(err);
      setError('Connection Failed. Please check reference number or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white pb-24 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        
        {/* === SEARCH SECTION === */}
        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-lg border border-purple-100 dark:border-gray-800 mb-6">
            <h1 className="text-2xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              MEPCO Online Bill
            </h1>
            <form onSubmit={checkBill} className="relative">
                <input
                    type="number"
                    value={refNo}
                    onChange={(e) => setRefNo(e.target.value)}
                    placeholder="Reference No (14 digits)"
                    className="w-full bg-gray-100 dark:bg-[#0f172a] py-4 px-4 rounded-2xl text-center text-xl font-mono tracking-widest border-2 border-transparent focus:border-purple-500 outline-none transition-all"
                />
                <button 
                    disabled={loading}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-500/30 flex justify-center items-center gap-2"
                >
                    {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : 'Check Bill Details'}
                </button>
            </form>
            
            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl text-center text-sm">
                    <p className="font-bold flex justify-center items-center gap-2">
                      <AlertCircle size={16}/> {error}
                    </p>
                    <a href={`https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`} target="_blank" rel="noreferrer" className="block mt-2 text-indigo-600 dark:text-indigo-400 underline font-semibold">
                      Open Official Website
                    </a>
                </div>
            )}
        </div>

        {/* === BILL DETAILS (A to Z Text) === */}
        {bill && (
          <div className="animate-fade-in-up space-y-5">
            
            {/* 1. HERO: AMOUNT & STATUS */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Payable Amount</p>
                            <h2 className="text-4xl font-extrabold">Rs {bill.charges.totalPayable}</h2>
                        </div>
                        <div className="text-right bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                            <p className="text-xs font-medium">Due Date</p>
                            <p className="font-bold text-lg">{bill.billing.dueDate}</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-white/20 pt-4">
                        <span className="opacity-90">Late Payment:</span>
                        <span className="font-bold text-red-100 text-lg">Rs {bill.charges.totalAfterDue}</span>
                    </div>
                </div>
            </div>

            {/* 2. CONSUMER & METER INFO (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Consumer Info */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <User size={14} className="text-purple-500"/> Consumer Info
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Name</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{bill.info.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Address</p>
                            <p className="font-medium text-gray-700 dark:text-gray-300 truncate">{bill.info.address}</p>
                        </div>
                        <div className="flex justify-between pt-2">
                           <div>
                               <p className="text-gray-500 text-xs">Ref No</p>
                               <p className="font-mono font-bold text-xs">{bill.info.refNo}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-gray-500 text-xs">Division</p>
                               <p className="font-bold text-xs">{bill.info.division}</p>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Technical Info */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500"/> Meter Technical
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Feeder</p>
                            <p className="font-semibold">{bill.info.feederName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-xs">Tariff</p>
                            <p className="font-semibold">{bill.info.tariff}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Load</p>
                            <p className="font-semibold">{bill.info.load}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-xs">Meter No</p>
                            <p className="font-mono font-semibold">{bill.billing.meterNo}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. READINGS & UNITS */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <Clock size={14} className="text-blue-500"/> Reading Details ({bill.billing.month})
                </h3>
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Previous</p>
                        <p className="font-bold text-gray-700 dark:text-gray-300">{bill.billing.prevReading}</p>
                    </div>
                    <div className="text-center px-4 border-x border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-purple-600 font-bold mb-1">UNITS</p>
                        <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{bill.billing.units}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Present</p>
                        <p className="font-bold text-gray-700 dark:text-gray-300">{bill.billing.presReading}</p>
                    </div>
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-500 px-2">
                    <span>Reading Date: {bill.billing.readingDate}</span>
                    <span>Issue Date: {bill.billing.issueDate}</span>
                </div>
            </div>

            {/* 4. BILL HISTORY (12 Months) - As requested "A to Z" */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                 <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <History size={14} className="text-green-500"/> 12 Months History
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800/50 uppercase">
                            <tr>
                                <th className="px-3 py-2 rounded-l-lg">Month</th>
                                <th className="px-3 py-2">Units</th>
                                <th className="px-3 py-2">Bill</th>
                                <th className="px-3 py-2 rounded-r-lg text-right">Payment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {bill.history && bill.history.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                    <td className="px-3 py-2 font-medium">{item.month}</td>
                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.units}</td>
                                    <td className="px-3 py-2 font-bold text-gray-800 dark:text-gray-200">{item.bill}</td>
                                    <td className="px-3 py-2 text-right">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {item.payment}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 5. DETAILED CHARGES BREAKDOWN */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                    <FileText size={14} className="text-indigo-500"/> Charges Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Cost of Electricity</span>
                        <span className="font-medium text-gray-900 dark:text-white">{bill.charges.costOfElectricity}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Electricity Duty</span>
                        <span className="font-medium text-gray-900 dark:text-white">{bill.charges.electricityDuty}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>TV Fee</span>
                        <span className="font-medium text-gray-900 dark:text-white">{bill.charges.tvFee}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>GST</span>
                        <span className="font-medium text-gray-900 dark:text-white">{bill.charges.gst}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>F.C. Surcharge</span>
                        <span className="font-medium text-gray-900 dark:text-white">{bill.charges.fcSurcharge}</span>
                    </div>
                    {bill.charges.qtrTariffAdj && (
                         <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Qtr Tariff Adj</span>
                            <span className="font-medium text-gray-900 dark:text-white">{bill.charges.qtrTariffAdj}</span>
                        </div>
                    )}
                    
                    <div className="border-t border-dashed border-gray-300 dark:border-gray-700 my-3 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-purple-600">Total Payable</span>
                            <span className="text-xl font-black text-purple-700 dark:text-purple-400">{bill.charges.totalPayable}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center pb-6 text-xs text-gray-400">
                <p>Designed for Basit Shop</p>
            </div>

          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MepcoBill;

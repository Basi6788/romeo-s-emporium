import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Terminal, Smartphone, Activity, 
  Cpu, Wifi, Server, HardDrive, MessageSquare,
  Play, Thermometer, Upload, Download
} from 'lucide-react';
import { gsap } from 'gsap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const HackerDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [systemStats, setSystemStats] = useState({
    cpu: 32,
    ram: 1.5,
    ramTotal: 3,
    disk: 4.6,
    diskTotal: 8,
    temp: 37,
    upload: 5.6,
    download: 3.2
  });
  
  const [processes, setProcesses] = useState({
    node: { cpu: 0.8, ram: 1.1, total: 34 },
    api: { cpu: 0.8, ram: 0.4, total: 0.4 },
    nginx: { cpu: 0, ram: 0.5, total: 0 },
    vite: { cpu: 0.1, ram: 0.1, total: 26.4 }
  });

  const [buildProgress, setBuildProgress] = useState(78);
  const [storageUsed, setStorageUsed] = useState(51);
  const [notifications, setNotifications] = useState(3);
  const [terminalLogs, setTerminalLogs] = useState([
    "[12:45:00] Server running...",
    "[12:45:15] Monitoring systems initialized",
    "[12:45:30] Network scan initiated",
    "[12:46:00] All services operational"
  ]);

  const headerRef = useRef(null);
  const scanLineRef = useRef(null);
  const progressBarsRef = useRef([]);

  // Chart data for CPU usage
  const [cpuData, setCpuData] = useState({
    labels: ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30'],
    datasets: [
      {
        label: 'CPU Usage %',
        data: [25, 30, 45, 32, 28, 35, 32],
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  });

  // Initialize animations
  useEffect(() => {
    // Header scan line animation
    gsap.to(scanLineRef.current, {
      x: '100%',
      duration: 2,
      repeat: -1,
      ease: 'none'
    });

    // Progress bar animations
    progressBarsRef.current.forEach(bar => {
      if (bar) {
        gsap.fromTo(bar,
          { width: '0%' },
          {
            width: bar.style.width,
            duration: 1.5,
            ease: 'power2.out'
          }
        );
      }
    });

    // Pulsing elements
    gsap.to('.pulse-element', {
      opacity: 0.6,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Floating animation for network icon
    gsap.to('.floating-icon', {
      y: -10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    return () => {
      gsap.killTweensOf(scanLineRef.current);
      gsap.killTweensOf('.pulse-element');
      gsap.killTweensOf('.floating-icon');
    };
  }, []);

  // Update time and simulate real-time data
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
      
      // Simulate real-time data updates
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(20, prev.cpu + (Math.random() * 4 - 2))),
        ram: Math.min(prev.ramTotal, prev.ram + (Math.random() * 0.2 - 0.1)),
        temp: Math.min(45, Math.max(35, prev.temp + (Math.random() * 0.5 - 0.25))),
        upload: Math.min(10, Math.max(2, prev.upload + (Math.random() * 0.5 - 0.25))),
        download: Math.min(8, Math.max(1, prev.download + (Math.random() * 0.5 - 0.25)))
      }));

      // Update CPU chart data
      setCpuData(prev => {
        const newLabels = [...prev.labels.slice(1), 
          new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0,5)];
        const newData = [...prev.datasets[0].data.slice(1), 
          Math.floor(Math.random() * (45 - 25 + 1) + 25)];
        
        return {
          labels: newLabels,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });

      // Add new terminal log occasionally
      if (Math.random() > 0.7) {
        setTerminalLogs(prev => {
          const newLogs = [...prev, 
            `[${new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0,8)}] System update processed`];
          return newLogs.slice(-4); // Keep only last 4 logs
        });
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatBytes = (bytes) => {
    return `${bytes.toFixed(1)} MB/s`;
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 overflow-hidden selection:bg-green-900 selection:text-white">
      {/* Top Header */}
      <div 
        ref={headerRef}
        className="border-2 border-green-600 bg-green-900/10 p-4 mb-6 relative overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.3)]"
      >
        <div 
          ref={scanLineRef}
          className="absolute top-0 left-0 w-full h-[2px] bg-green-500"
          style={{ transform: 'translateX(-100%)' }}
        ></div>
        <h1 className="text-xl md:text-3xl font-bold text-center tracking-widest uppercase">
          ★ SYSTEM STATUS ★
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* SYSTEM STATUS */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg shadow-[0_0_10px_rgba(0,255,255,0.1)]">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <ShieldCheck className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">SYSTEM STATUS</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">ONLINE</div>
            <div className="text-xs text-gray-500 tracking-widest">SECURE CONNECTION ESTABLISHED</div>
            <div className="mt-4 text-center text-lg font-bold">
              {formatTime(time)}
            </div>
          </div>

          {/* ENVIRONMENT */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <Smartphone className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">ENVIRONMENT</span>
            </div>
            <div className="space-y-2">
              <div className="text-white">Termux / Android</div>
              <div className="text-xs text-gray-500">Kernel: Linux aarch64</div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Upload className="text-blue-400" size={16} />
                  <span>UPLOAD {systemStats.upload.toFixed(1)} kb/s</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="text-purple-400" size={16} />
                  <span>{systemStats.download.toFixed(1)} kb/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* BUILD ENGINE */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <Activity className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">BUILD ENGINE</span>
            </div>
            <div className="space-y-3">
              <div className="text-yellow-400">Vite v6.0</div>
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{buildProgress}% Build Progress</span>
                  <span className="text-xs">{buildProgress}%</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    ref={el => progressBarsRef.current[0] = el}
                    className="h-full bg-green-500"
                    style={{ width: `${buildProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">CPU:</div>
                  <div className="text-white">49%</div>
                </div>
                <div>
                  <div className="text-gray-500">SSD R/W:</div>
                  <div className="text-white">12.4 MBs</div>
                </div>
              </div>
            </div>
          </div>

          {/* STORAGE */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <HardDrive className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">STORAGE</span>
            </div>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs">{storageUsed}% Used</span>
                <span className="text-xs">{storageUsed}%</span>
              </div>
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  ref={el => progressBarsRef.current[1] = el}
                  className="h-full bg-cyan-500"
                  style={{ width: `${storageUsed}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* SERVER INFO */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <Server className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">SERVER INFO</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">CPU:</span>
                  <span className="text-green-400 font-bold">{systemStats.cpu.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden mt-1">
                  <div 
                    ref={el => progressBarsRef.current[2] = el}
                    className="h-full bg-green-500"
                    style={{ width: `${systemStats.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">RAM:</span>
                  <span className="text-green-400 font-bold">{systemStats.ram.toFixed(1)} GB / {systemStats.ramTotal} GB</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden mt-1">
                  <div 
                    ref={el => progressBarsRef.current[3] = el}
                    className="h-full bg-blue-500"
                    style={{ width: `${(systemStats.ram / systemStats.ramTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">DISK:</span>
                  <span className="text-green-400 font-bold">{systemStats.disk.toFixed(1)} GB / {systemStats.diskTotal} GB</span>
                </div>
                <div className="h-2 bg-gray-900 rounded-full overflow-hidden mt-1">
                  <div 
                    ref={el => progressBarsRef.current[4] = el}
                    className="h-full bg-purple-500"
                    style={{ width: `${(systemStats.disk / systemStats.diskTotal) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                <button className="flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded text-sm hover:bg-green-900/50 transition-colors">
                  <Play size={12} /> Restart
                </button>
                <div className="flex items-center gap-2 text-orange-400">
                  <Thermometer size={16} />
                  <span>{systemStats.temp.toFixed(0)}°C</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROCESS MONITOR */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <Activity className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">PROCESS MONITOR</span>
            </div>
            <div className="space-y-4">
              {Object.entries(processes).map(([name, stats], index) => (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 uppercase">{name}</span>
                    <span className="text-green-400 font-bold">{stats.total}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Cpu size={10} />
                      <span>CPU: {stats.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity size={10} />
                      <span>RAM: {stats.ram}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TERMINAL */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <Terminal className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">TERMINAL</span>
            </div>
            <div className="font-mono text-sm space-y-1">
              {terminalLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`${index === terminalLogs.length - 1 ? 'text-green-400' : 'text-gray-400'}`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* NOTIFICATIONS */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3 border-b border-cyan-800 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-cyan-400" size={20} />
                <span className="text-cyan-400 font-bold">NOTIFICATIONS</span>
              </div>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications} New
              </span>
            </div>
            <div className="text-sm text-gray-400">
              <div className="p-2 hover:bg-gray-900/50 cursor-pointer">• Security scan completed</div>
              <div className="p-2 hover:bg-gray-900/50 cursor-pointer">• System update available</div>
              <div className="p-2 hover:bg-gray-900/50 cursor-pointer">• New network device detected</div>
            </div>
          </div>

          {/* ADMIN PANEL */}
          <div className="border border-cyan-500/50 bg-black p-4 rounded-lg h-32">
            <div className="flex items-center gap-2 mb-3 border-b border-cyan-800 pb-2">
              <ShieldCheck className="text-cyan-400" size={20} />
              <span className="text-cyan-400 font-bold">ADMIN PANEL</span>
            </div>
            <div className="text-center text-gray-500 text-sm mt-4">
              [Access Level: Administrator]
            </div>
          </div>

          {/* SCAN NETLINK */}
          <div className="border-2 border-green-500/30 p-4 rounded-xl relative flex flex-col items-center justify-center bg-green-900/5">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-cyan-900/10 opacity-50"></div>
            <div className="flex items-center gap-2 mb-3 border-b border-green-800 pb-2 w-full">
              <Wifi className="text-yellow-500 floating-icon" size={20} />
              <span className="text-yellow-500 font-bold">SCAN NETLINK</span>
            </div>
            
            {/* CPU Usage Graph */}
            <div className="w-full h-48">
              <Line 
                data={cpuData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        color: 'rgba(0, 255, 0, 0.1)'
                      },
                      ticks: {
                        color: '#00ff00'
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 255, 0, 0.1)'
                      },
                      ticks: {
                        color: '#00ff00'
                      },
                      min: 0,
                      max: 100
                    }
                  },
                  elements: {
                    point: {
                      radius: 0
                    }
                  }
                }}
              />
            </div>

            <div className="mt-4 text-center text-cyan-400 text-sm font-mono">
              Monitoring Network Activity...
            </div>
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Cpu size={14} /> CPU LOAD
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-600 pulse-element"
                  style={{ width: `${systemStats.cpu}%` }}
                ></div>
              </div>
              <div className="text-right text-sm mt-1">{systemStats.cpu.toFixed(0)}%</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <Activity size={14} /> NETWORK
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 pulse-element"
                  style={{ width: `${(systemStats.upload / 10) * 100}%` }}
                ></div>
              </div>
              <div className="text-right text-sm mt-1">{systemStats.upload.toFixed(1)} kb/s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-xs text-gray-600 border-t border-gray-900 pt-4">
        SYSTEM DASHBOARD v2.0 | LAST UPDATE: {time.toLocaleDateString()} | ALL SYSTEMS OPERATIONAL
      </div>
    </div>
  );
};

export default HackerDashboard;

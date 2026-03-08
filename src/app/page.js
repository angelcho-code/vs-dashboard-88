"use client";

import { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, ShoppingCart, TrendingUp, Target, Moon, Sun, 
  Award, Zap, Calendar, BarChart3, Bot, AlertCircle, Sparkles, Lightbulb,
  Filter, LineChart as LineChartIcon, RefreshCw, Activity, Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  // Filters
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  
  // AI State
  const [aiModel, setAiModel] = useState('gemini-1.5-flash'); 
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sales');
      const rows = await response.json();
      // Add a mock status for filtering purposes based on revenue
      const enriched = rows.map(r => ({
        ...r,
        status: (r.revenue > 2000) ? 'High Priority' : (r.revenue > 1000 ? 'Standard' : 'Low Volume')
      }));
      setData(enriched);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      const channelMatch = selectedChannel === 'All Channels' || row.channel === selectedChannel;
      const productMatch = selectedProduct === 'All Products' || row.product === selectedProduct;
      return channelMatch && productMatch;
    });
  }, [data, selectedChannel, selectedProduct]);

  // KPI Calculations
  const kpis = useMemo(() => {
    let rev = 0, ord = 0, prof = 0;
    filteredData.forEach(row => {
      rev += (row.revenue || 0);
      ord += (row.orders || 0);
      prof += ((row.revenue || 0) - (row.cost || 0));
    });
    return {
      revenue: rev,
      orders: ord,
      profit: prof,
      aov: ord > 0 ? rev / ord : 0
    };
  }, [filteredData]);

  // Chart Data
  const chartData = useMemo(() => {
    const dailyMap = {};
    const sorted = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach(row => {
      if (!dailyMap[row.date]) dailyMap[row.date] = { date: row.date, revenue: 0, profit: 0 };
      dailyMap[row.date].revenue += (row.revenue || 0);
      dailyMap[row.date].profit += ((row.revenue || 0) - (row.cost || 0));
    });
    return Object.values(dailyMap);
  }, [filteredData]);

  // Filter Options
  const channels = useMemo(() => ['All Channels', ...new Set(data.map(i => i.channel))], [data]);
  const products = useMemo(() => ['All Products', ...new Set(data.map(i => i.product))], [data]);

  const generateAIInsights = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      alert("AI Key missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in environment variables.");
      return;
    }
    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: aiModel });
      const prompt = `Analyze this business data: Revenue: $${kpis.revenue}, Profit: $${kpis.profit}. Based on ${filteredData.length} records. Provide 2-3 short, actionable insights for "alerts", "opportunities", and "suggestions" in JSON format. Keep them very brief.`;
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || '{"alerts":[],"opportunities":[],"suggestions":[]}';
      setAiInsights(JSON.parse(jsonStr));
    } catch (e) { console.error(e); } finally { setAiLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0b0d11]">
        <div className="text-center animate-in fade-in duration-700">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-bold tracking-widest text-slate-400 uppercase">Synchronizing Data</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans bg-slate-50 dark:bg-[#0b0d11] transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Advanced Filters */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tighter dashboard-title">Dashboard Matrix</h1>
              <p className="mt-2 text-sm dashboard-text-muted font-semibold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Supabase Engine: active
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white dark:bg-[#15191f] border border-slate-200 dark:border-slate-800/50 rounded-2xl px-4 py-2.5 shadow-sm">
                <Filter size={14} className="text-indigo-500 mr-3" />
                <select 
                  value={selectedChannel} 
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="bg-transparent text-xs font-black dashboard-title outline-none uppercase tracking-wider"
                >
                  {channels.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center bg-white dark:bg-[#15191f] border border-slate-200 dark:border-slate-800/50 rounded-2xl px-4 py-2.5 shadow-sm">
                <Layers size={14} className="text-indigo-500 mr-3" />
                <select 
                  value={selectedProduct} 
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="bg-transparent text-xs font-black dashboard-title outline-none uppercase tracking-wider"
                >
                  {products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <button 
                onClick={toggleDarkMode}
                className="p-3 bg-white dark:bg-[#15191f] border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm hover:shadow-lg transition-all text-slate-500 dark:text-slate-400 hover:text-indigo-500"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard icon={<DollarSign />} title="Net Revenue" value={formatCurrency(kpis.revenue)} trend="+12.5%" color="indigo" />
          <KpiCard icon={<ShoppingCart />} title="Total Orders" value={kpis.orders} trend="+5.2%" color="blue" />
          <KpiCard icon={<TrendingUp />} title="Gross Profit" value={formatCurrency(kpis.profit)} trend="+18.1%" color="emerald" />
          <KpiCard icon={<Target />} title="Conversion" value={formatCurrency(kpis.aov)} trend="-2.4%" color="amber" />
        </div>

        {/* Growth Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 dashboard-card p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#15191f] shadow-xl shadow-slate-200/50 dark:shadow-none h-[450px] flex flex-col group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold dashboard-title flex items-center gap-3">
                  <Activity size={24} className="text-indigo-500" />
                  Performance Growth
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Revenue vs Profit Analysis</p>
              </div>
              <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
                <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">30 Day Sync</p>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white dark:bg-[#1a1d23] p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{payload[0].payload.date}</p>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-indigo-500">Rev: {formatCurrency(payload[0].value)}</p>
                              <p className="text-sm font-bold text-emerald-500">Prf: {formatCurrency(payload[1].value)}</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <CartesianGrid strokeDasharray="1 10" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 800 }}
                    dy={15}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Area 
                    type="stepAfter" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={5} 
                    fill="url(#gradientRev)" 
                    animationDuration={2000}
                    strokeLinecap="round"
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="profit" 
                    stroke="#10b981" 
                    strokeWidth={5} 
                    fill="transparent" 
                    animationDuration={2500}
                    strokeLinecap="round"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
             <div className="dashboard-card p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/20 bg-amber-50/20 dark:bg-amber-900/5 group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200 dark:shadow-none">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold dashboard-title">Top Performance</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Best in Category</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-[#1a1d23] rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Champion Product</p>
                    <p className="text-sm font-black dashboard-title">{data.length > 0 ? [...data].sort((a,b)=>b.revenue-a.revenue)[0].product : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-white dark:bg-[#1a1d23] rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Channel</p>
                    <p className="text-sm font-black dashboard-title">{data.length > 0 ? [...data].sort((a,b)=>b.revenue-a.revenue)[0].channel : 'N/A'}</p>
                  </div>
                </div>
             </div>

             <div className="flex-1 dashboard-card p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-600 to-violet-700 text-white relative overflow-hidden flex flex-col justify-end gap-2 group cursor-pointer" onClick={generateAIInsights}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                  <Bot size={120} />
                </div>
                <h4 className="text-xl font-bold leading-tight">Generate<br/>Strategic IQ</h4>
                <p className="text-indigo-100 text-xs font-medium opacity-80">Leverage Gemini 1.5 Flash for deep business foresight.</p>
                <div className="mt-4 flex items-center gap-2 font-bold text-xs">
                  {aiLoading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                  {aiLoading ? "Calculating..." : "Click to Analyze"}
                </div>
             </div>
          </div>
        </div>

        {/* AI Reveal */}
        {aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700">
             <AiPanel icon={<AlertCircle className="text-red-500" />} title="System Alerts" items={aiInsights.alerts} grad="from-red-500/10" />
             <AiPanel icon={<TrendingUp className="text-emerald-500" />} title="Key Growth" items={aiInsights.opportunities} grad="from-emerald-500/10" />
             <AiPanel icon={<Lightbulb className="text-amber-500" />} title="Suggestions" items={aiInsights.suggestions} grad="from-amber-500/10" />
          </div>
        )}

        {/* Professional Ledger */}
        <div className="dashboard-card bg-white dark:bg-[#15191f] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800/50 rounded-[2rem] overflow-hidden">
           <div className="px-10 py-8 border-b border-inherit flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold dashboard-title">Verified Transactions</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Audit Trail • {filteredData.length} records</p>
              </div>
              <div className="flex gap-2">
                 <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"><BarChart3 size={14}/></div>
              </div>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    {["Entity Date", "Asset Name", "Category", "Revenue", "Profit", "Velocity"].map(h => (
                      <th key={h} className="px-10 py-5 text-left text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.03] transition-colors group">
                      <td className="px-10 py-6 whitespace-nowrap text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">{row.date}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-sm font-black dashboard-title">{row.product}</td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#1a1d23] dashboard-title">
                          {row.channel}
                        </span>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-indigo-500">{formatCurrency(row.revenue)}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-emerald-500">{formatCurrency(row.revenue - row.cost)}</td>
                      <td className="px-10 py-6 whitespace-nowrap">
                         <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((row.revenue/5000)*100, 100)}%` }} />
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ icon, title, value, trend, color }) {
  const colors = {
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="dashboard-card p-7 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#15191f] flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className={cn("p-4 rounded-2xl shadow-inner", colors[color])}>{icon}</div>
        <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg", trend.startsWith('+') ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10")}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-3xl font-black dashboard-title leading-none">{value}</h3>
      </div>
    </div>
  );
}

function AiPanel({ icon, title, items, grad }) {
  return (
    <div className={cn("p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#15191f] bg-gradient-to-b text-sm transition-all hover:shadow-xl", grad)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          {icon}
        </div>
        <h5 className="font-black dashboard-title uppercase tracking-widest text-[10px]">{title}</h5>
      </div>
      <ul className="space-y-4">
        {items.map((it, i) => (
          <li key={i} className="flex gap-4 group">
            <span className="block w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 group-hover:scale-125 transition-all" />
            <p className="text-xs font-bold dashboard-text-muted leading-relaxed">{it}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

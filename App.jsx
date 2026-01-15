import React, { useState } from 'react';
import { useCreditTracker } from './hooks/useCreditTracker';
import {
    CreditCard,
    PlusCircle,
    ArrowDownCircle,
    Calendar,
    History,
    Download,
    AlertCircle,
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    Settings,
    LogOut,
    Bell,
    Mail,
    User,
    Search,
    CheckCircle2,
    Clock,
    ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, parseISO, format } from 'date-fns';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const SidebarLink = ({ icon: Icon, label, active = false, badge }) => (
    <div className={cn(
        "flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group mb-1",
        active ? "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-blue-600 font-semibold" : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm"
    )}>
        <div className="flex items-center gap-3">
            <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                active ? "bg-blue-50" : "bg-transparent group-hover:bg-blue-50"
            )}>
                <Icon size={18} className={cn(active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600")} />
            </div>
            <span className="text-sm tracking-tight">{label}</span>
        </div>
        {badge && (
            <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {badge}
            </span>
        )}
    </div>
);

const StatCard = ({ title, value, icon: Icon, activeColor = false, trend }) => {
    return (
        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-50 group transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/5">
            <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12",
                    activeColor ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                )}>
                    <Icon size={24} strokeWidth={3} />
                </div>
                <span className="text-gray-400 text-sm font-bold tracking-tight uppercase">{title}</span>
            </div>
            <div className="flex items-end justify-between">
                <h4 className="text-[28px] font-black tracking-tighter text-gray-900 leading-none">
                    {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AZN
                </h4>
                <div className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-gray-50 text-blue-600">
                    {trend.split(' ')[0]}
                </div>
            </div>
            <p className="text-[10px] text-gray-300 font-bold mt-4 uppercase tracking-widest leading-none">{trend.split(' ').slice(1).join(' ')}</p>
        </div>
    );
};

const DarkInput = ({ label, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">{label}</label>
        <input
            {...props}
            className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/20"
        />
    </div>
);

const App = () => {
    const { data, addWithdrawal, addPayment, stats } = useCreditTracker();
    const [formType, setFormType] = useState('withdraw');
    const [wForm, setWForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    const [pForm, setPForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0] });

    const handleWithdrawal = (e) => {
        e.preventDefault();
        if (!wForm.amount || !wForm.date) return;
        addWithdrawal(wForm.amount, wForm.date, wForm.note);
        setWForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (!pForm.amount || !pForm.date) return;
        addPayment(pForm.amount, pForm.date);
        setPForm({ amount: '', date: new Date().toISOString().split('T')[0] });
    };

    const exportToExcel = () => {
        const wsWithdrawals = XLSX.utils.json_to_sheet(data.withdrawals);
        const wsPayments = XLSX.utils.json_to_sheet(data.payments);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsWithdrawals, "Withdrawals");
        XLSX.utils.book_append_sheet(wb, wsPayments, "Payments");
        XLSX.writeFile(wb, "TeddyBills_FullReport.xlsx");
    };

    const formatCurrency = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' AZN';

    return (
        <div className="flex min-h-screen bg-[#F8F9FB] font-inter text-gray-900">
            {/* SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-[280px] bg-[#F3F4F6] border-r border-gray-100 p-8 space-y-10">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <CreditCard size={22} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter">Teddy Bills</span>
                </div>
                <nav className="flex-1 space-y-1 text-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-5">Main Menu</p>
                    <SidebarLink icon={LayoutDashboard} label="Home" active />
                    <SidebarLink icon={Mail} label="Message" badge="26" />
                    <SidebarLink icon={History} label="Analytics" />
                    <SidebarLink icon={ArrowUpRight} label="Transaction" />
                    <SidebarLink icon={ArrowDownLeft} label="Payment" badge="12" />
                </nav>
                <div className="space-y-1">
                    <SidebarLink icon={Settings} label="Setting" />
                    <SidebarLink icon={LogOut} label="Log out" />
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-[32px] font-bold tracking-tight leading-none mb-2">Welcome back</h1>
                        <p className="text-gray-400 text-sm font-medium">Your financial control center is ready.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input type="text" placeholder="Search data..." className="bg-white border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm w-64 shadow-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                        </div>
                        <div className="flex items-center gap-3 bg-white p-1.5 pr-5 rounded-2xl shadow-sm border border-gray-50">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <img src="https://ui-avatars.com/api/?name=Eddie+Lake&background=2563eb&color=fff" alt="Avatar" className="rounded-xl" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold leading-none mb-1">Eddie Lake</p>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase">Finance Pro</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <StatCard title="Total Debt" value={stats.totalDebt} icon={ArrowUpRight} trend="7.4% then last month" activeColor />
                    <StatCard title="Available Balance" value={stats.creditBalance} icon={ArrowDownLeft} trend="3.4% then last month" />
                    <StatCard title="Net Remaining" value={stats.netDebt} icon={LayoutDashboard} trend="11.4% then last month" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-10">
                        {/* LARGE BALANCE DISPLAY */}
                        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-50">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Current Net Debt</p>
                                    <h3 className="text-[42px] font-black tracking-tighter leading-none">{formatCurrency(stats.netDebt)}</h3>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div><span className="text-[10px] uppercase font-black text-gray-400">Activity</span></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-200"></div><span className="text-[10px] uppercase font-black text-gray-400">History</span></div>
                                </div>
                            </div>
                            <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-gray-50 pb-4">
                                {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75].map((h, i) => (
                                    <div key={i} className="flex-1 flex gap-1 items-end group">
                                        <div className="flex-1 bg-gray-100 rounded-t-lg group-hover:bg-blue-100 transition-colors" style={{ height: `${h * 0.6}%` }}></div>
                                        <div className="flex-1 bg-blue-600/20 rounded-t-lg group-hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }}></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-gray-300 mt-4 px-4 uppercase tracking-widest">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => <span key={m}>{m}</span>)}
                            </div>
                        </div>

                        {/* TRANSACTIONS TABLE */}
                        <div className="bg-white p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                                <div className="flex bg-[#F3F4F6] p-1.5 rounded-2xl">
                                    <button className="px-5 py-2 rounded-xl text-xs font-bold bg-white shadow-sm text-blue-600">Newest</button>
                                    <button className="px-5 py-2 rounded-xl text-xs font-bold text-gray-400">Oldest</button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-300 text-[10px] uppercase font-black tracking-widest border-b border-gray-50">
                                            <th className="pb-6 px-4">Entity / Note</th>
                                            <th className="pb-6 px-4 text-center">Status</th>
                                            <th className="pb-6 px-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.withdrawals.slice(0, 5).map(w => (
                                            <tr key={w.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="py-6 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                            {w.note ? w.note[0].toUpperCase() : 'T'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm leading-none mb-1">{w.note || 'Regular Withdrawal'}</p>
                                                            <p className="text-[11px] text-gray-400 font-medium">{format(parseISO(w.date), 'dd MMM, yyyy')}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-6 px-4 text-center">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase",
                                                        w.remainingAmount === 0 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                                    )}>
                                                        {w.remainingAmount === 0 ? 'Settled' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-4 text-right font-black text-sm">{formatCurrency(w.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button className="w-full mt-6 py-4 border-t border-gray-50 text-[11px] font-black text-blue-600 hover:bg-gray-50 rounded-b-[40px] transition-all uppercase tracking-widest">
                                View Full History
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-10">
                        {/* ACTION CENTER */}
                        <div className="bg-black p-10 rounded-[40px] text-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold mb-8">Quick Entry</h4>
                                <div className="flex gap-2 mb-8 bg-white/10 p-1.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest">
                                    <button onClick={() => setFormType('withdraw')} className={cn("flex-1 py-3 rounded-xl transition-all", formType === 'withdraw' ? "bg-white text-black" : "text-white/40")}>Withdraw</button>
                                    <button onClick={() => setFormType('payment')} className={cn("flex-1 py-3 rounded-xl transition-all", formType === 'payment' ? "bg-white text-black" : "text-white/40")}>Payment</button>
                                </div>
                                {formType === 'withdraw' ? (
                                    <form onSubmit={handleWithdrawal} className="space-y-6">
                                        <DarkInput label="Date of Entity" type="date" value={wForm.date} onChange={e => setWForm({ ...wForm, date: e.target.value })} />
                                        <DarkInput label="Amount (AZN)" type="number" placeholder="0.00" value={wForm.amount} onChange={e => setWForm({ ...wForm, amount: e.target.value })} />
                                        <DarkInput label="Transaction Note" type="text" placeholder="Purpose..." value={wForm.note} onChange={e => setWForm({ ...wForm, note: e.target.value })} />
                                        <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                                            Confirm Entry
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handlePayment} className="space-y-6">
                                        <DarkInput label="Payment Date" type="date" value={pForm.date} onChange={e => setPForm({ ...pForm, date: e.target.value })} />
                                        <DarkInput label="Settlement Amount (AZN)" type="number" placeholder="0.00" value={pForm.amount} onChange={e => setPForm({ ...pForm, amount: e.target.value })} />
                                        <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                                            Process Payment
                                        </button>
                                    </form>
                                )}
                            </div>
                            {/* Subtle background decoration */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* SECONDARY ACTION */}
                        <div className="space-y-4">
                            <button
                                onClick={exportToExcel}
                                className="w-full py-5 bg-white border border-gray-100 rounded-[30px] text-[11px] font-black text-gray-400 shadow-sm uppercase tracking-[0.2em] hover:bg-gray-50 transition-all hover:text-blue-600 hover:border-blue-100"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Download size={16} /> Data Export (XLSX)
                                </div>
                            </button>
                            <div className="bg-blue-50 p-8 rounded-[40px] border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Monthly Tip</p>
                                <p className="text-sm font-semibold text-blue-900 leading-relaxed">Early settlements reduce long-term financial anxiety. Keep tracking!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;

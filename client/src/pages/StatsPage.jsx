import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../lib/axiosInstance';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Award, Zap } from 'lucide-react';

function StatBox({ label, value, icon, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            className="group relative p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden hover:border-white/20 transition-all font-sans"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] group-hover:bg-blue-500/10 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-6 border border-white/10">
                {icon}
            </div>
            <div>
                <p className="text-4xl font-black text-white mb-2 tracking-tighter">{value || '0%'}</p>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{label}</p>
            </div>
        </motion.div>
    );
}

function AvgBar({ label, value, color, delay }) {
    const val = value || 0;
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="space-y-3"
        >
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">{label}</span>
                <span className="text-white">{val}%</span>
            </div>
            <div className="h-4 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </motion.div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/20 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((p) => (
                        <div key={p.name} className="flex justify-between gap-8 items-center">
                            <span className="text-xs font-medium text-white/70">{p.name}</span>
                            <span className="text-xs font-bold" style={{ color: p.color }}>{p.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function StatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axiosInstance.get('/history/stats')
            .then(({ data }) => setStats(data))
            .catch((err) => setError(err.response?.data?.error || 'Failed to aggregate statistical data.'))
            .finally(() => setLoading(false));
    }, []);

    const chartData = stats?.recent?.map((r, i) => ({
        name: `Sess ${i + 1}`,
        Clarity: r.clarity || 0,
        Persuasion: r.persuasion || 0,
        Logic: r.logic || 0,
        Pro: r.professionalism || 0,
        Emotion: r.emotional || 0,
    })) || [];

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <div className="h-20" />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <motion.header
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-2 text-blue-500 mb-4">
                        <BarChart3 size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Aggregate Intelligence</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2">Visual <span className="text-white/30">Analytics.</span></h1>
                    <p className="text-lg text-white/40 font-medium max-w-2xl">High-fidelity data visualization tracking your progression toward rhetorical excellence.</p>
                </motion.header>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-white animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-white/20 animate-pulse">Synthesizing Data Layers</p>
                    </div>
                )}

                {error && (
                    <div className="p-10 rounded-[40px] bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && stats && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        {/* Summary boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatBox label="Total Sessions" value={stats.total || 0} icon={<TrendingUp size={24} />} delay={0} />
                            <StatBox label="Avg Progress" value={`${stats.avgProfessionalism || 0}%`} icon={<Award size={24} />} delay={0.1} />
                            <StatBox label="Logical Purity" value={`${stats.avgLogicalConsistency || 0}%`} icon={<Zap size={24} />} delay={0.2} />
                            <StatBox label="Emotional Control" value={`${100 - (stats.avgEmotionalIntensity || 0)}%`} icon={<Award size={24} />} delay={0.3} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-1 p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-10">Metric Averages</p>
                                <div className="space-y-8">
                                    <AvgBar label="Logic" value={stats.avgLogicalConsistency} color="#ffffff" delay={0.45} />
                                    <AvgBar label="Clarity" value={stats.avgClarity} color="rgba(255,255,255,0.6)" delay={0.5} />
                                    <AvgBar label="Professionalism" value={stats.avgProfessionalism} color="#3b82f6" delay={0.55} />
                                    <AvgBar label="Persuasion" value={stats.avgPersuasion} color="#8b5cf6" delay={0.6} />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                className="lg:col-span-2 p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-10">Performance Trends</p>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} barSize={8} barGap={4}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 800 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                            <Bar dataKey="Logic" fill="#ffffff" radius={[10, 10, 0, 0]} />
                                            <Bar dataKey="Pro" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                                            <Bar dataKey="Emotion" fill="#ef4444" radius={[10, 10, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {(stats.total === 0 || !stats.total) && (
                            <div className="flex flex-col items-center justify-center py-24 gap-6 bg-white/5 rounded-[40px] border border-white/10">
                                <span className="text-6xl">⚡</span>
                                <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Awaiting Initial Intelligence Data</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <div className="h-40" />
        </div>
    );
}

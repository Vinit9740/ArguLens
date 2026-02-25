import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../lib/axiosInstance';
import FallacyTag from '../components/FallacyTag';
import { Clock, Type, Mic, ChevronDown, Activity, ChevronRight } from 'lucide-react';

function ScoreBadge({ label, value, colorClass }) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colorClass}`}>
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span>
            <span className="text-[10px] font-bold">{value || 0}%</span>
        </div>
    );
}

function AnalysisCard({ analysis, index }) {
    const [open, setOpen] = useState(false);

    if (!analysis) return null;

    const date = analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : 'Unknown Date';

    const fallacies = analysis.fallacies || [];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
        >
            <div className="absolute left-[27px] top-10 bottom-0 w-px bg-white/5" />

            <div className="flex gap-8">
                <div className="relative mt-2">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${open ? 'bg-white border-white scale-110' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`}>
                        {analysis.inputType === 'voice' ?
                            <Mic size={20} className={open ? 'text-black' : 'text-white/40'} /> :
                            <Type size={20} className={open ? 'text-black' : 'text-white/40'} />
                        }
                    </div>
                </div>

                <div className="flex-1 pb-12">
                    <button
                        onClick={() => setOpen(!open)}
                        className="w-full text-left"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{date}</span>
                            <div className="h-px w-8 bg-white/5" />
                            {fallacies.length > 0 && (
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                    {fallacies.length} Critical Flaws
                                </span>
                            )}
                        </div>

                        <p className="text-lg font-medium text-white/90 leading-tight line-clamp-2 group-hover:text-white transition-colors mb-4 pr-12">
                            {analysis.argumentText || 'No text provided'}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <ScoreBadge label="Logic" value={analysis.logicalConsistencyScore} colorClass="bg-white/5 border-white/10 text-white" />
                            <ScoreBadge label="Pro" value={analysis.professionalismScore} colorClass="bg-blue-500/10 border-blue-500/20 text-blue-400" />
                            <ScoreBadge label="Clarity" value={analysis.clarityScore} colorClass="bg-white/5 border-white/10 text-white/60" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Perspective Analysis</h4>
                                            <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5 italic">
                                                "{analysis.argumentText || 'No text content available.'}"
                                            </p>
                                        </div>
                                        {fallacies.length > 0 && (
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Logical Violations</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {fallacies.map((f, i) => (
                                                        <FallacyTag key={i} name={f} index={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2">
                                                <Activity size={12} />
                                                Core Metrics
                                            </h4>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-2xl font-black">{analysis.persuasionScore || 0}%</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Persuasion</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black">{analysis.professionalismScore || 0}%</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Professionalism</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black uppercase">{analysis.tone || 'Neutral'}</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Tone Profile</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-black">{analysis.emotionalIntensityScore || 0}%</div>
                                                    <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Emotional Intensity</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="shrink-0 pt-2">
                    <ChevronRight className={`text-white/10 transition-transform duration-300 ${open ? 'rotate-90 text-white' : ''}`} />
                </div>
            </div>
        </motion.div>
    );
}

export default function HistoryPage() {
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosInstance.get(`/history?page=${page}&limit=10`);
            if (data?.analyses) {
                setAnalyses(data.analyses);
                setTotalPages(data.totalPages || 1);
            } else {
                setAnalyses([]);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load history.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            <div className="h-20" />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <motion.header
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-20"
                >
                    <div className="flex items-center gap-2 text-white/40 mb-4">
                        <Clock size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Temporal Intelligence</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">Coaching <span className="text-white/30">Timeline.</span></h1>
                    <p className="text-lg text-white/40 font-medium">A chronological view of your communication progress and analytical deep dives.</p>
                </motion.header>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-white animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest text-white/20">Retrieving Timeline</p>
                    </div>
                )}

                {error && (
                    <div className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
                        {error}
                    </div>
                )}

                {!loading && !error && (analyses?.length || 0) === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 gap-6 bg-white/5 rounded-[40px] border border-white/10"
                    >
                        <span className="text-6xl">📋</span>
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No Intelligence Data Recorded Yet</p>
                    </motion.div>
                )}

                <div className="space-y-0 relative">
                    {analyses?.map((a, i) => (
                        <AnalysisCard key={a.id || i} analysis={a} index={i} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-12 py-12 border-t border-white/5">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all border border-transparent hover:border-white/10"
                        >
                            Previous
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Page {page} / {totalPages}</span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 transition-all border border-transparent hover:border-white/10"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <div className="h-40" />
        </div>
    );
}

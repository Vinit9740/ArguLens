import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../lib/axiosInstance';
import ScoreCard from '../components/ScoreCard';
import FallacyTag from '../components/FallacyTag';
import AudioRecorder from '../components/AudioRecorder';
import RefinedResult from '../components/RefinedResult';
import { Type, Mic, Check, ChevronRight, Loader2, MessageSquare, BarChart3, Settings2 } from 'lucide-react';

const MAX_CHARS = 5000;

const FRAMEWORKS = [
    { id: 'CER', name: 'CER', desc: 'Claim → Evidence → Reasoning' },
    { id: 'PCS', name: 'PCS', desc: 'Problem → Cause → Solution' },
    { id: 'PAC', name: 'PAC', desc: 'Premise → Argument → Conclusion' }
];

export default function AnalyzerPage() {
    const [inputType, setInputType] = useState('text');
    const [text, setText] = useState('');
    const [framework, setFramework] = useState('CER');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleAnalyze = async (audioBlob = null, preTranscribedText = null, preCalculatedMetrics = null) => {
        if (inputType === 'text' && !text.trim()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('framework', framework);

            if (audioBlob) {
                formData.append('audio', audioBlob, 'argument.webm');
                if (preTranscribedText) formData.append('transcribedText', preTranscribedText);
                if (preCalculatedMetrics) formData.append('vocalMetrics', JSON.stringify(preCalculatedMetrics));
            } else {
                formData.append('text', text);
            }

            const { data } = await axiosInstance.post('/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data?.data) {
                setResult(data.data);
                if (data.data.argumentText) setText(data.data.argumentText);
            } else {
                setError('Unexpected response from AI service.');
            }
        } catch (err) {
            const errorData = err.response?.data;
            const msg = errorData?.details
                ? `${errorData.error} ${errorData.details}`
                : (errorData?.error || 'Analysis failed. Please ensure Ollama is running.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (txt) => {
        if (!txt) return;
        navigator.clipboard.writeText(txt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
            <div className="h-20" />

            <main className="max-w-6xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            ArguLens Intelligence V3
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[0.9]">
                            Communication <br />
                            <span className="text-white/40">Intelligence platform.</span>
                        </h1>
                        <p className="text-lg text-white/50 max-w-lg font-medium">
                            Evaluate logic, tone, and delivery. Receive structured framework coaching and professional rewrites—all locally.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
                            <button
                                onClick={() => setInputType('text')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputType === 'text' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                            >
                                <Type size={18} />
                                Text Input
                            </button>
                            <button
                                onClick={() => setInputType('voice')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${inputType === 'voice' ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                            >
                                <Mic size={18} />
                                Voice Analysis
                            </button>
                        </div>
                    </motion.div>
                </header>

                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                    <div className="lg:col-span-8 space-y-6">
                        {inputType === 'text' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-10 group-focus-within:opacity-20 transition" />
                                <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden focus-within:border-white/20 transition-all">
                                    <textarea
                                        value={text}
                                        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                                        placeholder="Articulate your argument here..."
                                        className="w-full h-64 bg-transparent p-8 text-lg text-white/90 placeholder-white/20 outline-none resize-none leading-relaxed"
                                    />
                                    <div className="flex items-center justify-between px-8 py-4 bg-white/5 border-t border-white/5">
                                        <span className="text-xs font-medium text-white/30 tracking-tight">
                                            {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                                        </span>
                                        <button
                                            onClick={() => handleAnalyze()}
                                            disabled={loading || text.trim().length < 5}
                                            className="px-8 py-3 rounded-2xl bg-white text-black text-sm font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-white/5"
                                        >
                                            {loading ? 'Analyzing...' : 'Analyze Logic'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <AudioRecorder onRecordingComplete={(blob, text, metrics) => handleAnalyze(blob, text, metrics)} />
                                <p className="mt-4 text-center text-sm text-white/30 font-medium">
                                    Record your argument for vocal delivery and structural assessment.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-6 text-white/90">
                                <Settings2 size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-widest">Coaching Setup</h3>
                            </div>

                            <div className="space-y-4">
                                <label className="block">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Structural Framework</span>
                                    <div className="grid grid-cols-1 gap-2 mt-2">
                                        {FRAMEWORKS.map(fw => (
                                            <button
                                                key={fw.id}
                                                onClick={() => setFramework(fw.id)}
                                                className={`text-left p-3 rounded-xl border transition-all ${framework === fw.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="text-xs font-bold text-white/90">{fw.name}</div>
                                                <div className="text-[10px] text-white/40">{fw.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {loading && (
                            <div className="p-8 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/20 animate-pulse flex flex-col items-center text-center">
                                <Loader2 className="animate-spin mb-4" />
                                <h4 className="font-bold mb-1">Local AI is thinking</h4>
                                <p className="text-xs text-blue-100/60 leading-relaxed">Deconstructing syntax and extracting logic layers...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1">Analysis Error</p>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                    </div>
                </section>

                <AnimatePresence>
                    {result && (
                        <motion.section
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <MessageSquare size={16} className="text-white/40" />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Initial Input</h3>
                                    </div>
                                    <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 min-h-[300px] text-lg text-white/70 leading-relaxed">
                                        {result.argumentText}
                                    </div>
                                </div>

                                <RefinedResult
                                    original={result.argumentText}
                                    refined={result.refinedVersion}
                                    tone={result.tone}
                                    onCopy={handleCopy}
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-1">
                                    <BarChart3 size={16} className="text-white/40" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Communication Metrics</h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <ScoreCard label="Clarity" score={result.clarityScore} delay={0} />
                                    <ScoreCard label="Logic" score={result.logicalConsistencyScore} delay={0.1} />
                                    <ScoreCard label="Persuasion" score={result.persuasionScore} delay={0.2} />
                                    <ScoreCard label="Professionalism" score={result.professionalismScore} delay={0.3} />
                                    <ScoreCard label="Emotional" score={result.emotionalIntensityScore} delay={0.4} />
                                </div>

                                {result.vocalMetrics && (
                                    <div className="p-8 rounded-[40px] bg-blue-500 text-white grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center shadow-2xl shadow-blue-500/20">
                                        <div>
                                            <div className="text-4xl font-black mb-1">{result.vocalMetrics.intensity}%</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Vocal Intensity</div>
                                        </div>
                                        <div className="border-y md:border-y-0 md:border-x border-white/20 py-4 md:py-0">
                                            <div className="text-4xl font-black mb-1">{result.vocalMetrics.speechRate}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Speech Rate</div>
                                        </div>
                                        <div>
                                            <div className="text-4xl font-black mb-1">{result.vocalMetrics.pauseFrequency}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Pause Frequency</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="p-10 rounded-[40px] bg-white/5 border border-white/10">
                                        <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                            Structural Critique
                                        </h4>
                                        <p className="text-white/70 leading-relaxed text-lg italic pr-12 mb-8">
                                            "{result.feedback?.structured_argument_feedback || 'No specific critique available.'}"
                                        </p>

                                        <div className="space-y-3">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Improvement Roadmap</div>
                                            {result.feedback?.communication_improvement_plan?.map((step, i) => (
                                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-center">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">{i + 1}</div>
                                                    <div className="text-sm font-medium text-white/90">{step}</div>
                                                </div>
                                            )) || <p className="text-xs text-white/20 italic">No roadmap generated.</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 min-h-full">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6 tracking-widest">Logic & Delivery</h4>
                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-xs text-white/30 mb-2 font-bold tracking-wider">Primary Tone</div>
                                                <div className="inline-block px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-sm uppercase">
                                                    {result.tone || 'Neutral'}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-white/30 mb-3 font-bold tracking-wider">Detected Fallacies</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(result.fallacies && result.fallacies.length > 0) ? result.fallacies.map((f, i) => (
                                                        <FallacyTag key={i} name={f} index={i} />
                                                    )) : <span className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest">No fallacies detected</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </main>

            <div className="h-40" />

            <AnimatePresence>
                {copied && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-white text-black rounded-full font-bold shadow-2xl flex items-center gap-3"
                    >
                        <Check size={20} className="text-green-500" />
                        Copied to Clipboard
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

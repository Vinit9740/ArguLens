import { motion } from 'framer-motion';

export default function RefinedResult({ original, refined, tone, onCopy }) {
    const hasContent = refined && refined.length > 5;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card overflow-hidden border-[var(--color-accent)]/30 ${!hasContent ? 'opacity-50 grayscale select-none cursor-not-allowed' : ''}`}
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-accent)]/5">
                <div className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                        <h3 className="text-sm font-bold text-[var(--color-text)] leading-none mb-1">Refined Argument</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold">Tone: {tone || 'Neutral'}</p>
                    </div>
                </div>
                {hasContent && (
                    <button
                        onClick={() => onCopy(refined)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                        title="Copy refined text"
                    >
                        <svg className="w-4 h-4 text-[var(--color-muted)] group-hover:text-[var(--color-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="p-6">
                <p className="text-[var(--color-text)] leading-relaxed text-lg italic pr-4">
                    {hasContent ? `"${refined}"` : "Synthesizing a more polished and professional version of your argument..."}
                </p>

                <div className="mt-6 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/10 animate-pulse'}`} />
                        <span className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-wider">
                            {hasContent ? 'Logically Perfected' : 'Refinement Pending'}
                        </span>
                    </div>
                    {hasContent && (
                        <p className="text-[10px] text-[var(--color-muted)]/60 max-w-[200px] text-right">
                            Fallacies removed and structural integrity verified by AI.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

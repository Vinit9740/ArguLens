import { motion } from 'framer-motion';

export default function ScoreCard({ label, score, icon, delay = 0 }) {
    const pct = Math.max(0, Math.min(100, Math.round(score || 0)));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="group relative p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-3xl overflow-hidden hover:border-white/20 transition-all"
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        {icon ? <span className="text-xl">{icon}</span> : <div className="w-5 h-5 rounded-full border border-white/20" />}
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">
                        {pct}<span className="text-[10px] uppercase font-black text-white/20 ml-1">%</span>
                    </div>
                </div>

                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">{label}</h4>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                        <motion.div
                            className="h-full rounded-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.02] transition-colors pointer-events-none" />
        </motion.div>
    );
}

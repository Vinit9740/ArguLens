import { motion } from 'framer-motion';

export default function LoadingDots({ label = 'Analyzing your argument…' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <motion.span
                        key={i}
                        className="w-3 h-3 rounded-full bg-[var(--color-accent)]"
                        animate={{
                            y: [0, -14, 0],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 1.1,
                            repeat: Infinity,
                            delay: i * 0.18,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
            <motion.p
                className="text-sm text-[var(--color-muted)] tracking-wide"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {label}
            </motion.p>
        </div>
    );
}

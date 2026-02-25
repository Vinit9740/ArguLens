import { motion } from 'framer-motion';

export default function SuggestionList({ suggestions }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <ul className="space-y-3">
            {suggestions.map((suggestion, i) => (
                <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.4, ease: 'easeOut' }}
                    className="flex gap-3 items-start"
                >
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                    </span>
                    <span className="text-sm text-[var(--color-muted)] leading-relaxed">{suggestion}</span>
                </motion.li>
            ))}
        </ul>
    );
}

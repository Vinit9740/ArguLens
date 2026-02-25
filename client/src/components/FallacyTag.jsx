import { motion } from 'framer-motion';

const fallacyColors = [
    'bg-red-500/10 text-red-400 border-red-500/20',
    'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20',
];

export default function FallacyTag({ name, index = 0, delay = 0 }) {
    const colorClass = fallacyColors[index % fallacyColors.length];

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: 'backOut' }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClass}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {name}
        </motion.span>
    );
}

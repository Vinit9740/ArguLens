import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
    { to: '/', label: 'Analyze' },
    { to: '/history', label: 'History' },
    { to: '/stats', label: 'Stats' },
];

export default function Navbar() {
    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl"
        >
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(124,111,255,0.4)] transition-shadow duration-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight text-[var(--color-text)]">
                        Argu<span className="gradient-text">Lens</span>
                    </span>
                </NavLink>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {links.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                                    : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </motion.header>
    );
}

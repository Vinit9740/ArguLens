import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card px-3 py-2 text-xs text-[var(--color-text)]">
                <strong>{payload[0].payload.subject}</strong>: {payload[0].value}
            </div>
        );
    }
    return null;
};

export default function ScoreChart({ clarity, persuasion, logic }) {
    const data = [
        { subject: 'Clarity', value: clarity, fullMark: 100 },
        { subject: 'Persuasion', value: persuasion, fullMark: 100 },
        { subject: 'Logic', value: logic, fullMark: 100 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-64"
        >
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#8888aa', fontSize: 12, fontFamily: 'Inter' }}
                    />
                    <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#7c6fff"
                        fill="#7c6fff"
                        fillOpacity={0.18}
                        strokeWidth={2}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

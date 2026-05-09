import { motion } from 'framer-motion';
import { AlertTriangle, Copy, TrendingUp } from 'lucide-react';

const SIMILAR_SCAMS = [
  {
    title: 'Telegram Internship Scams',
    description: 'Exploits students by promising paid internships via messaging apps.',
    risk: 'HIGH RISK',
  },
  {
    title: 'Fake HR WhatsApp Scams',
    description: 'Direct messages from "HR Managers" asking for sensitive data.',
    risk: 'HIGH RISK',
  },
  {
    title: 'Registration Fee Scams',
    description: "Mandatory 'processing fees' for jobs that do not exist.",
    risk: 'HIGH RISK',
  },
  {
    title: 'Fake Remote Job Scams',
    description: 'Highly lucrative work-from-home offers with zero entry barriers.',
    risk: 'HIGH RISK',
  },
];

export default function SimilarScams() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-white uppercase tracking-wide">Similar Scam Patterns</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">THREAT INTEL</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SIMILAR_SCAMS.map((scam, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.08, duration: 0.3 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-xl border border-slate-800/60 bg-slate-900/70 backdrop-blur-sm p-4 cursor-default group"
          >
            {/* Top row: badge + icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-500/40 bg-red-500/15 text-red-300 tracking-wider">
                {scam.risk}
              </span>
              <button
                className="p-1 rounded text-slate-600 hover:text-slate-400 transition-colors"
                title="Copy"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>

            <h4 className="text-xs font-semibold text-white mb-1.5 leading-snug">{scam.title}</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">{scam.description}</p>

            {/* Hover accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

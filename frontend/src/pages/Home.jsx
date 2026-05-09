import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  FileText, Image as ImageIcon, ShieldAlert, ArrowRight, Shield,
  Zap, Lock, Bot, Cpu, Activity, Globe, AlertTriangle,
  CheckCircle, TrendingUp, Users, ScanLine, ChevronRight,
  ShieldCheck, Radio
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Animated stat counter ─────────────────────────────────────────────
function StatCard({ value, label, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-4 flex items-center gap-4"
    >
      <div className={`p-2.5 rounded-lg border shrink-0 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-white leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Pipeline step ─────────────────────────────────────────────────────
function PipelineStep({ icon: Icon, label, desc, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.08, duration: 0.35 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors group"
    >
      <div className={`flex items-center justify-center w-7 h-7 rounded-lg border shrink-0 ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-300">{label}</p>
        <p className="text-[10px] text-slate-600">{desc}</p>
      </div>
      <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-slate-500 shrink-0 transition-colors" />
    </motion.div>
  );
}

// ─── Threat feed item ──────────────────────────────────────────────────
function FeedItem({ title, tag, time, variant, delay }) {
  const cls = variant === 'high'
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : variant === 'med'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between py-2.5 border-b border-slate-800/40 last:border-0 gap-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          variant === 'high' ? 'bg-red-400' : variant === 'med' ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className="text-xs text-slate-400 truncate">{title}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cls}`}>{tag}</span>
        <span className="text-[10px] text-slate-600 font-mono">{time}</span>
      </div>
    </motion.div>
  );
}

// ─── Action Card ───────────────────────────────────────────────────────
function ActionCard({ to, icon: Icon, iconColor, borderColor, bgColor, title, desc, badge, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <Link to={to} className="block h-full">
        <div className={`h-full rounded-xl border ${borderColor} ${bgColor} backdrop-blur-xl p-5 transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-lg border ${iconColor} shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            {badge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
            Launch <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
          {/* hover accent */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────
export default function Home() {
  const PIPELINE = [
    { icon: ScanLine,  label: 'OCR Extraction',      desc: 'EasyOCR text recognition from images',   color: 'bg-violet-500/10 border-violet-500/20 text-violet-400' },
    { icon: Cpu,       label: 'ML Classification',   desc: 'Random Forest + NLP scam detection',     color: 'bg-cyan-500/10   border-cyan-500/20   text-cyan-400'   },
    { icon: Activity,  label: 'Rule-Based Checks',   desc: 'URL, email, contact, domain signals',    color: 'bg-blue-500/10   border-blue-500/20   text-blue-400'   },
    { icon: Globe,     label: 'Domain Verification', desc: 'Live HTTPS & company lookup',            color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
    { icon: Bot,       label: 'Gemini AI Analysis',  desc: 'Deep reasoning + safety tips',           color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
    { icon: Shield,    label: 'Risk Score Fusion',   desc: 'Weighted composite final score',         color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  ];

  const FEED = [
    { title: 'Fake Amazon HR — WhatsApp registration scam', tag: 'HIGH',   variant: 'high', time: '2m ago'  },
    { title: 'Remote data-entry job with upfront fee',       tag: 'HIGH',   variant: 'high', time: '11m ago' },
    { title: 'Telegram internship — crypto wallet required', tag: 'HIGH',   variant: 'high', time: '28m ago' },
    { title: 'LinkedIn recruiter — suspicious .xyz domain',  tag: 'MEDIUM', variant: 'med',  time: '45m ago' },
    { title: 'Email job offer — verified company domain',    tag: 'CLEAR',  variant: 'safe', time: '1h ago'  },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 bg-cyber-grid py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Hero Row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-5"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"
              />
              ScamShield Intelligence · Live
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Detect Job Scams with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                AI Precision
              </span>
            </h1>
            <p className="text-sm text-slate-500 mb-6 max-w-xl leading-relaxed">
              Multi-layer threat detection using OCR, Machine Learning, real-time domain
              verification, and Google Gemini AI — all in under 10 seconds.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/text">
                  <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20 px-6 h-10 rounded-lg text-sm">
                    <FileText className="mr-2 h-4 w-4" /> Analyze Text
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link to="/image">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 px-6 h-10 rounded-lg text-sm">
                    <ImageIcon className="mr-2 h-4 w-4" /> Upload Screenshot
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-slate-800/60"
            >
              {[
                { icon: Shield,     label: 'Multi-Layer Detection' },
                { icon: Lock,       label: 'Privacy First'         },
                { icon: Zap,        label: 'Real-time Analysis'    },
                { icon: ShieldCheck, label: 'Gemini AI Powered'   },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <I className="h-3.5 w-3.5 text-cyan-500/50" /> {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Live Threat Feed */}
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Threat Feed</span>
              </div>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] text-red-400 font-bold"
              >
                LIVE
              </motion.span>
            </div>
            <div className="px-4 py-2">
              {FEED.map((f, i) => (
                <FeedItem key={i} {...f} delay={0.25 + i * 0.07} />
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-600 font-mono">Updated continuously · Community threat intel</p>
            </div>
          </motion.div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="12,480+"  label="Scams Detected"      icon={ShieldAlert}  color="bg-red-500/10 border-red-500/20 text-red-400"     delay={0.1} />
          <StatCard value="98.4%"    label="Detection Accuracy"  icon={TrendingUp}   color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" delay={0.15} />
          <StatCard value="< 10s"    label="Avg. Analysis Time"  icon={Zap}          color="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"    delay={0.2} />
          <StatCard value="5 Layers" label="Detection Methods"   icon={Cpu}          color="bg-violet-500/10 border-violet-500/20 text-violet-400" delay={0.25} />
        </div>

        {/* ── Action Cards + Pipeline ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

          {/* Action cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Start Analysis</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard
                to="/text"
                icon={FileText}
                iconColor="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                borderColor="border-slate-800/70 hover:border-cyan-500/25"
                bgColor="bg-slate-900/60"
                title="Text Analysis"
                desc="Paste any job description, email, WhatsApp or SMS message for instant AI-powered scam detection."
                badge="NLP + ML"
                delay={0.2}
              />
              <ActionCard
                to="/image"
                icon={ImageIcon}
                iconColor="bg-violet-500/10 border-violet-500/20 text-violet-400"
                borderColor="border-slate-800/70 hover:border-violet-500/25"
                bgColor="bg-slate-900/60"
                title="Screenshot Analysis"
                desc="Upload any screenshot — OCR extracts visible text and runs it through the full detection pipeline."
                badge="OCR + AI"
                delay={0.25}
              />
              <ActionCard
                to="/text"
                icon={ShieldAlert}
                iconColor="bg-red-500/10 border-red-500/20 text-red-400"
                borderColor="border-slate-800/70 hover:border-red-500/20"
                bgColor="bg-slate-900/60"
                title="Risk Assessment"
                desc="Get a detailed threat score, scam signals, and actionable safety tips with every analysis."
                delay={0.3}
              />
              <ActionCard
                to="/image"
                icon={Globe}
                iconColor="bg-blue-500/10 border-blue-500/20 text-blue-400"
                borderColor="border-slate-800/70 hover:border-blue-500/20"
                bgColor="bg-slate-900/60"
                title="Domain Verification"
                desc="Automatic live domain lookup, HTTPS validation, and company identity matching."
                delay={0.35}
              />
            </div>
          </div>

          {/* Detection Pipeline */}
          <motion.div
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
              <Activity className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detection Pipeline</span>
            </div>
            <div className="p-2">
              {PIPELINE.map((step, i) => (
                <PipelineStep key={i} {...step} index={i} />
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-800/50 flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-slate-500">All 6 layers run automatically on every scan</p>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom info strip ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20',
              title: 'Community-Powered', desc: 'Threat patterns sourced from thousands of real scam reports.'
            },
            {
              icon: Lock, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',
              title: 'Privacy First', desc: 'Your data is never stored or sold. Analysis happens in real-time.'
            },
            {
              icon: Zap, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20',
              title: 'Instant Results', desc: 'Full 5-layer analysis completes in under 10 seconds.'
            },
          ].map(({ icon: Icon, color, bg, title, desc }, i) => (
            <div key={i} className="rounded-xl border border-slate-800/60 bg-slate-900/50 p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg border shrink-0 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300 mb-0.5">{title}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}

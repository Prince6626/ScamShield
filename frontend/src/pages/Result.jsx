import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle, CheckCircle, ShieldAlert, ArrowLeft, Info, Shield,
  Lightbulb, ExternalLink, Mail, Globe, MessageCircle, Link2,
  Activity, Bot, Cpu, Flag, Building2, Search, Siren,
  Phone, FileText, Zap, AlertOctagon, Clock, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useSoundEffects } from '@/hooks/useSoundEffects';

// ─── Large Threat Gauge ────────────────────────────────────────────────
function ThreatGauge({ score, isHigh, isMed }) {
  const color = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#22c55e';
  const glow = isHigh ? 'rgba(239,68,68,0.5)' : isMed ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)';
  const size = 130;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(30,41,59,0.6)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ delay: 0.4, duration: 1.4, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}%</span>
        <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color }}>THREAT LEVEL</span>
      </div>
    </div>
  );
}

// ─── Mini Score Badge ──────────────────────────────────────────────────
function MiniScore({ label, value, max, unit = '' }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-white">
        {value}<span className="text-xs text-slate-500 font-normal">/{max}{unit}</span>
      </p>
    </div>
  );
}

// ─── System State Row ──────────────────────────────────────────────────
function StateRow({ label, status, delay }) {
  const done = status === 'COMPLETE' || status === 'GENERATED';
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
    >
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-[10px] font-bold tracking-wider ${
        status === 'GENERATED' ? 'text-cyan-400' : done ? 'text-emerald-400' : 'text-slate-500'
      }`}>{status}</span>
    </motion.div>
  );
}

// ─── Risk Progress Bar ─────────────────────────────────────────────────
function RiskBar({ label, score, maxScore, delay = 0 }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const riskLabel = pct > 60 ? 'HIGH' : pct > 30 ? 'MEDIUM' : 'LOW';
  const barColor = pct > 60 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#22c55e';
  const badgeCls = pct > 60
    ? 'bg-red-500/20 text-red-300 border-red-500/30'
    : pct > 30
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeCls}`}>{riskLabel}</span>
          <span className="text-[10px] font-mono text-slate-500">{score}/{maxScore}</span>
        </div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: barColor, boxShadow: `0 0 6px ${barColor}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Signal Badge ──────────────────────────────────────────────────────
function SignalBadge({ label, icon: Icon, variant = 'danger', delay = 0 }) {
  const cls = {
    danger: 'border-red-500/30 bg-red-500/10 text-red-300',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  }[variant];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${cls}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </motion.div>
  );
}

// ─── Web Verification Row ──────────────────────────────────────────────
function WebRow({ label, value, status }) {
  const statusCls = status === 'LIVE'
    ? 'bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded'
    : status === 'FAIL'
      ? 'text-red-400 font-bold text-xs'
      : null;

  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-800/50 last:border-0 gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-300 text-right break-all">{value}</span>
        {status && statusCls && <span className={statusCls}>{status}</span>}
      </div>
    </div>
  );
}

// ─── Panel Card ────────────────────────────────────────────────────────
function Panel({ title, icon: Icon, iconColor = 'text-cyan-400', children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

// ─── Main Result Component ─────────────────────────────────────────────
export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  const { playAlert, playSuccess } = useSoundEffects();
  const [hasPlayed, setHasPlayed] = useState(false);

  const mlScore      = result?.ml_score ?? Math.round((result?.scam_probability ?? 0) * 100);
  const verScore     = result?.verification_score ?? 0;
  const geminiScore  = result?.gemini_score ?? 0;
  const finalScore   = result?.final_score ?? Math.round((result?.scam_probability ?? 0) * 100);
  const risk         = result?.risk ?? result?.risk_level ?? 'Unknown';
  const flags        = result?.flags ?? [];
  const isScam       = result?.prediction === 'Scam';
  const probability  = ((result?.scam_probability ?? 0) * 100).toFixed(1);
  const isHigh       = finalScore > 70;
  const isMed        = finalScore > 40 && !isHigh;

  const emailScore    = result?.email_score ?? 0;
  const urlScore      = result?.url_score ?? 0;
  const contactScore  = result?.contact_score ?? 0;
  const webVerification = result?.website_verification;

  useEffect(() => {
    if (result && !hasPlayed) {
      setHasPlayed(true);
      setTimeout(() => { isHigh ? playAlert() : playSuccess(); }, 600);
    }
  }, [result, isHigh, playAlert, playSuccess, hasPlayed]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-4">
        <ShieldAlert className="h-16 w-16 text-slate-600" />
        <h2 className="text-2xl font-bold text-white">No result found</h2>
        <p className="text-slate-400">Run an analysis first to see results here.</p>
        <Link to="/"><Button className="bg-cyan-600 hover:bg-cyan-500 text-white">Go Home</Button></Link>
      </div>
    );
  }

  const riskColor   = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#22c55e';
  const riskBg      = isHigh ? 'bg-red-500/15 border-red-500/30 text-red-300'
                             : isMed ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                             : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
  const threatLabel = isHigh ? 'Critical Threat Detected' : isMed ? 'Moderate Risk Detected' : 'Low Risk — Likely Safe';

  // Build signal badges from flags
  const signalIcons = { mail: Mail, globe: Globe, phone: Phone, msg: MessageCircle, link: Link2, file: FileText };
  const signalVariants = { danger: 'danger', warn: 'warn', info: 'info' };

  const systemStates = [
    { label: 'Analyzing text:', status: 'COMPLETE' },
    { label: 'Extracting OCR:', status: result?.extracted_text ? 'COMPLETE' : 'N/A' },
    { label: 'Verifying Domain:', status: webVerification ? 'COMPLETE' : 'COMPLETE' },
    { label: 'Risk Modeling:', status: 'COMPLETE' },
    { label: 'Final Report:', status: 'GENERATED' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 bg-cyber-grid">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Scam Analysis Result</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ScamShield completed analysis using OCR, ML, Verification Engine, and Gemini AI.
          </p>
        </motion.div>

        {/* ── Row 1: Hero Card + System State ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

          {/* Hero score card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`rounded-xl border bg-slate-900/70 backdrop-blur-xl overflow-hidden ${
              isHigh ? 'border-red-500/25 pulse-ring' : isMed ? 'border-amber-500/20' : 'border-emerald-500/20'
            }`}
          >
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <ThreatGauge score={finalScore} isHigh={isHigh} isMed={isMed} />

              <div className="flex-1 sm:border-l sm:border-slate-800/60 sm:pl-6">
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-2 ${riskBg}`}>
                  {isHigh ? <AlertOctagon className="h-3 w-3" /> : isMed ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                  {isHigh ? 'High Risk' : isMed ? 'Medium Risk' : 'Low Risk'}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{threatLabel}</h2>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">ML Detection</p>
                    <p className="text-base font-bold text-white">{mlScore}<span className="text-xs text-slate-500">/100</span></p>
                  </div>
                  <div className="text-center border-x border-slate-800/50">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Verification</p>
                    <p className="text-base font-bold text-white">{verScore}<span className="text-xs text-slate-500">/100</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Gemini AI</p>
                    <p className="text-base font-bold text-white">{geminiScore}<span className="text-xs text-slate-500">/10</span></p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* System State History */}
          <Panel title="System State History" icon={Activity} iconColor="text-cyan-400" delay={0.1}>
            {systemStates.map((s, i) => (
              <StateRow key={i} label={s.label} status={s.status} delay={0.15 + i * 0.08} />
            ))}
          </Panel>
        </div>

        {/* ── Row 2: OCR Text + Scam Signals ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* OCR Text */}
          <Panel title="Extracted OCR Text" icon={FileText} iconColor="text-emerald-400" delay={0.2}>
            {result.extracted_text ? (
              <div className="bg-slate-950/60 border border-slate-800/50 rounded-lg p-3 max-h-44 overflow-y-auto">
                <p className="text-xs font-mono text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {result.extracted_text}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No OCR text extracted</p>
              </div>
            )}
          </Panel>

          {/* Detected Scam Signals */}
          <Panel title="Detected Scam Signals" icon={Zap} iconColor="text-amber-400" delay={0.2}>
            {flags.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {flags.map((flag, i) => {
                  const lower = flag.toLowerCase();
                  const icon = lower.includes('mail') || lower.includes('email') ? Mail
                    : lower.includes('whatsapp') || lower.includes('telegram') ? MessageCircle
                    : lower.includes('phone') || lower.includes('contact') ? Phone
                    : lower.includes('url') || lower.includes('site') || lower.includes('domain') ? Globe
                    : lower.includes('fee') || lower.includes('payment') || lower.includes('register') ? AlertTriangle
                    : lower.includes('urgent') || lower.includes('tone') ? Siren
                    : lower.includes('attach') || lower.includes('file') ? FileText
                    : Flag;
                  const variant = lower.includes('fee') || lower.includes('register') || lower.includes('payment') ? 'danger'
                    : lower.includes('urgent') ? 'warn' : 'info';
                  return <SignalBadge key={i} label={flag} icon={icon} variant={variant} delay={0.25 + i * 0.05} />;
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="h-8 w-8 text-emerald-600/40 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No suspicious signals detected</p>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Row 3: Verification Breakdown + Website Verification ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Verification Breakdown */}
          <Panel title="Verification Breakdown" icon={Activity} iconColor="text-indigo-400" delay={0.25}>
            <div className="space-y-4">
              <RiskBar label="Email Risk" score={emailScore} maxScore={55} delay={0.3} />
              <RiskBar label="Website Risk" score={urlScore} maxScore={65} delay={0.35} />
              <RiskBar label="Contact Risk" score={contactScore} maxScore={55} delay={0.4} />
            </div>
          </Panel>

          {/* Website Verification */}
          <Panel title="Website Verification" icon={Globe} iconColor="text-blue-400" delay={0.25}>
            {webVerification ? (
              <div className="space-y-0">
                <WebRow
                  label="Host Identity:"
                  value={webVerification.company || webVerification.url?.split('/')[2] || 'Unknown'}
                  status={webVerification.website_live ? 'LIVE' : null}
                />
                <WebRow label="URL Structure:" value={webVerification.url || 'N/A'} />
                <WebRow
                  label="HTTPS Status:"
                  value={webVerification.url?.startsWith('https') ? 'Valid / Secure' : 'Invalid/Self-signed'}
                />
                <WebRow
                  label="Domain Match:"
                  value=""
                  status={webVerification.website_live && !webVerification.flags?.length ? null : 'FAIL'}
                />
                {webVerification.flags?.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {webVerification.flags.map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Globe className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No website verification data</p>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Gemini AI Explanation ─────────────────────────────────────── */}
        {result.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-xl border border-violet-500/20 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20 bg-violet-500/5">
              <Bot className="h-3.5 w-3.5 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Gemini AI Explanation</span>
            </div>
            <div className="p-5">
              {result.explanation.reason && (
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  {result.explanation.reason}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Safety Tips */}
                {result.explanation.tips?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">Safety Tips</p>
                    <ul className="space-y-2">
                      {result.explanation.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500/70 mt-0.5 shrink-0" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Verification Steps */}
                {result.explanation.verification?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3">Verification Steps</p>
                    <ul className="space-y-2">
                      {result.explanation.verification.map((v, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <ChevronRight className="h-3.5 w-3.5 text-blue-500/70 mt-0.5 shrink-0" />
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Scam Signals */}
                {result.explanation.signals?.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-3">Scam Signals</p>
                    <ul className="space-y-2">
                      {result.explanation.signals.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400/70 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}



        {/* ── Warning Banner ────────────────────────────────────────────── */}
        {isScam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-4"
          >
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            </motion.div>
            <div className="text-sm">
              <p className="font-semibold text-red-300">Warning: Do not proceed with payment.</p>
              <p className="text-red-400/70 text-xs mt-0.5">Legitimate employers never ask for money for training or equipment before hiring.</p>
            </div>
          </motion.div>
        )}

        {/* ── Footer Actions ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex justify-between"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-slate-700 bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isScam && (
            <Button className="bg-red-600 hover:bg-red-500 text-white">
              <Flag className="mr-2 h-4 w-4" /> Report Scam
            </Button>
          )}
        </motion.div>

      </div>
    </div>
  );
}

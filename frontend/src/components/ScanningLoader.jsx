import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, FileSearch, Cpu, Globe, Bot, Shield, CheckCircle2, AlertTriangle
} from 'lucide-react';

const SCAN_STEPS = [
  { icon: FileSearch, label: 'Parsing input content',        sub: 'Tokenizing text & metadata',          duration: 1600 },
  { icon: ScanLine,   label: 'OCR extraction',               sub: 'EasyOCR text recognition pipeline',   duration: 1400 },
  { icon: Cpu,        label: 'ML classification',            sub: 'Random Forest + NLP pattern model',   duration: 2000 },
  { icon: AlertTriangle, label: 'Rule-based signal scan',    sub: 'Email, URL, contact, tone flags',     duration: 1500 },
  { icon: Globe,      label: 'Domain verification',          sub: 'Live HTTPS & company identity check', duration: 1800 },
  { icon: Bot,        label: 'Gemini AI reasoning',          sub: 'Contextual analysis & safety tips',   duration: 1400 },
];

// Hex-style random string for terminal feel
function RandHex({ length = 8 }) {
  const [val, setVal] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setVal(Array.from({ length }, () =>
        Math.floor(Math.random() * 16).toString(16).toUpperCase()
      ).join(''));
    }, 80);
    return () => clearInterval(id);
  }, [length]);
  return <span className="font-mono text-[10px] text-cyan-600/60">{val}</span>;
}

export default function ScanningLoader({ isVisible, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress]       = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [logLines, setLogLines]       = useState([]);

  const LOG_MSGS = [
    '> Initializing ScamShield engine...',
    '> Loading threat pattern database...',
    '> Connecting to verification nodes...',
    '> Spawning analysis workers...',
    '> All systems nominal. Running scan...',
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0); setProgress(0);
      setCompletedSteps([]); setLogLines([]);
      return;
    }

    // Rolling log lines
    let logIdx = 0;
    const logTimer = setInterval(() => {
      if (logIdx < LOG_MSGS.length) {
        setLogLines(prev => [...prev.slice(-6), LOG_MSGS[logIdx++]]);
      } else clearInterval(logTimer);
    }, 600);

    let stepIndex = 0;
    let progressInterval;

    const stepProgress = () => {
      const totalSteps = SCAN_STEPS.length;
      const baseProgress = (stepIndex / totalSteps) * 100;
      const stepWeight = 100 / totalSteps;
      let localProgress = 0;

      progressInterval = setInterval(() => {
        localProgress += 2;
        if (localProgress >= 100) {
          clearInterval(progressInterval);
          setCompletedSteps(prev => [...prev, stepIndex]);
          stepIndex++;
          if (stepIndex < totalSteps) {
            setCurrentStep(stepIndex);
            setTimeout(stepProgress, 250);
          } else {
            setProgress(100);
            setTimeout(() => { if (onComplete) onComplete(); }, 700);
            return;
          }
        }
        setProgress(Math.min(baseProgress + (localProgress / 100) * stepWeight, 100));
      }, SCAN_STEPS[stepIndex].duration / 50);
    };

    const startTimeout = setTimeout(stepProgress, 400);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(progressInterval);
      clearInterval(logTimer);
    };
  }, [isVisible, onComplete]);

  const progressRounded = Math.round(progress);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
        >
          {/* Cyber grid bg */}
          <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Corner brackets */}
          {[
            'top-4 left-4 border-t-2 border-l-2',
            'top-4 right-4 border-t-2 border-r-2',
            'bottom-4 left-4 border-b-2 border-l-2',
            'bottom-4 right-4 border-b-2 border-r-2',
          ].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 border-cyan-500/30 ${cls} rounded-sm pointer-events-none`} />
          ))}

          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-lg mx-4"
          >
            {/* Main panel */}
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/90 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60">

              {/* ── Title bar ─────────────────────────────── */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/70 bg-slate-900/80">
                <div className="flex items-center gap-3">
                  {/* Spinner ring + static shield */}
                  <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
                    {/* Spinning dashed arc */}
                    <motion.svg
                      className="absolute inset-0 w-8 h-8"
                      viewBox="0 0 32 32"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                    >
                      <circle
                        cx="16" cy="16" r="14"
                        fill="none"
                        stroke="url(#spinGrad)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="38 50"
                      />
                      <defs>
                        <linearGradient id="spinGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#06b6d4" />
                          <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                    {/* Static shield at center */}
                    <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30">
                      <svg viewBox="0 0 20 22" fill="none" className="w-3 h-3">
                        <path d="M10 1L2 5v6c0 4.418 3.358 8.547 8 9.8C14.642 19.547 18 15.418 18 11V5L10 1z"
                          fill="url(#sg2)" stroke="rgba(6,182,212,0.5)" strokeWidth="0.8" />
                        <path d="M7 11l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                          <linearGradient id="sg2" x1="10" y1="1" x2="10" y2="21" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0891b2" /><stop offset="1" stopColor="#1d4ed8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">ScamShield Analysis Engine</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">THREAT DETECTION PIPELINE · ACTIVE</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-cyan-400"
                  />
                  <span className="text-[9px] font-bold text-cyan-400 font-mono">SCANNING</span>
                </div>
              </div>

              <div className="p-5 space-y-5">

                {/* ── Progress bar ───────────────────────────── */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Scan Progress</span>
                    <div className="flex items-center gap-2">
                      <RandHex length={6} />
                      <span className="text-xs font-mono font-bold text-cyan-400">{progressRounded}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-400 relative"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {/* Glow pulse at tip */}
                      <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/80 blur-sm"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    </motion.div>
                  </div>
                  {/* Step counter */}
                  <div className="flex justify-between mt-1.5">
                    {SCAN_STEPS.map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-px flex-1 mx-0.5 rounded-full transition-colors duration-300 ${
                          completedSteps.includes(i) ? 'bg-emerald-500' : currentStep === i ? 'bg-cyan-400' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Steps list ─────────────────────────────── */}
                <div className="space-y-1.5">
                  {SCAN_STEPS.map((step, idx) => {
                    const isCompleted = completedSteps.includes(idx);
                    const isCurrent   = currentStep === idx && !isCompleted;
                    const isPending   = idx > currentStep;
                    const StepIcon    = step.icon;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: isPending ? 0.25 : 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.3 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                          isCurrent
                            ? 'bg-cyan-500/8 border border-cyan-500/20'
                            : isCompleted
                              ? 'bg-emerald-500/5 border border-emerald-500/10'
                              : 'border border-transparent'
                        }`}
                      >
                        {/* Step index */}
                        <span className={`text-[10px] font-mono w-4 shrink-0 ${
                          isCompleted ? 'text-emerald-500' : isCurrent ? 'text-cyan-400' : 'text-slate-700'
                        }`}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        {/* Icon */}
                        <div className={`shrink-0 p-1.5 rounded-md ${
                          isCompleted ? 'bg-emerald-500/10' : isCurrent ? 'bg-cyan-500/10' : 'bg-slate-800/60'
                        }`}>
                          {isCompleted ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            </motion.div>
                          ) : isCurrent ? (
                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                              <StepIcon className="h-3.5 w-3.5 text-cyan-400" />
                            </motion.div>
                          ) : (
                            <StepIcon className="h-3.5 w-3.5 text-slate-600" />
                          )}
                        </div>

                        {/* Label + sub */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold truncate ${
                            isCompleted ? 'text-emerald-300/80' : isCurrent ? 'text-white' : 'text-slate-600'
                          }`}>
                            {step.label}
                          </p>
                          {(isCurrent || isCompleted) && (
                            <p className={`text-[10px] truncate mt-0.5 ${isCompleted ? 'text-slate-600' : 'text-slate-500'}`}>
                              {step.sub}
                            </p>
                          )}
                        </div>

                        {/* Current pulse dots */}
                        {isCurrent && (
                          <motion.div
                            className="flex gap-1 ml-auto"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                          >
                            {[1, 0.6, 0.3].map((op, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ opacity: op }} />
                            ))}
                          </motion.div>
                        )}
                        {isCompleted && (
                          <span className="ml-auto text-[9px] font-bold text-emerald-500 font-mono">DONE</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* ── Terminal log ───────────────────────────── */}
                <div className="rounded-lg border border-slate-800/60 bg-slate-950/80 p-3 font-mono min-h-[52px]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/60" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    <span className="text-[9px] text-slate-600 ml-1">scamshield — threat-scanner</span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {logLines.map((line, i) => (
                      <motion.p
                        key={line + i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: i === logLines.length - 1 ? 1 : 0.35, y: 0 }}
                        className="text-[10px] text-emerald-400/90 leading-relaxed"
                      >
                        {line}
                        {i === logLines.length - 1 && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 align-middle"
                          />
                        )}
                      </motion.p>
                    ))}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

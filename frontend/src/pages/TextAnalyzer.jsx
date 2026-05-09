import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText, AlertCircle, ArrowLeft, Zap, Shield, Cpu,
  Bot, Activity, ChevronRight, CheckCircle, ClipboardPaste, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanningLoader from '@/components/ScanningLoader';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const PIPELINE_STEPS = [
  { icon: Cpu,      label: 'ML Classification',    desc: 'Random Forest + NLP model' },
  { icon: Activity, label: 'Rule-Based Checks',     desc: 'Email, URL, contact signals' },
  { icon: Bot,      label: 'Gemini AI Analysis',    desc: 'Deep contextual reasoning' },
  { icon: Shield,   label: 'Risk Score Fusion',     desc: 'Weighted composite score' },
];

const TIPS = [
  'Include the full job description or email body',
  'Paste contact details (phone, email, links) if present',
  'Longer text gives more accurate results',
  'Works on WhatsApp messages, SMS, and emails',
];

export default function TextAnalyzer() {
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError]       = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const navigate = useNavigate();
  const { playClick } = useSoundEffects();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const readyToAnalyze = text.trim().length > 10;

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch {
      // clipboard permission denied — ignore
    }
  };

  const handleAnalyze = async () => {
    if (!readyToAnalyze) return;
    playClick();
    setLoading(true);
    setError(null);
    setScanning(true);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-text', { text });
      setApiResult(response.data);
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      setScanning(false);
      setLoading(false);
      console.error(err);
    }
  };

  const handleScanComplete = useCallback(() => {
    setScanning(false);
    setLoading(false);
    if (apiResult) navigate('/result', { state: { result: apiResult } });
  }, [apiResult, navigate]);

  return (
    <>
      <ScanningLoader isVisible={scanning} onComplete={handleScanComplete} />

      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 bg-cyber-grid py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Page Header ──────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Text Analysis</h1>
                <p className="text-sm text-slate-500">Paste job post, email, or message content for AI-powered scam detection</p>
              </div>
            </div>
          </motion.div>

          {/* ── Main Grid ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

            {/* Left — textarea card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Input Content</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" /> Paste
                </motion.button>
              </div>

              {/* Textarea */}
              <div className="p-4 relative">
                <Textarea
                  id="text-input"
                  placeholder="Paste job description, WhatsApp message, email, or SMS here..."
                  className="min-h-[300px] text-sm p-4 resize-none bg-slate-950/70 border-slate-800/60 text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/30 focus:ring-0 rounded-xl transition-all font-mono leading-relaxed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {text && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setText('')}
                    className="absolute top-6 right-6 p-1 rounded-md bg-slate-800/80 text-slate-500 hover:text-white hover:bg-red-500/20 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>

              {/* Stats bar */}
              <div className="px-5 py-3 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-mono text-slate-600">{charCount} chars</span>
                  <span className="text-[11px] font-mono text-slate-600">{wordCount} words</span>
                  {readyToAnalyze && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Ready
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="text-slate-500 hover:text-white hover:bg-slate-800 text-xs h-8"
                  >
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                  </Button>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      onClick={handleAnalyze}
                      disabled={loading || !readyToAnalyze}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-lg shadow-cyan-500/20 h-8 px-5 text-xs rounded-lg disabled:opacity-40"
                    >
                      <Zap className="mr-1.5 h-3.5 w-3.5" />
                      {loading ? 'Analyzing…' : 'Run Analysis'}
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-4 mb-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right — sidebar */}
            <div className="space-y-4">

              {/* Analysis Pipeline */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Analysis Pipeline</span>
                </div>
                <div className="p-3 space-y-1">
                  {PIPELINE_STEPS.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.07 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
                      >
                        <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/15 shrink-0">
                          <Icon className="h-3 w-3 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-300 truncate">{step.label}</p>
                          <p className="text-[10px] text-slate-600 truncate">{step.desc}</p>
                        </div>
                        <ChevronRight className="h-3 w-3 text-slate-700 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/50">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Best Practices</span>
                </div>
                <ul className="p-3 space-y-2">
                  {TIPS.map((tip, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.06 }}
                      className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-500/60 mt-0.5 shrink-0" />
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Supported content types */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Supported Content</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Job Postings', 'Emails', 'WhatsApp', 'SMS', 'Telegram', 'LinkedIn'].map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-slate-700/60 bg-slate-800/40 text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

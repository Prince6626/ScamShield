import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon, Upload, AlertCircle, ArrowLeft, Zap,
  Shield, Cpu, Bot, Activity, ChevronRight, CheckCircle,
  FileImage, X, Eye, ScanLine
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScanningLoader from '@/components/ScanningLoader';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const PIPELINE_STEPS = [
  { icon: ScanLine,  label: 'OCR Extraction',       desc: 'EasyOCR text recognition' },
  { icon: Cpu,       label: 'ML Classification',    desc: 'Pattern-based scam model' },
  { icon: Activity,  label: 'Rule-Based Checks',    desc: 'URL, email, contact flags' },
  { icon: Bot,       label: 'Gemini AI Analysis',   desc: 'Deep contextual reasoning' },
];

const SUPPORTED = ['PNG', 'JPG', 'JPEG', 'WEBP', 'BMP', 'GIF'];

const TIPS = [
  'Screenshots of messages work best',
  'Ensure text is readable and not blurry',
  'Include full message with sender info',
  'Max file size: 10 MB',
];

export default function ImageAnalyzer() {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [error, setError]         = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrText, setOcrText]     = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { playClick } = useSoundEffects();

  const handleFileSelect = (selected) => {
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setOcrText(null);
      setError(null);
    }
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null); setPreview(null); setOcrText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) return;
    playClick();
    setLoading(true);
    setError(null);
    setScanning(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setApiResult(response.data);
      if (response.data.extracted_text) setOcrText(response.data.extracted_text);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      setScanning(false);
      setLoading(false);
      console.error(err);
    }
  };

  const handleScanComplete = useCallback(() => {
    setScanning(false);
    setLoading(false);
    if (apiResult) navigate('/result', { state: { result: apiResult, imagePreview: preview } });
  }, [apiResult, navigate, preview]);

  const fileSizeStr = file ? (file.size / (1024 * 1024)).toFixed(2) + ' MB' : '';

  return (
    <>
      <ScanningLoader isVisible={scanning} onComplete={handleScanComplete} />

      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 bg-cyber-grid py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Page Header ──────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <ImageIcon className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Screenshot Analysis</h1>
                <p className="text-sm text-slate-500">Upload a screenshot — OCR extracts text and AI detects scam patterns</p>
              </div>
            </div>
          </motion.div>

          {/* ── Main Grid ───────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

            {/* Left — Upload card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Upload Screenshot</span>
                {file && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">{fileSizeStr}</span>
                    <button onClick={clearFile} className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div className="p-4">
                <motion.div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  animate={{
                    borderColor: isDragging ? 'rgba(139, 92, 246, 0.6)' : preview ? 'rgba(139, 92, 246, 0.25)' : 'rgba(51, 65, 85, 0.5)',
                    backgroundColor: isDragging ? 'rgba(139, 92, 246, 0.05)' : 'rgba(2, 6, 23, 0.4)',
                  }}
                  className="relative flex items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden"
                  style={{ minHeight: preview ? '280px' : '240px' }}
                  onClick={() => !preview && fileInputRef.current?.click()}
                >
                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full flex items-center justify-center p-4"
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-[260px] w-auto object-contain rounded-lg shadow-2xl shadow-black/50"
                        />
                        {/* Overlay controls */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="p-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-violet-500/20 hover:border-violet-500/40 transition-all"
                            title="Replace"
                          >
                            <Upload className="h-3.5 w-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="p-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                        {/* File badge */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/90 border border-slate-700/60 rounded-lg">
                          <FileImage className="h-3 w-3 text-violet-400" />
                          <span className="text-[11px] text-slate-300 font-mono truncate max-w-[180px]">{file?.name}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                      >
                        <motion.div
                          animate={isDragging ? { scale: 1.15, y: -6 } : { scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-4"
                        >
                          <Upload className="w-8 h-8 text-violet-400" />
                        </motion.div>
                        <p className="text-sm font-medium text-slate-300 mb-1">
                          {isDragging ? 'Drop screenshot here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {SUPPORTED.join(', ')} · Max 10 MB
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept="image/*"
                  />
                </motion.div>
              </div>

              {/* OCR text preview */}
              <AnimatePresence>
                {ocrText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t border-slate-800/50"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Extracted OCR Text</span>
                      </div>
                      <div className="bg-slate-950/70 border border-slate-800/60 rounded-lg p-3 max-h-36 overflow-y-auto">
                        <p className="text-xs text-slate-400 font-mono leading-relaxed whitespace-pre-wrap">{ocrText}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer actions */}
              <div className="px-5 py-3 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {file && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[11px] text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" /> Image ready
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
                      disabled={loading || !file}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-violet-500/20 h-8 px-5 text-xs rounded-lg disabled:opacity-40"
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
                  <Activity className="h-3.5 w-3.5 text-violet-400" />
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
                        <div className="p-1.5 rounded-md bg-violet-500/10 border border-violet-500/15 shrink-0">
                          <Icon className="h-3 w-3 text-violet-400" />
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

              {/* Supported formats */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Supported Formats</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED.map(fmt => (
                    <span key={fmt} className="text-[10px] px-2 py-0.5 rounded border border-slate-700/60 bg-slate-800/40 text-slate-400 font-mono">
                      {fmt}
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

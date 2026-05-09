import { Link, useLocation } from 'react-router-dom';
import { FileText, Image as ImageIcon, Home, Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NAV_ITEMS = [
  { name: 'Dashboard',  path: '/',      icon: Home      },
  { name: 'Forensics',  path: '/text',  icon: FileText  },
  { name: 'Archive',    path: '/image', icon: ImageIcon },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* ── Logo ──────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          {/* Custom shield mark */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350 }}
            className="relative shrink-0"
          >
            {/* outer glow ring */}
            <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-sm" />
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <svg viewBox="0 0 20 22" fill="none" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L2 5v6c0 4.418 3.358 8.547 8 9.8C14.642 19.547 18 15.418 18 11V5L10 1z"
                  fill="url(#shieldGrad)" stroke="rgba(6,182,212,0.6)" strokeWidth="0.8" />
                <path d="M7 11l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="shieldGrad" x1="10" y1="1" x2="10" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0891b2" />
                    <stop offset="1" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* live dot */}
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-sm shadow-cyan-400/60"
            />
          </motion.div>

          {/* Wordmark */}
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-white">
              Scam<span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Shield</span>
            </span>
            <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600 uppercase mt-0.5">Intelligence Platform</span>
          </div>
        </Link>

        {/* ── Desktop Nav ────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 tracking-wide',
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-slate-800/70 border border-slate-700/60"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-px bg-cyan-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* ── Right Actions ──────────────────────────────── */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Status indicator — hidden on small */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-800/80 bg-slate-900/50 text-[10px] text-slate-500 font-mono">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"
            />
            Systems Operational
          </div>

          {/* Start New Analysis — desktop */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="hidden md:block"
          >
            <Link to="/text">
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-md shadow-cyan-500/20 text-xs h-8 px-4 rounded-lg"
              >
                <Zap className="mr-1.5 h-3.5 w-3.5" />
                Start New Analysis
              </Button>
            </Link>
          </motion.div>


          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-slate-800/70 text-white border border-slate-700/60'
                        : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </Link>
                );
              })}
              <div className="pt-2 border-t border-slate-800/50">
                <Link to="/text" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-md shadow-cyan-500/20 text-sm h-9 rounded-lg">
                    <Zap className="mr-2 h-4 w-4" />
                    Start New Analysis
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { useRef, useCallback } from 'react';

/**
 * useSoundEffects — Web Audio API synthesized sounds
 * All sounds are cybersecurity / forensics themed:
 *  • playClick   → soft UI confirmation tick
 *  • playAlert   → urgent two-tone threat alarm
 *  • playSuccess → ascending chime (analysis clear)
 *  • playScan    → low digital sweep (scan start)
 *  • playBeep    → single short terminal beep
 */
export function useSoundEffects() {
  const ctxRef = useRef(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume in case browser suspended it
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────
  const tone = useCallback((frequency, startTime, duration, type = 'sine', gainPeak = 0.07, ac = null) => {
    try {
      const c = ac || ctx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      // Slight high-pass filter for clarity
      const filter = c.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 80;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    } catch { /* silent fail */ }
  }, [ctx]);

  const sweep = useCallback((freqStart, freqEnd, startTime, duration, type = 'sawtooth', gainPeak = 0.04, ac = null) => {
    try {
      const c = ac || ctx();
      const osc  = c.createOscillator();
      const gain = c.createGain();
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(c.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, startTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
      gain.gain.setValueAtTime(gainPeak, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    } catch { /* silent fail */ }
  }, [ctx]);

  // ── playClick — soft UI tick ──────────────────────────────────────────
  const playClick = useCallback(() => {
    try {
      const c = ctx();
      const t = c.currentTime;
      sweep(1200, 900, t, 0.05, 'sine', 0.05, c);
    } catch { /* silent fail */ }
  }, [sweep, ctx]);

  // ── playAlert — urgent threat alarm (3-pulse descending) ─────────────
  const playAlert = useCallback(() => {
    try {
      const c = ctx();
      const t = c.currentTime;
      // First pulse — high
      tone(1040, t,        0.14, 'square', 0.06, c);
      // Short pause, second pulse — mid
      tone(880,  t + 0.18, 0.14, 'square', 0.06, c);
      // Third pulse — lower
      tone(740,  t + 0.36, 0.18, 'square', 0.05, c);
      // Underlying low rumble
      sweep(120, 60, t, 0.55, 'sawtooth', 0.03, c);
    } catch { /* silent fail */ }
  }, [tone, sweep, ctx]);

  // ── playSuccess — ascending clean chime (analysis passed) ────────────
  const playSuccess = useCallback(() => {
    try {
      const c = ctx();
      const t = c.currentTime;
      // Ascending triad: C5 → E5 → G5
      tone(523, t,        0.18, 'sine', 0.06, c);
      tone(659, t + 0.12, 0.18, 'sine', 0.06, c);
      tone(784, t + 0.24, 0.25, 'sine', 0.07, c);
      // Soft shimmer on top
      tone(1568, t + 0.24, 0.3, 'sine', 0.02, c);
    } catch { /* silent fail */ }
  }, [tone, ctx]);

  // ── playScan — digital sweep on scan start ────────────────────────────
  const playScan = useCallback(() => {
    try {
      const c = ctx();
      const t = c.currentTime;
      sweep(200, 1800, t, 0.6, 'sawtooth', 0.03, c);
      sweep(200, 900,  t + 0.05, 0.55, 'sine', 0.04, c);
    } catch { /* silent fail */ }
  }, [sweep, ctx]);

  // ── playBeep — single short terminal beep ────────────────────────────
  const playBeep = useCallback(() => {
    try {
      const c = ctx();
      tone(880, c.currentTime, 0.08, 'sine', 0.05, c);
    } catch { /* silent fail */ }
  }, [tone, ctx]);

  return { playClick, playAlert, playSuccess, playScan, playBeep };
}

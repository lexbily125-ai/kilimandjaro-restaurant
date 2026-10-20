import { useState, useEffect, useRef, useCallback } from "react";

// Plays a dual-layer siren: primary sine tones (520 Hz → 650 Hz) stacked with
// soft harmonic overtones (1040 Hz → 1300 Hz at 0.3 relative gain) at a 1.0 peak
// master gain for maximum audibility on noisy tablet speakers. Repeats every
// 4.5 s while `active` is true and stops on kitchen acknowledgement.
export function useAudioAlert(active) {
  const ctxRef = useRef(null);
  const intervalRef = useRef(null);
  const [blocked, setBlocked] = useState(false);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const playChime = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || ctx.state === "suspended") return;
    const now = ctx.currentTime;

    // [frequency, peak gain, start, attack, release, stop]
    const layers = [
      [520, 1.0, 0, 0.04, 0.38, 0.42],   // primary tone 1
      [650, 1.0, 0.28, 0.05, 0.35, 0.72], // primary tone 2
      [1040, 0.3, 0, 0.04, 0.38, 0.42],   // harmonic overtone of tone 1
      [1300, 0.3, 0.28, 0.05, 0.35, 0.72], // harmonic overtone of tone 2
    ];

    layers.forEach(([freq, gain, start, attack, release, stop]) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + start);
      g.gain.exponentialRampToValueAtTime(gain, now + start + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + attack + release);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + stop);
    });
  }, []);

  useEffect(() => {
    if (active) {
      const ctx = ensureCtx();
      if (ctx && ctx.state === "suspended") setBlocked(true);
      playChime();
      intervalRef.current = setInterval(playChime, 4500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, ensureCtx, playChime]);

  // Unlock audio on any user gesture while active
  useEffect(() => {
    if (!active) return;
    const unlock = () => {
      const ctx = ctxRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume()
          .then(() => {
            setBlocked(false);
            playChime();
          })
          .catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [active, playChime]);

  const enableSound = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().then(() => setBlocked(false)).catch(() => {});
    setBlocked(false);
    playChime();
  }, [ensureCtx, playChime]);

  // Resume a suspended AudioContext (e.g. after the tablet screen wakes)
  const resume = useCallback(() => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => setBlocked(false)).catch(() => {});
    }
  }, []);

  return { blocked, enableSound, resume };
}
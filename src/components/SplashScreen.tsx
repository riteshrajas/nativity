import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

export function SplashScreen({ onComplete, durationMs = 2600 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onComplete, 400);
    }, durationMs);

    return () => window.clearTimeout(timeout);
  }, [durationMs, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-brand-500/40 to-cyan-500/40"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-6 rounded-[2.5rem] border border-white/10 bg-white/10 px-16 py-14 text-center shadow-[0_25px_60px_-20px_rgba(99,102,241,0.45)] backdrop-blur-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <motion.div
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/15 shadow-inner"
              initial={{ rotate: -8 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>
            <div className="space-y-2">
              <motion.h1
                className="font-serif text-3xl font-semibold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
              >
                Pyintel Nativity
              </motion.h1>
              <motion.p
                className="text-sm uppercase tracking-[0.9em] text-white/70"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Vocabulary Accelerator
              </motion.p>
            </div>
            <motion.div
              className="flex h-1 w-48 overflow-hidden rounded-full bg-white/20"
              initial={{ width: 0 }}
              animate={{ width: '12rem' }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.span
                className="h-full w-full bg-gradient-to-r from-brand-400 via-indigo-400 to-cyan-400"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: durationMs / 1000, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;

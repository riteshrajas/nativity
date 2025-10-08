import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useTheme } from '../../theme/ThemeProvider';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: typeof Sun;
};

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="border-white/20 bg-white/30 text-sm font-semibold text-slate-800 shadow-none backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        {resolvedTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        Theme
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10',
                    isActive && 'bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="theme-active"
                      className="ml-auto h-2 w-2 rounded-full bg-brand-500"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

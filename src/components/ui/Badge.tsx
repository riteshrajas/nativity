import clsx from 'clsx';
import { ReactNode } from 'react';

const variants = {
  brand: 'bg-gradient-to-r from-brand-500 to-cyan-400 text-white shadow-lg shadow-brand-500/30',
  subtle: 'bg-white/60 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200',
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  info: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
};

export type BadgeVariant = keyof typeof variants;

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

export function Badge({ children, className, variant = 'subtle' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-wide',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

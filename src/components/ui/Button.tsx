import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70';

const variants = {
  primary:
    'bg-gradient-to-r from-brand-500 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-brand-500/40 hover:translate-y-[-1px] hover:shadow-xl hover:shadow-brand-500/50',
  outline:
    'border border-white/30 bg-white/20 text-white hover:bg-white/30 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:bg-slate-900/70',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60',
};

export type ButtonVariant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={clsx(baseStyles, variants[variant], className)} {...props} />
  ),
);

Button.displayName = 'Button';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  borderGlow?: boolean;
}

export function Card({ children, className, borderGlow = true }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/70 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60',
        borderGlow &&
          'before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/60 before:to-transparent before:opacity-0 before:transition before:duration-300 hover:before:opacity-100 dark:before:from-white/10',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={clsx('mb-5 flex flex-col gap-2', className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return <h3 className={clsx('text-lg font-semibold text-slate-900 dark:text-slate-100', className)}>{children}</h3>;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={clsx('text-sm text-slate-600 dark:text-slate-300', className)}>{children}</p>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx('mt-4 flex flex-col gap-4', className)}>{children}</div>;
}

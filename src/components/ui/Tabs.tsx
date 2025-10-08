import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={clsx(
      'inline-flex h-auto items-center justify-center rounded-2xl border border-white/10 bg-white/20 p-1.5 text-slate-500 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={clsx(
      'relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 ring-offset-white transition-all duration-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white dark:text-slate-200 dark:hover:text-white dark:ring-offset-slate-950 dark:focus-visible:ring-slate-800 dark:data-[state=active]:text-white',
      className,
    )}
    {...props}
  >
    {children}
    {props['data-state'] === 'active' && (
      <motion.div
        layoutId="tab-highlight"
        className="absolute inset-0 -z-10 rounded-[inherit] bg-gradient-to-r from-brand-500/90 to-indigo-400/90 shadow-lg shadow-black/10"
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    )}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={clsx(
      'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-800',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };


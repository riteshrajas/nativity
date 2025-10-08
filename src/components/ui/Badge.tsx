import * as React from 'react';
import Chip from '@mui/material/Chip';

export type BadgeVariant = 'brand' | 'subtle' | 'success' | 'warning' | 'info';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'subtle' }: BadgeProps) {
  const color = variant === 'brand' ? 'primary' : variant === 'info' ? 'info' : variant === 'success' ? 'success' : undefined;
  return <Chip label={String(children)} color={color as any} size="small" />;
}

import * as React from 'react';
import MuiCard from '@mui/material/Card';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <MuiCard elevation={3} sx={{ borderRadius: 3 }} className={className as string} onClick={onClick}>
        {children}
      </MuiCard>
    </motion.div>
  );
}

interface BaseProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: BaseProps) {
  return <MuiCardHeader sx={{ '& .MuiCardHeader-content': { gap: className } }}>{children}</MuiCardHeader>;
}

export function CardTitle({ children, className }: BaseProps) {
  return <Typography variant="h6" className={className}>{children}</Typography>;
}

export function CardDescription({ children, className }: BaseProps) {
  return <Typography variant="body2" color="text.secondary" className={className}>{children}</Typography>;
}

export function CardContent({ children, className }: BaseProps) {
  return <MuiCardContent className={className}>{children}</MuiCardContent>;
}

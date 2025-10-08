import * as React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { forwardRef } from 'react';

// Keep the same variant API used across the app but map to MUI equivalents.
export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'text' | 'contained';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', sx, children, ...props },
  ref,
) {
  // Map custom variants to MUI variant + styling
  const muiVariant: MuiButtonProps['variant'] = variant === 'outline' ? 'outlined' : variant === 'ghost' ? 'text' : 'contained';

  const additionalSx =
    variant === 'primary'
      ? {
          background: 'linear-gradient(90deg,#06b6d4,#7c3aed,#06b6d4)',
          color: 'common.white',
          boxShadow: (theme: any) => theme.shadows[4],
          textTransform: 'none',
        }
      : variant === 'ghost'
      ? { textTransform: 'none' }
      : {};

  return (
    <MuiButton ref={ref} variant={muiVariant} sx={{ ...additionalSx, ...sx }} {...(props as any)}>
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

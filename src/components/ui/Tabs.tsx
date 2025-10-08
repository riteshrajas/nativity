import * as React from 'react';
import MuiTabs from '@mui/material/Tabs';
import MuiTab from '@mui/material/Tab';
import Box from '@mui/material/Box';

// Provide a small wrapper to keep the same named exports used in the app.
export function Tabs(props: any) {
  // The original API used `value` and `onValueChange` — map to MUI's value/onChange.
  const { value, onValueChange, children, ...rest } = props;
  const handleChange = (_: any, newValue: any) => onValueChange?.(newValue);
  return (
    <Box {...rest}>
      {children}
    </Box>
  );
}

export function TabsList({ children, className, ...props }: any) {
  return (
    <MuiTabs 
      value={props.value} 
      onChange={props.onChange}
      variant="fullWidth"
      className={className}
    >
      {children}
    </MuiTabs>
  );
}

export function TabsTrigger(props: any) {
  const { value, children, ...rest } = props;
  return (
    <MuiTab 
      label={children} 
      value={value} 
      {...rest} 
      sx={{ 
        color: 'text.primary',
        '&.Mui-selected': {
          color: 'primary.main',
        },
      }}
    />
  );
}

export function TabsContent({ children }: any) {
  return <Box sx={{ mt: 1 }}>{children}</Box>;
}


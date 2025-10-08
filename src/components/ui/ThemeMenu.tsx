import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import Box from '@mui/material/Box';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ReactNode;
};

const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: <Sun /> },
  { value: 'dark', label: 'Dark', icon: <Moon /> },
  { value: 'system', label: 'System', icon: <Monitor /> },
];

export function ThemeMenu() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  return (
    <div>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        {resolvedTheme === 'dark' ? <Moon /> : <Sun />}
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {themeOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={theme === option.value}
            onClick={() => {
              setTheme(option.value);
              setAnchorEl(null);
            }}
          >
            {option.icon}
            <Box component="span" sx={{ ml: 1 }}>{option.label}</Box>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

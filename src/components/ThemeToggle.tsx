import React, { useEffect } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncThemeColorMeta, useTheme } from '@/hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  useEffect(syncThemeColorMeta, []);

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="max-md:flex-1"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {isDark ? 'Light Mode' : 'Dark Mode'}
    </Button>
  );
};

export default ThemeToggle;

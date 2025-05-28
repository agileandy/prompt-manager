import React from 'react';
import useTheme from '../hooks/useTheme';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import IconButton from './IconButton';

const ThemeToggleButton: React.FC = () => {
  const [theme, toggleTheme] = useTheme();

  return (
    <IconButton
      onClick={toggleTheme}
      label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-primary-light"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-6 h-6" />
      ) : (
        <SunIcon className="w-6 h-6" />
      )}
    </IconButton>
  );
};

export default ThemeToggleButton;

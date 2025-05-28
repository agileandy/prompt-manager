import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  label?: string; // For accessibility
}

const IconButton: React.FC<IconButtonProps> = ({ children, label, className, ...props }) => {
  return (
    <button
      type="button"
      aria-label={label}
      className={`p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-offset-neutral-800 focus:ring-opacity-50 transition-colors ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
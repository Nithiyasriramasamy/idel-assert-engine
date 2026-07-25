import React from 'react';

interface BadgeProps {
  type: 'verified' | 'ai' | 'primary' | 'secondary' | 'success' | 'neutral' | 'danger' | 'warning';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ type, children }) => {
  const styles = {
    verified: {
      bg: 'bg-green-100 text-green-800',
      label: 'Verified',
    },
    ai: {
      bg: 'bg-purple-100 text-purple-800',
      label: 'AI Recommended',
    },
    primary: {
      bg: 'bg-blue-100 text-blue-800',
      label: 'Primary',
    },
    secondary: {
      bg: 'bg-orange-100 text-orange-800',
      label: 'Secondary',
    },
    success: {
      bg: 'bg-green-100 text-green-800',
      label: 'Success',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-800',
      label: 'Neutral',
    },
    danger: {
      bg: 'bg-red-100 text-red-800',
      label: 'Danger',
    },
    warning: {
      bg: 'bg-yellow-100 text-yellow-800',
      label: 'Warning',
    },
  }[type] || { bg: 'bg-slate-100 text-slate-800', label: '' };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded ${styles.bg}`}
    >
      {children || styles.label}
    </span>
  );
};

export default Badge;

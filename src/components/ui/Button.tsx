import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const styles: Record<Variant, string> = {
  primary: 'bg-[#dc2626] text-white font-semibold',
  secondary: 'bg-[#1b1e30] text-[#e2e8f0] border border-[#232640]',
  danger: 'bg-[#dc2626] text-white font-semibold',
  ghost: 'bg-transparent text-[#dc2626] font-semibold',
};

export function Button({ children, onClick, variant = 'primary', disabled, loading, fullWidth, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-5 py-3 rounded-xl text-[15px] transition-opacity active:opacity-75 disabled:opacity-50 ${styles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading ? '...' : children}
    </button>
  );
}

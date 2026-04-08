import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium" style={{ color: '#64748b' }}>{label}</label>}
      <input
        className={`w-full px-4 py-3 rounded-xl text-[15px] outline-none focus:border-[#dc2626] transition-colors ${className}`}
        style={{ backgroundColor: '#1b1e30', border: '1px solid #232640', color: '#e2e8f0' }}
        {...props}
      />
    </div>
  );
}

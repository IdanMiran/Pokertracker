import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (visible) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-t-2xl p-6 pb-10"
        style={{ backgroundColor: '#151829', borderTop: '1px solid #232640', maxHeight: '90dvh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none" style={{ color: '#64748b' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

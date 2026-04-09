'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from './index';

import { createPortal } from 'react-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'success' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const colors = {
    danger: { bg: 'bg-red-50', text: 'text-red-600', icon: AlertTriangle, btn: 'bg-red-600 hover:bg-red-700' },
    success: { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2, btn: 'bg-green-600 hover:bg-green-700' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertTriangle, btn: 'bg-amber-600 hover:bg-amber-700' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', icon: CheckCircle2, btn: 'bg-blue-600 hover:bg-blue-700' },
  };

  const config = colors[type];
  const Icon = config.icon;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-[var(--primary-900)] text-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-[var(--primary-700)]">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/10`}>
              <Icon size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} className="text-white/50" />
                </button>
              </div>
              <p className="mt-2 text-white/80 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[var(--primary-950)] border-t border-[var(--primary-800)] flex items-center justify-end gap-3">
          <Button variant="ghost" className="text-white/70 hover:text-white" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${config.btn}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

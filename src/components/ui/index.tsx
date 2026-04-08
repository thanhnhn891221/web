import React from 'react';
import { LucideIcon } from 'lucide-react';

// ============================================
// Button Component
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  isLoading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    text-white font-semibold
    hover:shadow-lg active:scale-[0.98]
  `,
  secondary: `
    font-medium
    hover:shadow-md active:scale-[0.98]
  `,
  outline: `
    bg-transparent border font-medium
    hover:shadow-sm active:scale-[0.98]
  `,
  ghost: `
    bg-transparent font-medium
  `,
  danger: `
    text-white font-semibold
    hover:shadow-lg active:scale-[0.98]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  isLoading,
  children,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getInlineStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { ...style };
    switch (variant) {
      case 'primary':
        base.background = base.background || 'linear-gradient(135deg, var(--primary-500), var(--primary-600))';
        base.boxShadow = '0 2px 10px rgba(59, 130, 246, 0.2)';
        break;
      case 'secondary':
        base.background = 'var(--slate-100)';
        base.color = 'var(--text-primary)';
        break;
      case 'outline':
        base.borderColor = 'var(--border-color)';
        base.color = 'var(--text-primary)';
        break;
      case 'ghost':
        base.color = 'var(--text-secondary)';
        break;
      case 'danger':
        base.background = 'linear-gradient(135deg, var(--rose), hsl(350, 72%, 45%))';
        break;
    }
    return base;
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      style={getInlineStyle()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
      {IconRight && !isLoading && (
        <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
    </button>
  );
}

// ============================================
// Input Component
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

export function Input({
  label,
  error,
  icon: Icon,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            <Icon size={16} />
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl text-base md:text-sm outline-none
            transition-all duration-200
            border bg-transparent
            focus:ring-2 focus:border-transparent
            placeholder:text-[var(--text-muted)]
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-[var(--rose)] ring-1 ring-[var(--rose)]' : ''}
            ${className}
          `}
          style={{
            borderColor: error ? 'var(--rose)' : 'var(--border-color)',
            '--tw-ring-color': error ? 'var(--rose)' : 'var(--primary-400)',
          } as React.CSSProperties}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'var(--rose)' }}>{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{helperText}</p>
      )}
    </div>
  );
}

// ============================================
// Select Component
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-2.5 rounded-xl text-base md:text-sm outline-none
          transition-all duration-200
          border bg-transparent
          focus:ring-2 focus:border-transparent
          ${error ? 'border-[var(--rose)]' : ''}
          ${className}
        `}
        style={{
          borderColor: error ? 'var(--rose)' : 'var(--border-color)',
          '--tw-ring-color': 'var(--primary-400)',
        } as React.CSSProperties}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs" style={{ color: 'var(--rose)' }}>{error}</p>}
    </div>
  );
}

// ============================================
// Badge Component
// ============================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'custom';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ElementType;
  color?: string;
  bg?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const badgeColors: Record<Exclude<BadgeVariant, 'custom'>, { color: string; bg: string }> = {
  default: { color: 'var(--text-secondary)', bg: 'var(--slate-100)' },
  success: { color: 'var(--emerald)', bg: 'var(--emerald-light)' },
  warning: { color: 'var(--amber)', bg: 'var(--amber-light)' },
  danger: { color: 'var(--rose)', bg: 'var(--rose-light)' },
  info: { color: 'var(--sky)', bg: 'var(--sky-light)' },
};

const badgeSizes = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ children, variant = 'default', icon: Icon, color, bg, size = 'md', className = '' }: BadgeProps) {
  const colors = variant === 'custom'
    ? { color: color || 'var(--text-secondary)', bg: bg || 'var(--slate-100)' }
    : badgeColors[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${badgeSizes[size]} ${className}`}
      style={{ background: colors.bg, color: colors.color }}
    >
      {Icon && <Icon size={size === 'xs' ? 10 : 12} />}
      {children}
    </span>
  );
}

// ============================================
// Card Component
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, padding = 'md', onClick }: CardProps) {
  const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

  return (
    <div
      className={`card ${paddingMap[padding]} ${hover ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============================================
// Modal Component
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, description, children, size = 'md', footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 pb-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`
          relative w-full ${modalSizes[size]} rounded-2xl animate-scale-in
          flex flex-col max-h-[85vh] overflow-hidden border-t-[4px]
        `}
        style={{
          background: 'var(--bg-card)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderTopColor: 'var(--primary-600)',
          borderLeft: '1px solid var(--border-color)',
          borderRight: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--slate-100)] transition-colors -mt-1 -mr-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 p-6 pt-4 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Stat Card Component
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color: string;
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, color }: StatCardProps) {
  const isPositive = change && change > 0;

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${color}15` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        {change !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            }`}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {changeLabel || title}
        </p>
      </div>
    </Card>
  );
}

// ============================================
// Empty State Component
// ============================================

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--slate-100)' }}
        >
          <Icon size={28} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export * from './ConfirmModal';

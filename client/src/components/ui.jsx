import { useEffect } from 'react';
import { hasIcon, Icon } from './icons.jsx';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-sub">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}

export function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Modal({ open, title, onClose, children, footer, width }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal" style={width ? { maxWidth: width } : undefined} role="dialog">
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Field({ label, required, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {required ? <span className="required"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function EmptyState({ icon = 'inbox', title = 'Chưa có dữ liệu', description }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {hasIcon(icon) ? <Icon name={icon} size={34} /> : icon}
      </div>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function LoadingBlock({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-block">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert alert-error">
      <span className="alert-text">
        <Icon name="alert" size={16} />
        {message}
      </span>
      {onRetry ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

export function StatCard({ icon, label, value, hint, tone = 'primary' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        {hasIcon(icon) ? <Icon name={icon} size={21} /> : icon}
      </div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint ? <div className="stat-hint">{hint}</div> : null}
      </div>
    </div>
  );
}

export function ProgressBar({ value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="progress" role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar" style={{ width: `${safe}%` }} />
    </div>
  );
}

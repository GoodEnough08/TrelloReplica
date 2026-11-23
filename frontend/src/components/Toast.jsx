import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const isError = t.type === 'error';
        const isSuccess = t.type === 'success';

        return (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: '#0F172A',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: '260px',
              maxWidth: '380px',
              animation: 'scaleUp 150ms ease-out',
            }}
          >
            {isSuccess && <CheckCircle2 size={16} color="#10B981" />}
            {isError && <AlertCircle size={16} color="#EF4444" />}
            {!isSuccess && !isError && <Info size={16} color="#38BDF8" />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              style={{ color: '#94A3B8', padding: '2px' }}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}


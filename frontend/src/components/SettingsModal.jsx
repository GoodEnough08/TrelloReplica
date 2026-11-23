import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Activity,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export function SettingsModal({
  isOpen,
  onClose,
  boards,
  columns,
  tasks,
  onResetDemoData,
  onExportData,
}) {
  const [healthStatus, setHealthStatus] = useState({ checking: true, online: false });

  useEffect(() => {
    if (isOpen) {
      setHealthStatus({ checking: true, online: false });
      checkBackendHealth().then(res => {
        setHealthStatus({ checking: false, ...res });
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const data = {
      taskflowVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      boards,
      columns,
      tasks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Settings & Diagnostic Status
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Backend API Health Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Backend API Status
            </h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color={healthStatus.online ? 'var(--success-text)' : 'var(--danger-text)'} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Flask API (/api/health)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {healthStatus.checking
                      ? 'Probing server status...'
                      : healthStatus.online
                      ? `Online • ${healthStatus.service || 'Ready'}`
                      : `Offline (${healthStatus.error || 'Server not reachable'})`}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: healthStatus.online ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: healthStatus.online ? 'var(--success-text)' : 'var(--danger-text)',
                }}
              >
                {healthStatus.checking ? 'Checking...' : healthStatus.online ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          {/* LocalStorage Data Management */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Storage Diagnostics
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div style={{ padding: '10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>BOARDS</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{boards.length}</div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>COLUMNS</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{columns.length}</div>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TASKS</div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{tasks.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDownloadBackup}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Reset all boards and tasks to the original demonstration data?')) {
                    onResetDemoData();
                    onClose();
                  }
                }}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', color: 'var(--danger-text)' }}
              >
                <RotateCcw size={14} />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


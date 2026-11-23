import React, { useState } from 'react';
import {
  Layout,
  Plus,
  RotateCcw,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

export function Sidebar({
  isOpen,
  onClose,
  workspaces,
  boards,
  activeBoardId,
  onSelectBoard,
  onOpenCreateBoard,
  onResetDemoData,
  onOpenSettings,
}) {
  const [selectedWsId, setSelectedWsId] = useState(workspaces[0]?.id || 'ws-1');
  const [showWsMenu, setShowWsMenu] = useState(false);

  const currentWorkspace = workspaces.find(w => w.id === selectedWsId) || workspaces[0];
  const recentBoards = boards.slice(0, 4);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Section: Brand & Workspace */}
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/logo.svg" alt="TaskFlow Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
              <div>
                <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                  TaskFlow
                </span>
                <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 600, letterSpacing: '0.02em' }}>
                  PRO EDITION
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ display: 'none', padding: '6px' }}
              id="sidebar-mobile-close"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Workspace Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowWsMenu(prev => !prev)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                background: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Layers size={16} color="var(--primary-600)" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentWorkspace?.name || 'Workspace'}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {showWsMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 20,
                  padding: '4px',
                }}
              >
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setSelectedWsId(ws.id);
                      setShowWsMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      fontWeight: selectedWsId === ws.id ? 700 : 500,
                      background: selectedWsId === ws.id ? 'var(--primary-50)' : 'transparent',
                      color: selectedWsId === ws.id ? 'var(--primary-700)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{ws.name}</span>
                    {selectedWsId === ws.id && <CheckCircle2 size={14} color="var(--primary-600)" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Section: Navigation & Boards List */}
        <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {/* My Boards Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 8px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}
          >
            <span>My Boards</span>
            <button
              onClick={onOpenCreateBoard}
              title="Create New Board"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--primary-600)',
                background: 'var(--primary-50)',
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Boards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {boards.map(b => {
              const isActive = b.id === activeBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    onSelectBoard(b.id);
                    onClose?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--primary-50)' : 'transparent',
                    color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'var(--bg-surface-subtle)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: b.themeColor || '#4F46E5',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Recent Boards */}
          <div style={{ marginTop: '22px' }}>
            <div
              style={{
                padding: '0 8px 8px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              Recent Boards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {recentBoards.map(rb => (
                <button
                  key={rb.id}
                  onClick={() => {
                    onSelectBoard(rb.id);
                    onClose?.();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>📋</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rb.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions: Reset, Settings & User Profile */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <button
              onClick={onResetDemoData}
              title="Reset sample demonstration data"
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '6px 10px', fontSize: '12px' }}
            >
              <RotateCcw size={13} />
              <span>Reset Demo</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Open Settings & API Health"
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              <Settings size={14} />
            </button>
          </div>

          {/* User Profile Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5, #9333EA)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              AM
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Alex Mercer
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Internship Candidate
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


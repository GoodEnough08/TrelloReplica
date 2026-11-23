import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';

export function BoardHeader({
  board,
  tasks,
  columns,
  onOpenSidebar,
  onOpenCreateTask,
  onOpenAISummary,
  onOpenEditBoard,
  onDeleteBoard,
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Compute metrics for header
  const totalTasks = tasks.length;
  const doneColIds = new Set(
    columns.filter(c => /done|finish|closed|completed/i.test(c.title)).map(c => c.id)
  );
  const completedTasks = tasks.filter(t => doneColIds.has(t.columnId)).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formattedDate = board?.createdAt
    ? new Date(board.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently created';

  return (
    <header className="board-header">
      {/* Left side: Hamburger (mobile) + Board Title & Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <button
          onClick={onOpenSidebar}
          className="btn-secondary"
          style={{ padding: '8px', borderRadius: 'var(--radius-md)' }}
          aria-label="Open Sidebar"
        >
          <Menu size={18} />
        </button>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: board?.themeColor || '#4F46E5',
                flexShrink: 0,
              }}
            />
            <h1
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {board?.title || 'Project Board'}
            </h1>

            {/* Progress Badge */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: progressPct === 100 ? 'var(--success-text)' : 'var(--primary-700)',
                background: progressPct === 100 ? 'var(--success-bg)' : 'var(--primary-50)',
                border: `1px solid ${progressPct === 100 ? 'var(--success-border)' : 'var(--primary-100)'}`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {progressPct}% Done
            </span>
          </div>

          {board?.description && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '650px',
              }}
            >
              {board.description}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Board Creation Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginRight: '6px',
          }}
          className="desktop-only"
        >
          <Calendar size={13} />
          <span>Created {formattedDate}</span>
        </div>

        {/* AI Board Summary Button - Star feature */}
        <button
          onClick={onOpenAISummary}
          className="btn-ai-sparkle"
          title="Generate instant AI board summary & insights"
        >
          <Sparkles size={16} />
          <span>AI Board Summary</span>
        </button>

        {/* Add Task Button */}
        <button
          onClick={onOpenCreateTask}
          className="btn-primary"
          title="Create a new task"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>

        {/* Board Options Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="btn-secondary"
            style={{ padding: '8px' }}
            aria-label="Board options"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 30,
                width: '180px',
                padding: '4px',
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenEditBoard();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Edit2 size={14} />
                <span>Edit Board</span>
              </button>

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteBoard();
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={14} />
                <span>Delete Board</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, AlertCircle, MoreHorizontal, ArrowRight, Trash2 } from 'lucide-react';
import { PRIORITY_CONFIG, AVAILABLE_TAGS } from '../utils/initialData';

export function TaskCard({
  task,
  index,
  columns,
  onOpenTaskModal,
  onMoveTask,
  onDeleteTask,
}) {
  const [showQuickMove, setShowQuickMove] = useState(false);

  // Check if overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < todayStr;
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;

  // Formatting date
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={() => onOpenTaskModal(task)}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* Card Header: Priority Pill & Quick Menu */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              className="priority-pill"
              style={{
                backgroundColor: priorityInfo.bg,
                color: priorityInfo.color,
                border: `1px solid ${priorityInfo.border}`,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: priorityInfo.dot,
                }}
              />
              {priorityInfo.label}
            </span>

            {/* Quick Actions Dropdown */}
            <div
              style={{ position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQuickMove(prev => !prev)}
                className="btn-ghost"
                style={{ padding: '2px 4px', color: 'var(--text-muted)' }}
                aria-label="Card actions"
              >
                <MoreHorizontal size={14} />
              </button>

              {showQuickMove && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 25,
                    width: '160px',
                    padding: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      padding: '4px 8px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Move to column:
                  </div>
                  {columns.map(col => (
                    <button
                      key={col.id}
                      disabled={col.id === task.columnId}
                      onClick={() => {
                        setShowQuickMove(false);
                        onMoveTask(task.id, col.id);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: col.id === task.columnId ? 'var(--text-muted)' : 'var(--text-primary)',
                        opacity: col.id === task.columnId ? 0.5 : 1,
                      }}
                    >
                      <span>{col.title}</span>
                      <ArrowRight size={12} />
                    </button>
                  ))}
                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      setShowQuickMove(false);
                      onDeleteTask(task.id);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--danger-text)',
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Delete Task</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Task Title */}
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              marginBottom: task.description || (task.labels && task.labels.length > 0) ? '8px' : '4px',
            }}
          >
            {task.title}
          </h4>

          {/* Description Preview */}
          {task.description && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                marginBottom: '10px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
            </p>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {task.labels.map(lbl => {
                const tagMeta = AVAILABLE_TAGS.find(t => t.name.toLowerCase() === lbl.toLowerCase()) || {
                  bg: '#F1F5F9',
                  color: '#475569',
                  border: '#CBD5E1',
                };
                return (
                  <span
                    key={lbl}
                    className="tag-pill"
                    style={{
                      backgroundColor: tagMeta.bg,
                      color: tagMeta.color,
                      borderColor: tagMeta.border,
                    }}
                  >
                    {lbl}
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer: Due date */}
          {task.dueDate && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isOverdue ? 'var(--danger-text)' : 'var(--text-muted)',
                  backgroundColor: isOverdue ? 'var(--danger-bg)' : 'transparent',
                  padding: isOverdue ? '2px 6px' : '0',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                <span>{isOverdue ? `Overdue (${formattedDueDate})` : formattedDueDate}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}


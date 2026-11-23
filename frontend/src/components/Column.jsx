import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import {
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { TaskCard } from './TaskCard';

export function Column({
  column,
  tasks,
  columns,
  columnIndex,
  onOpenTaskModal,
  onMoveTask,
  onDeleteTask,
  onQuickAddTask,
  onUpdateColumnTitle,
  onDeleteColumn,
  onMoveColumn,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleSaveTitle = () => {
    if (titleText.trim() && titleText !== column.title) {
      onUpdateColumnTitle(column.id, titleText.trim());
    } else {
      setTitleText(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (newCardTitle.trim()) {
      onQuickAddTask(column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="kanban-column">
      {/* Column Header */}
      <div className="column-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {isEditingTitle ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <input
                type="text"
                value={titleText}
                onChange={e => setTitleText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setTitleText(column.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="form-input"
                style={{ padding: '4px 8px', fontSize: '13px', height: '28px' }}
              />
              <button
                onClick={handleSaveTitle}
                className="btn-primary"
                style={{ padding: '4px 6px', height: '28px' }}
                aria-label="Save column title"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setTitleText(column.title);
                  setIsEditingTitle(false);
                }}
                className="btn-secondary"
                style={{ padding: '4px 6px', height: '28px' }}
                aria-label="Cancel editing title"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: 0 }}
              onClick={() => setIsEditingTitle(true)}
              title="Click to rename column"
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {column.title}
              </h3>
              <span className="badge-count">{tasks.length}</span>
            </div>
          )}
        </div>

        {/* Column Actions Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="btn-ghost"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
            aria-label="Column settings"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
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
                  setIsEditingTitle(true);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Edit2 size={13} />
                <span>Rename Column</span>
              </button>

              {/* Move column left/right */}
              <div style={{ display: 'flex', gap: '4px', padding: '4px 6px' }}>
                <button
                  disabled={columnIndex === 0}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumn(column.id, 'left');
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px', justifyContent: 'center' }}
                  title="Move column left"
                >
                  <ChevronLeft size={13} />
                  <span>Left</span>
                </button>
                <button
                  disabled={columnIndex === columns.length - 1}
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumn(column.id, 'right');
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '4px 6px', fontSize: '11px', justifyContent: 'center' }}
                  title="Move column right"
                >
                  <span>Right</span>
                  <ChevronRight size={13} />
                </button>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDeleteColumn(column.id);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--danger-text)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={13} />
                <span>Delete Column</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List Droppable */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="column-cards-list"
            style={{
              backgroundColor: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
              transition: 'background-color var(--transition-fast)',
            }}
          >
            {tasks.length === 0 && !isAddingCard && (
              <div
                style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  border: '1px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  margin: '4px 0',
                }}
              >
                No tasks in this column
              </div>
            )}

            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                columns={columns}
                onOpenTaskModal={onOpenTaskModal}
                onMoveTask={onMoveTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {provided.placeholder}

            {/* Inline Quick Add Card Composer */}
            {isAddingCard ? (
              <form onSubmit={handleQuickAddSubmit} style={{ marginTop: '4px' }}>
                <textarea
                  placeholder="Enter a title for this card..."
                  value={newCardTitle}
                  onChange={e => setNewCardTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAddSubmit(e);
                    }
                    if (e.key === 'Escape') {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }
                  }}
                  autoFocus
                  className="form-textarea"
                  style={{ minHeight: '68px', padding: '10px', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Add Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                    }}
                    className="btn-ghost"
                    style={{ padding: '6px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        )}
      </Droppable>

      {/* Column Footer: Quick Add Card Trigger */}
      {!isAddingCard && (
        <div style={{ padding: '8px 12px 12px' }}>
          <button
            onClick={() => setIsAddingCard(true)}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            <Plus size={15} color="var(--primary-600)" />
            <span>Add a card</span>
          </button>
        </div>
      )}
    </div>
  );
}


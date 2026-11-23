import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, X, LayoutGrid } from 'lucide-react';
import { Column } from './Column';

export function KanbanBoard({
  columns,
  tasksByColumn,
  onDragEnd,
  onOpenTaskModal,
  onMoveTask,
  onDeleteTask,
  onQuickAddTask,
  onUpdateColumnTitle,
  onDeleteColumn,
  onMoveColumn,
  onAddColumn,
}) {
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const handleAddColSubmit = (e) => {
    e.preventDefault();
    if (newColTitle.trim()) {
      onAddColumn(newColTitle.trim());
      setNewColTitle('');
      setIsAddingCol(false);
    }
  };

  if (columns.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--primary-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-600)',
            marginBottom: '16px',
          }}
        >
          <LayoutGrid size={28} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          This board has no columns yet
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '20px' }}>
          Set up columns like "To Do", "In Progress", and "Done" to start tracking tasks.
        </p>
        <button
          onClick={() => {
            onAddColumn('To Do');
            onAddColumn('In Progress');
            onAddColumn('Done');
          }}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>Add Default Columns</span>
        </button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board-viewport">
        {columns.map((column, index) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            columns={columns}
            columnIndex={index}
            onOpenTaskModal={onOpenTaskModal}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onQuickAddTask={onQuickAddTask}
            onUpdateColumnTitle={onUpdateColumnTitle}
            onDeleteColumn={onDeleteColumn}
            onMoveColumn={onMoveColumn}
          />
        ))}

        {/* Add Another Column Composer */}
        <div style={{ width: '280px', minWidth: '280px', flexShrink: 0 }}>
          {isAddingCol ? (
            <form
              onSubmit={handleAddColSubmit}
              style={{
                background: 'var(--bg-column)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <input
                type="text"
                placeholder="Enter column title..."
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    setIsAddingCol(false);
                    setNewColTitle('');
                  }
                }}
                autoFocus
                className="form-input"
                style={{ fontSize: '13px', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Add Column
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCol(false);
                    setNewColTitle('');
                  }}
                  className="btn-ghost"
                  style={{ padding: '6px' }}
                >
                  <X size={16} />
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(241, 245, 249, 0.7)',
                border: '1px dashed var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-column)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.7)';
                e.currentTarget.style.borderColor = 'var(--border-medium)';
              }}
            >
              <Plus size={16} color="var(--primary-600)" />
              <span>Add another column</span>
            </button>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}


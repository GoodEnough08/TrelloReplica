import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Flag,
  Tag,
  AlignLeft,
  Trash2,
  Columns,
  Clock,
  Plus,
} from 'lucide-react';
import { PRIORITY_CONFIG, AVAILABLE_TAGS } from '../utils/initialData';

export function TaskModal({
  isOpen,
  onClose,
  task,
  initialColumnId,
  columns,
  onSaveTask,
  onDeleteTask,
}) {
  const isEditing = Boolean(task?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setColumnId(task.columnId || columns[0]?.id || '');
      setPriority(task.priority || 'Medium');
      setDueDate(task.dueDate || '');
      setLabels(task.labels || []);
    } else {
      setTitle('');
      setDescription('');
      setColumnId(initialColumnId || columns[0]?.id || '');
      setPriority('Medium');
      setDueDate('');
      setLabels([]);
    }
    setShowAddTag(false);
    setNewCustomLabel('');
  }, [task, initialColumnId, columns, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      columnId: columnId || columns[0]?.id,
      priority,
      dueDate,
      labels,
    });
    onClose();
  };

  const toggleLabel = (tagName) => {
    setLabels(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const handleAddCustomLabel = (e) => {
    e.preventDefault();
    if (newCustomLabel.trim() && !labels.includes(newCustomLabel.trim())) {
      setLabels(prev => [...prev, newCustomLabel.trim()]);
      setNewCustomLabel('');
      setShowAddTag(false);
    }
  };

  const formattedCreatedAt = task?.createdAt
    ? new Date(task.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
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
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary-600)',
                background: 'var(--primary-50)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {isEditing ? 'EDIT TASK' : 'NEW TASK'}
            </span>
            {formattedCreatedAt && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Created on {formattedCreatedAt}
              </span>
            )}
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Task Title */}
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement user authentication flow"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              style={{ fontSize: '15px', fontWeight: 600 }}
              autoFocus
            />
          </div>

          {/* Grid: Column, Priority, Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Column Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Columns size={14} />
                <span>Column / Status</span>
              </label>
              <select
                value={columnId}
                onChange={e => setColumnId(e.target.value)}
                className="form-select"
              >
                {columns.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag size={14} />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="form-select"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

            {/* Due Date Picker */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Labels / Tags Section */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Tag size={14} />
              <span>Labels & Tags</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              {AVAILABLE_TAGS.map(t => {
                const isSelected = labels.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleLabel(t.name)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: isSelected ? t.bg : 'var(--bg-surface-subtle)',
                      color: isSelected ? t.color : 'var(--text-muted)',
                      border: `1px solid ${isSelected ? t.border : 'var(--border-subtle)'}`,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isSelected ? `✓ ${t.name}` : `+ ${t.name}`}
                  </button>
                );
              })}

              {/* Add Custom Label */}
              {showAddTag ? (
                <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Tag name"
                    value={newCustomLabel}
                    onChange={e => setNewCustomLabel(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddCustomLabel(e);
                      if (e.key === 'Escape') setShowAddTag(false);
                    }}
                    className="form-input"
                    style={{ width: '100px', height: '28px', padding: '2px 6px', fontSize: '11px' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomLabel}
                    className="btn-primary"
                    style={{ height: '28px', padding: '2px 8px', fontSize: '11px' }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddTag(true)}
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 8px', color: 'var(--primary-600)' }}
                >
                  <Plus size={13} />
                  <span>Custom Tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlignLeft size={14} />
              <span>Detailed Description</span>
            </label>
            <textarea
              placeholder="Add details, acceptance criteria, links, or notes..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '130px' }}
            />
          </div>

          {/* Modal Footer */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDeleteTask(task.id);
                    onClose();
                  }
                }}
                className="btn-ghost"
                style={{ color: 'var(--danger-text)', padding: '8px 12px' }}
              >
                <Trash2 size={16} />
                <span>Delete Task</span>
              </button>
            ) : <div />}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


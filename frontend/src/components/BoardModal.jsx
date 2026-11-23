import React, { useState, useEffect } from 'react';
import { X, Layout } from 'lucide-react';

const THEME_COLORS = [
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Violet', hex: '#8B5CF6' },
];

export function BoardModal({
  isOpen,
  onClose,
  board,
  onSaveBoard,
}) {
  const isEditing = Boolean(board?.id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#4F46E5');

  useEffect(() => {
    if (board) {
      setTitle(board.title || '');
      setDescription(board.description || '');
      setThemeColor(board.themeColor || '#4F46E5');
    } else {
      setTitle('');
      setDescription('');
      setThemeColor('#4F46E5');
    }
  }, [board, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveBoard({
      id: board?.id,
      title: title.trim(),
      description: description.trim(),
      themeColor,
    });
    onClose();
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
            <Layout size={18} color="var(--primary-600)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isEditing ? 'Edit Board' : 'Create New Board'}
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label">Board Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q1 Product Roadmap"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Board Description</label>
            <textarea
              placeholder="Brief summary of board objectives and scope..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Accent Theme Color</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              {THEME_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setThemeColor(c.hex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: c.hex,
                    border: themeColor === c.hex ? '3px solid #0F172A' : '1px solid rgba(0,0,0,0.1)',
                    transform: themeColor === c.hex ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all var(--transition-fast)',
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


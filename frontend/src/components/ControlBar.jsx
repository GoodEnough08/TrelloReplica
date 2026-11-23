import React from 'react';
import { Search, X, Filter, Tag, Flag, AlertCircle, Plus } from 'lucide-react';
import { AVAILABLE_TAGS } from '../utils/initialData';

export function ControlBar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  tagFilter,
  onTagFilterChange,
  columnFilter,
  onColumnFilterChange,
  columns,
  totalTasks,
  filteredCount,
  onClearFilters,
  onOpenAddColumn,
}) {
  const hasActiveFilters = searchQuery.trim() !== '' || priorityFilter !== 'ALL' || tagFilter !== 'ALL' || columnFilter !== 'ALL';

  return (
    <div className="control-bar">
      {/* Left side: Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, minWidth: '260px' }}>
        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', paddingRight: searchQuery ? '30px' : '10px', height: '36px', fontSize: '13px' }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '2px',
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={priorityFilter}
            onChange={e => onPriorityFilterChange(e.target.value)}
            className="form-select"
            style={{ height: '36px', fontSize: '13px', width: 'auto', padding: '6px 10px' }}
          >
            <option value="ALL">Priority: All</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
        </div>

        {/* Status / Column Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={columnFilter}
            onChange={e => onColumnFilterChange(e.target.value)}
            className="form-select"
            style={{ height: '36px', fontSize: '13px', width: 'auto', padding: '6px 10px' }}
          >
            <option value="ALL">Status: All Columns</option>
            {columns.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={tagFilter}
            onChange={e => onTagFilterChange(e.target.value)}
            className="form-select"
            style={{ height: '36px', fontSize: '13px', width: 'auto', padding: '6px 10px' }}
          >
            <option value="ALL">Label: All</option>
            {AVAILABLE_TAGS.map(t => (
              <option key={t.name} value={t.name}>
                🏷️ {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn-ghost"
            style={{
              height: '36px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--danger-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <X size={14} />
            <span>Clear filters ({filteredCount} of {totalTasks})</span>
          </button>
        )}
      </div>

      {/* Right side: Add Column button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onOpenAddColumn}
          className="btn-secondary"
          style={{ height: '36px', fontSize: '13px' }}
          title="Add a custom column to this board"
        >
          <Plus size={15} />
          <span>Add Column</span>
        </button>
      </div>
    </div>
  );
}


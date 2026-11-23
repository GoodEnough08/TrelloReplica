import React, { useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useBoardData } from './hooks/useBoardData';
import { Sidebar } from './components/Sidebar';
import { BoardHeader } from './components/BoardHeader';
import { ControlBar } from './components/ControlBar';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskModal } from './components/TaskModal';
import { BoardModal } from './components/BoardModal';
import { AISummaryModal } from './components/AISummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';

export function App() {
  const {
    workspaces,
    boards,
    activeBoard,
    activeBoardId,
    setActiveBoardId,
    activeColumns,
    activeTasks,
    tasksByColumn,
    createBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTaskToColumn,
    handleDragEnd,
    resetDemoData,
  } = useBoardData();

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [tagFilter, setTagFilter] = useState('ALL');
  const [columnFilter, setColumnFilter] = useState('ALL');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalColId, setTaskModalColId] = useState('');

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filter tasks based on search & filters
  const filteredTasksByColumn = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = {};

    activeColumns.forEach(col => {
      const colTasks = tasksByColumn[col.id] || [];
      result[col.id] = colTasks.filter(task => {
        // Search query
        if (query) {
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }

        // Priority filter
        if (priorityFilter !== 'ALL') {
          if (task.priority?.toLowerCase() !== priorityFilter.toLowerCase()) return false;
        }

        // Tag filter
        if (tagFilter !== 'ALL') {
          if (!task.labels?.some(lbl => lbl.toLowerCase() === tagFilter.toLowerCase())) {
            return false;
          }
        }

        // Column / Status filter
        if (columnFilter !== 'ALL') {
          if (task.columnId !== columnFilter) return false;
        }

        return true;
      });
    });

    return result;
  }, [activeColumns, tasksByColumn, searchQuery, priorityFilter, tagFilter, columnFilter]);

  // Total filtered count
  const filteredCount = useMemo(() => {
    return Object.values(filteredTasksByColumn).reduce((acc, list) => acc + list.length, 0);
  }, [filteredTasksByColumn]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setTagFilter('ALL');
    setColumnFilter('ALL');
  };

  // Task modal handlers
  const handleOpenCreateTask = (prefillColId) => {
    setSelectedTask(null);
    setTaskModalColId(prefillColId || activeColumns[0]?.id || '');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setSelectedTask(task);
    setTaskModalColId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (taskData.id) {
      updateTask(taskData.id, taskData);
      addToast('Task updated successfully', 'success');
    } else {
      createTask(taskData);
      addToast('New task added', 'success');
    }
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    addToast('Task deleted', 'info');
  };

  const handleQuickAddTask = (columnId, title) => {
    createTask({ columnId, title, priority: 'Medium' });
    addToast('Card added', 'success');
  };

  // Board modal handlers
  const handleOpenCreateBoard = () => {
    setEditingBoard(null);
    setIsBoardModalOpen(true);
  };

  const handleOpenEditBoard = () => {
    setEditingBoard(activeBoard);
    setIsBoardModalOpen(true);
  };

  const handleSaveBoard = (boardData) => {
    if (boardData.id) {
      updateBoard(boardData.id, boardData);
      addToast(`Board "${boardData.title}" updated`, 'success');
    } else {
      const created = createBoard(boardData);
      addToast(`Board "${created.title}" created`, 'success');
    }
  };

  const handleDeleteBoard = () => {
    if (!activeBoard) return;
    if (boards.length <= 1) {
      alert('You cannot delete the only remaining board. Create another board first.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete board "${activeBoard.title}"?`)) {
      deleteBoard(activeBoard.id);
      addToast('Board deleted', 'info');
    }
  };

  // Column handlers
  const handleUpdateColumnTitle = (columnId, newTitle) => {
    updateColumn(columnId, { title: newTitle });
    addToast('Column renamed', 'success');
  };

  const handleDeleteColumn = (columnId) => {
    const colTasks = tasksByColumn[columnId] || [];
    if (colTasks.length > 0) {
      if (!window.confirm(`This column contains ${colTasks.length} task(s). Deleting it will remove these tasks. Continue?`)) {
        return;
      }
    }
    deleteColumn(columnId);
    addToast('Column removed', 'info');
  };

  const handleResetData = () => {
    resetDemoData();
    handleClearFilters();
    addToast('Demo data restored to initial state', 'success');
  };

  // Trigger celebration confetti when moving a card to "Done"
  const handleWrappedDragEnd = (result) => {
    handleDragEnd(result);
    const destCol = activeColumns.find(c => c.id === result.destination?.droppableId);
    if (destCol && /done|completed|finished/i.test(destCol.title)) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      addToast('Task completed! Great job! 🎉', 'success');
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        workspaces={workspaces}
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={(id) => {
          setActiveBoardId(id);
          handleClearFilters();
        }}
        onOpenCreateBoard={handleOpenCreateBoard}
        onResetDemoData={handleResetData}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Board View Area */}
      <div className="main-wrapper">
        <BoardHeader
          board={activeBoard}
          tasks={activeTasks}
          columns={activeColumns}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenCreateTask={() => handleOpenCreateTask()}
          onOpenAISummary={() => setIsAISummaryOpen(true)}
          onOpenEditBoard={handleOpenEditBoard}
          onDeleteBoard={handleDeleteBoard}
        />

        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          columnFilter={columnFilter}
          onColumnFilterChange={setColumnFilter}
          columns={activeColumns}
          totalTasks={activeTasks.length}
          filteredCount={filteredCount}
          onClearFilters={handleClearFilters}
          onOpenAddColumn={() => {
            const name = window.prompt('Enter new column name:');
            if (name && name.trim()) {
              addColumn(name.trim());
              addToast('Column added', 'success');
            }
          }}
        />

        <KanbanBoard
          columns={activeColumns}
          tasksByColumn={filteredTasksByColumn}
          onDragEnd={handleWrappedDragEnd}
          onOpenTaskModal={handleOpenEditTask}
          onMoveTask={(taskId, targetColId) => {
            moveTaskToColumn(taskId, targetColId);
            addToast('Task moved', 'info');
          }}
          onDeleteTask={handleDeleteTask}
          onQuickAddTask={handleQuickAddTask}
          onUpdateColumnTitle={handleUpdateColumnTitle}
          onDeleteColumn={handleDeleteColumn}
          onMoveColumn={moveColumn}
          onAddColumn={(title) => {
            addColumn(title);
            addToast('Column added', 'success');
          }}
        />
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        initialColumnId={taskModalColId}
        columns={activeColumns}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        board={editingBoard}
        onSaveBoard={handleSaveBoard}
      />

      <AISummaryModal
        isOpen={isAISummaryOpen}
        onClose={() => setIsAISummaryOpen(false)}
        board={activeBoard}
        columns={activeColumns}
        tasks={activeTasks}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        boards={boards}
        columns={activeColumns}
        tasks={activeTasks}
        onResetDemoData={handleResetData}
        onExportData={() => {}}
      />

      {/* Toast System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;


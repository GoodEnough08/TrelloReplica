import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import {
  INITIAL_WORKSPACES,
  INITIAL_BOARDS,
  INITIAL_COLUMNS,
  INITIAL_TASKS,
} from '../utils/initialData';

const STORAGE_KEYS = {
  WORKSPACES: 'taskflow_workspaces_v1',
  BOARDS: 'taskflow_boards_v1',
  COLUMNS: 'taskflow_columns_v1',
  TASKS: 'taskflow_tasks_v1',
  ACTIVE_BOARD: 'taskflow_active_board_v1',
};

export function useBoardData() {
  const [workspaces, setWorkspaces] = useLocalStorage(STORAGE_KEYS.WORKSPACES, INITIAL_WORKSPACES);
  const [boards, setBoards] = useLocalStorage(STORAGE_KEYS.BOARDS, INITIAL_BOARDS);
  const [columns, setColumns] = useLocalStorage(STORAGE_KEYS.COLUMNS, INITIAL_COLUMNS);
  const [tasks, setTasks] = useLocalStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  const [activeBoardId, setActiveBoardId] = useLocalStorage(
    STORAGE_KEYS.ACTIVE_BOARD,
    INITIAL_BOARDS[0]?.id || ''
  );

  // Active board object
  const activeBoard = useMemo(() => {
    return boards.find(b => b.id === activeBoardId) || boards[0] || null;
  }, [boards, activeBoardId]);

  // Active board's columns sorted by order
  const activeColumns = useMemo(() => {
    if (!activeBoard) return [];
    return columns
      .filter(col => col.boardId === activeBoard.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [columns, activeBoard]);

  // Active board's tasks
  const activeTasks = useMemo(() => {
    if (!activeBoard) return [];
    return tasks.filter(t => t.boardId === activeBoard.id);
  }, [tasks, activeBoard]);

  // Map of tasks grouped by columnId
  const tasksByColumn = useMemo(() => {
    const map = {};
    activeColumns.forEach(col => {
      map[col.id] = [];
    });
    activeTasks.forEach(task => {
      if (map[task.columnId]) {
        map[task.columnId].push(task);
      } else if (activeColumns.length > 0) {
        // Fallback to first column if columnId was missing or deleted
        map[activeColumns[0].id].push(task);
      }
    });
    return map;
  }, [activeColumns, activeTasks]);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    setWorkspaces(INITIAL_WORKSPACES);
    setBoards(INITIAL_BOARDS);
    setColumns(INITIAL_COLUMNS);
    setTasks(INITIAL_TASKS);
    setActiveBoardId(INITIAL_BOARDS[0].id);
  }, [setWorkspaces, setBoards, setColumns, setTasks, setActiveBoardId]);

  // Create board
  const createBoard = useCallback((boardData) => {
    const newBoard = {
      id: `board-${Date.now()}`,
      workspaceId: boardData.workspaceId || workspaces[0]?.id || 'ws-1',
      title: boardData.title.trim(),
      description: boardData.description?.trim() || '',
      createdAt: new Date().toISOString(),
      themeColor: boardData.themeColor || '#4F46E5',
      isFavorite: false,
    };

    // Default 5 columns for new board
    const defaultCols = [
      { id: `col-${newBoard.id}-1`, boardId: newBoard.id, title: 'Backlog', order: 0 },
      { id: `col-${newBoard.id}-2`, boardId: newBoard.id, title: 'To Do', order: 1 },
      { id: `col-${newBoard.id}-3`, boardId: newBoard.id, title: 'In Progress', order: 2 },
      { id: `col-${newBoard.id}-4`, boardId: newBoard.id, title: 'Review', order: 3 },
      { id: `col-${newBoard.id}-5`, boardId: newBoard.id, title: 'Done', order: 4 },
    ];

    setBoards(prev => [newBoard, ...prev]);
    setColumns(prev => [...prev, ...defaultCols]);
    setActiveBoardId(newBoard.id);
    return newBoard;
  }, [workspaces, setBoards, setColumns, setActiveBoardId]);

  // Update board
  const updateBoard = useCallback((boardId, updates) => {
    setBoards(prev => prev.map(b => (b.id === boardId ? { ...b, ...updates } : b)));
  }, [setBoards]);

  // Delete board
  const deleteBoard = useCallback((boardId) => {
    setBoards(prev => {
      const remaining = prev.filter(b => b.id !== boardId);
      if (activeBoardId === boardId && remaining.length > 0) {
        setActiveBoardId(remaining[0].id);
      }
      return remaining;
    });
    setColumns(prev => prev.filter(c => c.boardId !== boardId));
    setTasks(prev => prev.filter(t => t.boardId !== boardId));
  }, [activeBoardId, setBoards, setActiveBoardId, setColumns, setTasks]);

  // Add column
  const addColumn = useCallback((title) => {
    if (!activeBoard || !title.trim()) return null;
    const newCol = {
      id: `col-${Date.now()}`,
      boardId: activeBoard.id,
      title: title.trim(),
      order: activeColumns.length,
    };
    setColumns(prev => [...prev, newCol]);
    return newCol;
  }, [activeBoard, activeColumns.length, setColumns]);

  // Update column
  const updateColumn = useCallback((columnId, updates) => {
    setColumns(prev => prev.map(col => (col.id === columnId ? { ...col, ...updates } : col)));
  }, [setColumns]);

  // Delete column
  const deleteColumn = useCallback((columnId) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
    // Remove tasks in that column
    setTasks(prev => prev.filter(t => t.columnId !== columnId));
  }, [setColumns, setTasks]);

  // Move column left or right
  const moveColumn = useCallback((columnId, direction) => {
    const currentIndex = activeColumns.findIndex(c => c.id === columnId);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= activeColumns.length) return;

    const reordered = [...activeColumns];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update order values
    const updatedMap = new Map();
    reordered.forEach((col, idx) => {
      updatedMap.set(col.id, idx);
    });

    setColumns(prev =>
      prev.map(c => {
        if (updatedMap.has(c.id)) {
          return { ...c, order: updatedMap.get(c.id) };
        }
        return c;
      })
    );
  }, [activeColumns, setColumns]);

  // Create task
  const createTask = useCallback((taskData) => {
    if (!activeBoard) return null;
    const newTask = {
      id: `task-${Date.now()}`,
      boardId: activeBoard.id,
      columnId: taskData.columnId || activeColumns[0]?.id || '',
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || '',
      labels: Array.isArray(taskData.labels) ? taskData.labels : [],
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, [activeBoard, activeColumns, setTasks]);

  // Update task
  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
  }, [setTasks]);

  // Delete task
  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, [setTasks]);

  // Move task to a specific column directly (for keyboard / accessible actions)
  const moveTaskToColumn = useCallback((taskId, targetColumnId) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );
  }, [setTasks]);

  // Drag and drop handler
  const handleDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    // Dropped in same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;

    setTasks(prevTasks => {
      // Get all tasks for this board
      const otherBoardTasks = prevTasks.filter(t => t.boardId !== activeBoard.id);
      const currentBoardTasks = prevTasks.filter(t => t.boardId === activeBoard.id);

      // Reorder within the same column
      if (sourceColId === destColId) {
        const columnTasks = currentBoardTasks.filter(t => t.columnId === sourceColId);
        const nonColTasks = currentBoardTasks.filter(t => t.columnId !== sourceColId);

        const [movedTask] = columnTasks.splice(source.index, 1);
        columnTasks.splice(destination.index, 0, movedTask);

        return [...otherBoardTasks, ...nonColTasks, ...columnTasks];
      }

      // Move across columns
      const sourceTasks = currentBoardTasks.filter(t => t.columnId === sourceColId);
      const destTasks = currentBoardTasks.filter(t => t.columnId === destColId);
      const untouchedTasks = currentBoardTasks.filter(
        t => t.columnId !== sourceColId && t.columnId !== destColId
      );

      const [movedTask] = sourceTasks.splice(source.index, 1);
      const updatedMovedTask = { ...movedTask, columnId: destColId };
      destTasks.splice(destination.index, 0, updatedMovedTask);

      return [...otherBoardTasks, ...untouchedTasks, ...sourceTasks, ...destTasks];
    });
  }, [activeBoard, setTasks]);

  return {
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
    rawState: { boards, columns, tasks },
  };
}


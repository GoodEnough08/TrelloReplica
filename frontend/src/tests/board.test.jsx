import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardData } from '../hooks/useBoardData';
import { INITIAL_BOARDS, INITIAL_COLUMNS, INITIAL_TASKS } from '../utils/initialData';

describe('TaskFlow Board Management & Persistence Suite', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default demo data if LocalStorage is empty', () => {
    const { result } = renderHook(() => useBoardData());

    expect(result.current.boards.length).toBeGreaterThan(0);
    expect(result.current.activeBoard).not.toBeNull();
    expect(result.current.activeBoard.title).toBe(INITIAL_BOARDS[0].title);
    expect(result.current.activeColumns.length).toBe(5);
    expect(result.current.activeTasks.length).toBeGreaterThan(0);
  });

  it('persists newly created tasks to LocalStorage', () => {
    const { result } = renderHook(() => useBoardData());

    const initialTaskCount = result.current.activeTasks.length;
    let createdTask;

    act(() => {
      createdTask = result.current.createTask({
        title: 'New Automated Test Task',
        description: 'Verifying end-to-end persistence',
        priority: 'High',
        dueDate: '2026-12-01',
        labels: ['Testing'],
        columnId: result.current.activeColumns[0].id,
      });
    });

    expect(createdTask).toBeDefined();
    expect(result.current.activeTasks.length).toBe(initialTaskCount + 1);

    // Verify localStorage has the new task
    const storedTasks = JSON.parse(window.localStorage.getItem('taskflow_tasks_v1'));
    const found = storedTasks.find(t => t.id === createdTask.id);
    expect(found).toBeDefined();
    expect(found.title).toBe('New Automated Test Task');
    expect(found.priority).toBe('High');
  });

  it('deletes tasks and updates state and LocalStorage', () => {
    const { result } = renderHook(() => useBoardData());

    const taskToDelete = result.current.activeTasks[0];
    const initialCount = result.current.activeTasks.length;

    act(() => {
      result.current.deleteTask(taskToDelete.id);
    });

    expect(result.current.activeTasks.length).toBe(initialCount - 1);
    const storedTasks = JSON.parse(window.localStorage.getItem('taskflow_tasks_v1'));
    expect(storedTasks.find(t => t.id === taskToDelete.id)).toBeUndefined();
  });

  it('moves task between columns (simulating drag-and-drop)', () => {
    const { result } = renderHook(() => useBoardData());

    const sourceCol = result.current.activeColumns[0]; // Backlog
    const destCol = result.current.activeColumns[4]; // Done
    const targetTask = result.current.activeTasks.find(t => t.columnId === sourceCol.id);
    expect(targetTask).toBeDefined();

    act(() => {
      result.current.moveTaskToColumn(targetTask.id, destCol.id);
    });

    // Check updated task
    const updated = result.current.activeTasks.find(t => t.id === targetTask.id);
    expect(updated.columnId).toBe(destCol.id);

    // Check localStorage persistence
    const storedTasks = JSON.parse(window.localStorage.getItem('taskflow_tasks_v1'));
    const storedUpdated = storedTasks.find(t => t.id === targetTask.id);
    expect(storedUpdated.columnId).toBe(destCol.id);
  });

  it('handles drag-and-drop reordering with handleDragEnd', () => {
    const { result } = renderHook(() => useBoardData());

    const colId = result.current.activeColumns[1].id; // To Do
    const colTasksBefore = result.current.tasksByColumn[colId];
    expect(colTasksBefore.length).toBeGreaterThan(1);

    const firstTaskId = colTasksBefore[0].id;

    // Simulate drag from index 0 to index 1 in same column
    act(() => {
      result.current.handleDragEnd({
        draggableId: firstTaskId,
        source: { droppableId: colId, index: 0 },
        destination: { droppableId: colId, index: 1 },
      });
    });

    const colTasksAfter = result.current.tasksByColumn[colId];
    expect(colTasksAfter[1].id).toBe(firstTaskId);
  });

  it('creates, renames, and deletes custom columns', () => {
    const { result } = renderHook(() => useBoardData());

    let newCol;
    act(() => {
      newCol = result.current.addColumn('QA Staging');
    });

    expect(newCol).toBeDefined();
    expect(result.current.activeColumns.some(c => c.title === 'QA Staging')).toBe(true);

    // Rename
    act(() => {
      result.current.updateColumn(newCol.id, { title: 'Verified Production' });
    });
    expect(result.current.activeColumns.some(c => c.title === 'Verified Production')).toBe(true);

    // Delete
    act(() => {
      result.current.deleteColumn(newCol.id);
    });
    expect(result.current.activeColumns.some(c => c.id === newCol.id)).toBe(false);
  });

  it('resets demo data to initial defaults upon command', () => {
    const { result } = renderHook(() => useBoardData());

    // Make a change
    act(() => {
      result.current.createTask({
        title: 'Temporary Task to be Reset',
        columnId: result.current.activeColumns[0].id,
      });
    });

    expect(result.current.activeTasks.some(t => t.title === 'Temporary Task to be Reset')).toBe(true);

    // Reset demo data
    act(() => {
      result.current.resetDemoData();
    });

    expect(result.current.activeTasks.some(t => t.title === 'Temporary Task to be Reset')).toBe(false);
    expect(result.current.boards.length).toBe(INITIAL_BOARDS.length);
  });
});


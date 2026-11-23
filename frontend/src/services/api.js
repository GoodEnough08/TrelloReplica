// Backend API service with fallback support
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Checks backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return { online: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message || 'Connection failed' };
  }
}

/**
 * Calls POST /api/ai/board-summary with board, columns, and tasks
 */
export async function getBoardSummary(board, columns, tasks) {
  const payload = {
    board: {
      id: board.id,
      title: board.title,
      description: board.description || '',
    },
    columns: columns.map(c => ({ id: c.id, title: c.title })),
    tasks: tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'Medium',
      columnId: t.columnId,
      dueDate: t.dueDate || null,
      labels: t.labels || [],
      createdAt: t.createdAt || null,
    })),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/board-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Server responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // If backend is unreachable, generate an instant client-side fallback
    console.warn('Backend API unavailable, falling back to local client calculation:', err.message);
    return generateClientSideFallback(board, columns, tasks, err.message);
  }
}

/**
 * Client-side fallback if backend server is not running
 */
function generateClientSideFallback(board, columns, tasks, errorDetails) {
  const total = tasks.length;
  const doneColIds = new Set(
    columns
      .filter(c => /done|finish|closed|completed/i.test(c.title))
      .map(c => c.id)
  );

  const completed = tasks.filter(t => doneColIds.has(t.columnId)).length;
  const pending = total - completed;
  const inProgressColIds = new Set(
    columns
      .filter(c => /progress|doing|review|active|testing/i.test(c.title))
      .map(c => c.id)
  );
  const inProgress = tasks.filter(t => inProgressColIds.has(t.columnId)).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    t => !doneColIds.has(t.columnId) && t.dueDate && t.dueDate < todayStr
  );
  const highPriority = tasks.filter(
    t => !doneColIds.has(t.columnId) && t.priority?.toLowerCase() === 'high'
  );

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const bottlenecks = [];
  if (overdueTasks.length > 0) {
    bottlenecks.push(`${overdueTasks.length} task(s) are overdue and require urgent completion.`);
  }
  if (highPriority.length > 2) {
    bottlenecks.push(`Heavy concentration of high-priority tasks pending (${highPriority.length} tasks).`);
  }
  if (inProgress > 4) {
    bottlenecks.push(`High work-in-progress limit: ${inProgress} tasks underway simultaneously.`);
  }
  if (bottlenecks.length === 0 && total > 0) {
    bottlenecks.push('Workflow distribution is well-balanced across columns.');
  }

  const suggested_next_actions = [];
  if (overdueTasks.length > 0) {
    suggested_next_actions.push(`Complete overdue item: "${overdueTasks[0].title}".`);
  }
  if (highPriority.length > 0) {
    suggested_next_actions.push(`Focus team effort on high-priority: "${highPriority[0].title}".`);
  }
  if (inProgress > 0) {
    suggested_next_actions.push('Move in-progress items through review to achieve done status.');
  }
  if (suggested_next_actions.length === 0) {
    suggested_next_actions.push('Add prioritized tasks to Backlog to start sprint.');
  }

  return {
    status_label: pct >= 80 ? 'Near Completion' : overdueTasks.length > 0 ? 'Attention Required' : 'Active Progress',
    executive_summary: `Board "${board.title}" has ${total} tasks with ${pct}% completed (${completed}/${total}). ${overdueTasks.length} overdue task(s) and ${highPriority.length} high-priority item(s) remain pending.`,
    progress_percentage: pct,
    total_tasks: total,
    completed_tasks: completed,
    pending_tasks: pending,
    in_progress_tasks: inProgress,
    high_priority_pending_tasks: highPriority.map(t => t.title),
    high_priority_count: highPriority.length,
    overdue_tasks: overdueTasks.map(t => `${t.title} (Due: ${t.dueDate})`),
    overdue_count: overdueTasks.length,
    bottlenecks,
    suggested_next_actions,
    columns_summary: columns.map(c => ({
      title: c.title,
      count: tasks.filter(t => t.columnId === c.id).length,
    })),
    provider: 'client_fallback',
    fallback_reason: `Backend service is temporarily offline (${errorDetails}). Generated via deterministic client-side engine.`,
  };
}


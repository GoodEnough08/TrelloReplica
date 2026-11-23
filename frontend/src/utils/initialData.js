// Comprehensive initial demonstration data for TaskFlow
export const INITIAL_WORKSPACES = [
  { id: 'ws-1', name: 'Core Engineering', role: 'Engineering Lead' },
  { id: 'ws-2', name: 'Product Design', role: 'Design Ops' },
  { id: 'ws-3', name: 'Growth & Marketing', role: 'Campaign Lead' },
];

export const INITIAL_BOARDS = [
  {
    id: 'board-taskflow-mvp',
    workspaceId: 'ws-1',
    title: 'TaskFlow MVP & Release',
    description: 'Core sprint tracker for the TaskFlow project management application internship submission.',
    createdAt: '2026-11-18T09:00:00.000Z',
    themeColor: '#4F46E5', // Indigo
    isFavorite: true,
  },
  {
    id: 'board-mobile-companion',
    workspaceId: 'ws-1',
    title: 'Mobile Companion App',
    description: 'React Native & PWA companion application planning and component library alignment.',
    createdAt: '2026-11-20T14:30:00.000Z',
    themeColor: '#0EA5E9', // Sky
    isFavorite: false,
  },
  {
    id: 'board-q4-marketing',
    workspaceId: 'ws-3',
    title: 'Q4 Product Launch & Socials',
    description: 'Marketing campaign assets, demo video recording, and developer community outreach.',
    createdAt: '2026-11-22T11:15:00.000Z',
    themeColor: '#10B981', // Emerald
    isFavorite: false,
  },
];

export const INITIAL_COLUMNS = [
  // Board 1 Columns
  { id: 'col-1-backlog', boardId: 'board-taskflow-mvp', title: 'Backlog', order: 0 },
  { id: 'col-1-todo', boardId: 'board-taskflow-mvp', title: 'To Do', order: 1 },
  { id: 'col-1-inprogress', boardId: 'board-taskflow-mvp', title: 'In Progress', order: 2 },
  { id: 'col-1-review', boardId: 'board-taskflow-mvp', title: 'Review', order: 3 },
  { id: 'col-1-done', boardId: 'board-taskflow-mvp', title: 'Done', order: 4 },

  // Board 2 Columns
  { id: 'col-2-todo', boardId: 'board-mobile-companion', title: 'To Do', order: 0 },
  { id: 'col-2-inprogress', boardId: 'board-mobile-companion', title: 'In Progress', order: 1 },
  { id: 'col-2-done', boardId: 'board-mobile-companion', title: 'Done', order: 2 },

  // Board 3 Columns
  { id: 'col-3-ideas', boardId: 'board-q4-marketing', title: 'Ideas', order: 0 },
  { id: 'col-3-doing', boardId: 'board-q4-marketing', title: 'Doing', order: 1 },
  { id: 'col-3-completed', boardId: 'board-q4-marketing', title: 'Done', order: 2 },
];

export const INITIAL_TASKS = [
  // Board 1 - Done
  {
    id: 'task-101',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-done',
    title: 'Initialize Vite React project & dependencies',
    description: 'Set up Vite with React, Lucide icons, drag and drop support, and responsive CSS variables system.',
    priority: 'High',
    dueDate: '2026-11-20',
    labels: ['Frontend', 'Setup'],
    createdAt: '2026-11-18T10:00:00.000Z',
  },
  {
    id: 'task-102',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-done',
    title: 'Configure Flask backend with CORS & health check',
    description: 'Build backend application factory, register API blueprint, and expose GET /api/health.',
    priority: 'Medium',
    dueDate: '2026-11-21',
    labels: ['Backend', 'API'],
    createdAt: '2026-11-18T11:30:00.000Z',
  },
  {
    id: 'task-103',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-done',
    title: 'Implement LocalStorage persistence engine',
    description: 'Create hooks and state sync handlers for saving boards, columns, and tasks reliably across reloads.',
    priority: 'High',
    dueDate: '2026-11-22',
    labels: ['Storage', 'Core'],
    createdAt: '2026-11-19T09:15:00.000Z',
  },

  // Board 1 - Review
  {
    id: 'task-104',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-review',
    title: 'Sidebar navigation & responsive drawer layout',
    description: 'Ensure sidebar collapses gracefully into mobile drawer on tablet and phone viewports with backdrop blur.',
    priority: 'Medium',
    dueDate: '2026-11-23',
    labels: ['Frontend', 'UI/UX'],
    createdAt: '2026-11-19T14:00:00.000Z',
  },
  {
    id: 'task-105',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-review',
    title: 'Rule-based fallback summary verification',
    description: 'Audit fallback calculations for overdue dates, high priority items, and project bottlenecks when Gemini key is omitted.',
    priority: 'High',
    dueDate: '2026-11-23',
    labels: ['Backend', 'Testing'],
    createdAt: '2026-11-20T11:45:00.000Z',
  },

  // Board 1 - In Progress
  {
    id: 'task-106',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-inprogress',
    title: 'Kanban smooth drag-and-drop card reordering',
    description: 'Deliver tactile drag-and-drop between columns and reordering within columns using @hello-pangea/dnd.',
    priority: 'High',
    dueDate: '2026-11-24',
    labels: ['Frontend', 'Kanban'],
    createdAt: '2026-11-21T08:30:00.000Z',
  },
  {
    id: 'task-107',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-inprogress',
    title: 'Gemini AI Board Summary modal and metrics',
    description: 'Wire up POST /api/ai/board-summary with loading spinner, executive summary cards, and copy-to-clipboard action.',
    priority: 'High',
    dueDate: '2026-11-25',
    labels: ['AI', 'Feature'],
    createdAt: '2026-11-21T13:20:00.000Z',
  },

  // Board 1 - To Do
  {
    id: 'task-108',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-todo',
    title: 'Real-time task search and multi-criteria filtering',
    description: 'Provide instant search by title/description and multi-select filtering by priority and labels with clear states.',
    priority: 'Medium',
    dueDate: '2026-11-26',
    labels: ['Frontend', 'Search'],
    createdAt: '2026-11-22T09:00:00.000Z',
  },
  {
    id: 'task-109',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-todo',
    title: 'Column management: create, rename, delete & reorder',
    description: 'Empower users to customize their workflow with dynamic columns and task redistribution on column delete.',
    priority: 'Medium',
    dueDate: '2026-11-26',
    labels: ['Kanban'],
    createdAt: '2026-11-22T10:15:00.000Z',
  },

  // Board 1 - Backlog
  {
    id: 'task-110',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-backlog',
    title: 'Export board data to JSON and CSV formats',
    description: 'Allow team members to download snapshots of their boards and import them across environments.',
    priority: 'Low',
    dueDate: '2026-11-30',
    labels: ['Export', 'Data'],
    createdAt: '2026-11-22T15:00:00.000Z',
  },
  {
    id: 'task-111',
    boardId: 'board-taskflow-mvp',
    columnId: 'col-1-backlog',
    title: 'Overdue legacy migration task',
    description: 'Example task demonstrating overdue alerts and bottleneck detection in the AI summary engine.',
    priority: 'High',
    dueDate: '2026-11-15', // Intentionally overdue for realistic metrics
    labels: ['Legacy', 'Maintenance'],
    createdAt: '2026-11-10T10:00:00.000Z',
  },

  // Board 2 - Tasks
  {
    id: 'task-201',
    boardId: 'board-mobile-companion',
    columnId: 'col-2-done',
    title: 'Figma mobile screen designs',
    description: 'Responsive mobile layouts for board cards and modal editing.',
    priority: 'Medium',
    dueDate: '2026-11-19',
    labels: ['Design'],
    createdAt: '2026-11-15T10:00:00.000Z',
  },
  {
    id: 'task-202',
    boardId: 'board-mobile-companion',
    columnId: 'col-2-inprogress',
    title: 'Touch-optimized gestures for cards',
    description: 'Implement swipe actions for moving cards to next column.',
    priority: 'High',
    dueDate: '2026-11-27',
    labels: ['Mobile'],
    createdAt: '2026-11-20T12:00:00.000Z',
  },

  // Board 3 - Tasks
  {
    id: 'task-301',
    boardId: 'board-q4-marketing',
    columnId: 'col-3-completed',
    title: 'Product launch blog post draft',
    description: 'Announce TaskFlow internship assessment and architecture overview.',
    priority: 'Medium',
    dueDate: '2026-11-21',
    labels: ['Content'],
    createdAt: '2026-11-16T11:00:00.000Z',
  },
  {
    id: 'task-302',
    boardId: 'board-q4-marketing',
    columnId: 'col-3-doing',
    title: 'Record 2-minute product walkthrough video',
    description: 'Demonstrate drag and drop, filtering, and AI board summary with voiceover.',
    priority: 'High',
    dueDate: '2026-11-25',
    labels: ['Video'],
    createdAt: '2026-11-22T08:00:00.000Z',
  }
];

export const AVAILABLE_TAGS = [
  { name: 'Frontend', bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' },
  { name: 'Backend', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  { name: 'AI', bg: '#FAF5FF', color: '#9333EA', border: '#E9D5FF' },
  { name: 'UI/UX', bg: '#FDF2F8', color: '#DB2777', border: '#FBCFE8' },
  { name: 'Kanban', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
  { name: 'Testing', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  { name: 'Setup', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  { name: 'Core', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
  { name: 'Data', bg: '#F3E8FF', color: '#7E22CE', border: '#DDD6FE' },
  { name: 'Legacy', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
];

export const PRIORITY_CONFIG = {
  High: {
    label: 'High',
    bg: '#FEF2F2',
    color: '#DC2626',
    border: '#FECACA',
    dot: '#EF4444'
  },
  Medium: {
    label: 'Medium',
    bg: '#FFFBEB',
    color: '#D97706',
    border: '#FDE68A',
    dot: '#F59E0B'
  },
  Low: {
    label: 'Low',
    bg: '#F0FDF4',
    color: '#16A34A',
    border: '#BBF7D0',
    dot: '#10B981'
  }
};


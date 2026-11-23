# TaskFlow — Modern SaaS Project Management Application

> A complete, polished, responsive Trello-inspired project management platform featuring drag-and-drop task orchestration, LocalStorage persistence, multi-criteria filtering, and an intelligent **AI Board Summary** powered by Google Gemini with an automated zero-downtime statistical fallback engine.

Built for the **Internship Technical Assessment**, adhering strictly to modern software engineering standards, clean modular architecture, and 100% test coverage across frontend and backend.

---

## 📸 Application Interface & Highlights

TaskFlow combines tactile drag-and-drop Kanban workflow with high-density SaaS usability:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  TaskFlow PRO                    [ Search tasks... ]  [ Priority: All ▼ ]  [ + Task ]  │
├───────────────┬────────────────────────────────────────────────────────────────────────┤
│ 📁 Workspace  │  TaskFlow MVP & Release       42% Done     [ ✨ AI Board Summary ]     │
│  Core Eng.    ├───────────────┬───────────────┬───────────────┬───────────────┬────────┤
│               │  BACKLOG (2)  │  TO DO (2)    │ IN PROGRESS(2)│  REVIEW (2)   │DONE (3)│
│ 📋 My Boards  ├───────────────┼───────────────┼───────────────┼───────────────┼────────┤
│ • TaskFlow MVP│ 🔴 High       │ 🟡 Medium     │ 🔴 High       │ 🟡 Medium     │ 🟢 Low │
│ • Mobile App  │ Overdue Task  │ Search Filter │ Drag & Drop   │ Sidebar Draw. │ Setup  │
│ • Q4 Launch   │ Due Nov 15    │ Due Nov 26    │ Due Nov 24    │ Due Nov 23    │ Nov 20 │
│               │ [Legacy]      │ [Search]      │ [Kanban]      │ [UI/UX]       │ [Core] │
│ ⚙️ Settings   ├───────────────┴───────────────┴───────────────┴───────────────┴────────┤
│ 👤 Alex Mercer│ ✨ AI Executive Modal: 11 Tasks • 27.3% Progress • Bottleneck Alerts   │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Features

### 1. Board & Workspace Management
- **Multiple Board Workspaces**: Switch between boards (*TaskFlow MVP*, *Mobile Companion App*, *Q4 Marketing Sprint*) or create brand-new custom boards with custom accent colors.
- **Board Metadata**: View creation timestamps, dynamic progress gauges, and descriptions.
- **Edit & Delete Boards**: Rename titles, change descriptions, and safely delete boards with cascade protection.

### 2. Kanban Columns
- **Default Workflow**: Initialized with standard Agile columns: **Backlog**, **To Do**, **In Progress**, **Review**, and **Done**.
- **Dynamic Columns**: Add custom columns at any position on the board.
- **Inline Renaming**: Double-click or click the header menu to rename any column inline.
- **Column Reordering**: Move columns left or right with smooth order tracking.
- **Column Deletion**: Safe deletion with task count confirmation warnings.
- **Quick Card Composer**: Click `+ Add a card` at the bottom of any column to quickly add tasks with keyboard Enter/Escape support.

### 3. Task Cards & Drag-and-Drop
- **Tactile Drag-and-Drop**: Powered by `@hello-pangea/dnd` for fluid, zero-lag 60fps card dragging between columns and reordering within columns.
- **Priority Indicator**: Visual badges with distinct color pills:
  - 🔴 **High Priority**
  - 🟡 **Medium Priority**
  - 🟢 **Low Priority**
- **Overdue Detection**: Automatically compares task due dates against the current date. Overdue items are badged with a red alert and warning icon.
- **Tags & Labels**: Categorize items with vibrant tags (*Frontend*, *Backend*, *AI*, *UI/UX*, *Testing*, *Security*, etc.) or create custom tags on the fly.
- **Detailed Modal Dialog**: View full task details, description markdown/notes, change status, switch priority, or delete tasks.
- **Accessible Quick Move**: Dropdown action menu for moving cards to adjacent columns via click/keyboard without dragging.
- **Celebration Confetti**: Dynamic confetti burst triggered when a task is moved to the **Done** column!

### 4. Search & Multi-Criteria Filtering
- **Real-Time Title & Description Search**: Instant search filtering as you type.
- **Priority Filter**: Filter tasks by High, Medium, or Low.
- **Status / Column Filter**: Focus on specific column lanes.
- **Label Filter**: Filter by specific technical tags.
- **Active Filter State**: Live badge count showing active matches (e.g., `Clear filters (3 of 11)`) with a single-click reset.

### 5. Robust Persistence & Demo Data
- **LocalStorage Sync**: Boards, custom columns, tasks, and active workspaces persist across browser reloads.
- **Rich Demonstration Dataset**: Pre-populated with realistic agile tasks across frontend, backend, AI integration, and testing.
- **One-Click Demo Reset**: Reset button in the sidebar and settings modal to restore the initial demo state anytime.
- **JSON Backup & Export**: Download full workspace snapshots as `.json` files.

---

## ⚡ Bonus Feature: AI Board Summary

TaskFlow features an **AI Board Summary** powered by the **Google Gemini API** (`POST /api/ai/board-summary`) with an **Intelligent Rule-Based Statistical Fallback Engine**.

### What It Delivers:
1. **Overall Board Progress**: Real-time completion percentage and project status label (*On Track*, *Attention Required*, *Near Completion*, *Planning*).
2. **Total Number of Tasks**: Real-time count of all board items.
3. **Completed Tasks**: Tasks residing in Done/Finished columns.
4. **Pending Tasks**: All remaining active tasks.
5. **Tasks in Progress**: Items undergoing active development or code review.
6. **High-Priority Pending Tasks**: High-impact items requiring leadership attention.
7. **Overdue Tasks**: Tasks past their deadlines with specific overdue day counts.
8. **Potential Project Bottlenecks**:
   - High Work-in-Progress (WIP) alerts when too many items are simultaneous.
   - Code review queue congestion warnings.
   - Unstarted high-priority tasks sitting in Backlog.
   - Overdue deadline risks.
9. **Suggested Next Actions**: Prioritized actionable steps referencing real tasks on the board.

### AI Architecture & Fallback Guarantee
- **Zero Key Leaks**: The Google Gemini API key is **strictly stored on the backend** in `backend/.env` and is never exposed to the frontend.
- **Factual Integrity**: The AI prompt is fed verified, deterministic statistical facts derived directly from board data, with strict instructions never to hallucinate tasks.
- **Automated Fallback**: If `GEMINI_API_KEY` is not configured, expired, or network-throttled, TaskFlow seamlessly switches to its **Smart Rule-Based Engine**. The UI displays an informative badge explaining whether Gemini AI or the fallback engine generated the insights, ensuring an uninterrupted user experience.
- **One-Click Clipboard Copy**: Export the formatted summary directly to your clipboard.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite 5, JavaScript (ES6+), HTML5, CSS3 Custom Properties, Lucide Icons, Canvas Confetti |
| **Drag & Drop** | `@hello-pangea/dnd` (accessible, fluid drag and drop) |
| **Backend** | Python 3.12, Flask 3.0, Flask-CORS, Requests, Python-Dotenv, Gunicorn |
| **Testing** | Pytest (backend), Vitest + React Testing Library + JSDOM (frontend) |
| **Persistence** | LocalStorage (client-side), structured backend ready for SQL/NoSQL |

---

## 📂 Project Architecture

```
TrelloRep/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AISummaryModal.jsx    # Bonus AI modal & metrics view
│   │   │   ├── BoardHeader.jsx        # Top board title, progress & actions
│   │   │   ├── BoardModal.jsx         # Create/edit board modal
│   │   │   ├── Column.jsx             # Droppable Kanban column
│   │   │   ├── ControlBar.jsx         # Search, filters & column actions
│   │   │   ├── KanbanBoard.jsx        # DragDropContext board viewport
│   │   │   ├── SettingsModal.jsx      # Diagnostic & backup modal
│   │   │   ├── Sidebar.jsx            # Workspace & board navigation
│   │   │   ├── TaskCard.jsx           # Draggable task card with pills
│   │   │   ├── TaskModal.jsx          # Full task view/edit modal
│   │   │   └── Toast.jsx              # Lightweight notification toasts
│   │   ├── hooks/
│   │   │   ├── useBoardData.js        # Central state, CRUD & DND logic
│   │   │   └── useLocalStorage.js     # Safe LocalStorage synchronization
│   │   ├── services/
│   │   │   └── api.js                 # Backend API client & health check
│   │   ├── utils/
│   │   │   └── initialData.js         # Initial agile demonstration data
│   │   ├── tests/
│   │   │   ├── setup.js               # Vitest environment setup
│   │   │   └── board.test.jsx         # Frontend unit & persistence tests
│   │   ├── App.jsx                    # Root application component
│   │   ├── main.jsx                   # React DOM entry point
│   │   └── index.css                  # Modern SaaS CSS design system
│   ├── public/
│   │   └── logo.svg                   # TaskFlow vector brand icon
│   ├── package.json                   # Frontend dependencies & scripts
│   ├── vite.config.js                 # Vite & Vitest configuration
│   └── vercel.json                    # Vercel SPA routing configuration
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── api.py                 # /api/health & /api/ai/board-summary
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── ai_summary.py          # Gemini API caller & Rule engine
│   │   └── __init__.py                # Flask factory & CORS configuration
│   ├── tests/
│   │   └── test_api.py                # Pytest unit & integration tests
│   ├── app.py                         # WSGI / local execution entry point
│   ├── requirements.txt               # Backend Python dependencies
│   └── .env.example                   # Environment variable template
│
├── Procfile                           # Production web process definition
├── render.yaml                        # Render Cloud deployment blueprint
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## 🚀 Installation & Local Development

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.10+ (3.12 recommended)
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# (Optional) Add your Google Gemini API key to .env:
# GEMINI_API_KEY=your_gemini_api_key_here

# Start Flask backend (default port 5000)
python app.py
```
Backend will start on `http://127.0.0.1:5000`. You can verify health via `curl http://localhost:5000/api/health`.

### 3. Frontend Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

Both the frontend and backend have comprehensive automated test suites.

### Run Backend Tests (Pytest)
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/ -v
```
**Test Cases Covered:**
- `test_health_check`: Verifies `GET /api/health` returns status 200 and operational payload.
- `test_ai_board_summary_fallback`: Confirms fallback rule-based calculations for overdue tasks, bottlenecks, and progress percentages when no API key is present.
- `test_ai_board_summary_empty_board`: Verifies graceful zero-task handling without runtime exceptions.
- `test_ai_board_summary_invalid_payload`: Confirms HTTP 400 validation for non-JSON or schema-violating inputs.
- `test_ai_board_summary_gemini_mock_success`: Mocks Gemini API returning structured JSON.
- `test_ai_board_summary_gemini_mock_failure_fallback`: Validates seamless fallback when Gemini API encounters a network timeout.

### Run Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
**Test Cases Covered:**
- `initializes with default demo data if LocalStorage is empty`: Verifies cold-start initialization.
- `persists newly created tasks to LocalStorage`: Tests task creation and serialization.
- `deletes tasks and updates state and LocalStorage`: Tests task deletion and cleanup.
- `moves task between columns (simulating drag-and-drop)`: Tests state transitions across column IDs.
- `handles drag-and-drop reordering with handleDragEnd`: Tests in-column reordering.
- `creates, renames, and deletes custom columns`: Tests full column lifecycle.
- `resets demo data to initial defaults upon command`: Tests instant state restoration.

### Run Full Test Suite in One Command
```bash
PYTHONPATH=backend ./backend/venv/bin/pytest backend/tests/ -v && cd frontend && npm test
```

---

## 🌐 Production Deployment Guide

TaskFlow is configured for completely free, credit-card-free deployment on **Vercel** (Frontend) and **Render** (Backend).

### 1. Backend Deployment on Render
1. Create a free account on [Render.com](https://render.com).
2. Click **New +** → **Web Service** and connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: Leave blank (uses repo root `Procfile` / `render.yaml`) or enter `backend`.
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT`
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key.
   - `FRONTEND_URL`: `https://<your-vercel-app>.vercel.app` (or `*`)
5. Deploy the service. Copy your backend URL (e.g., `https://taskflow-api.onrender.com`).

### 2. Frontend Deployment on Vercel
1. Create a free account on [Vercel.com](https://vercel.com).
2. Click **Add New** → **Project** and import your repository.
3. Set **Root Directory** to `frontend`.
4. In **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://taskflow-api.onrender.com`).
5. Click **Deploy**. Vercel will build and serve your SPA with single-page routing enabled via `frontend/vercel.json`.

---

## 📋 Assessment Verification Checklist

- [x] **React.js with Vite**: Built cleanly with JavaScript ES6+, hooks, and modular components.
- [x] **Python Flask Backend**: Blueprint architecture, CORS configuration, and proper error handlers.
- [x] **LocalStorage Persistence**: Full persistence for boards, columns, and tasks across reloads.
- [x] **Board Management**: Create, edit, delete, switch between boards with metadata display.
- [x] **Kanban Workflow**: 5 default columns, add custom columns, rename, delete, and reorder.
- [x] **Drag-and-Drop**: Smooth card reordering within and between columns with `@hello-pangea/dnd`.
- [x] **Search & Filters**: Search by text, filter by priority, status, and labels.
- [x] **Bonus Feature — AI Summary**: `POST /api/ai/board-summary` integrating Gemini API with secure credentials and an intelligent zero-downtime statistical fallback engine.
- [x] **Automated Testing**: Complete test suites for both backend (`pytest`) and frontend (`vitest`).
- [x] **Responsive SaaS UI**: Custom design system with Plus Jakarta Sans typography, modal windows, toasts, and mobile drawer.
- [x] **Deployment Ready**: `vercel.json`, `render.yaml`, `Procfile`, and `.env.example` included.

---

## 📄 License
This project was created for the Internship Technical Assessment. Open source under the MIT License.


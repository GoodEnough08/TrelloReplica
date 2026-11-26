import pytest
import json
from unittest.mock import patch, MagicMock
from app import create_app

@pytest.fixture
def client():
    app = create_app({"TESTING": True})
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_board_data():
    return {
        "board": {
            "id": "board-1",
            "title": "TaskFlow Internship Assessment",
            "description": "Production readiness sprint for TaskFlow web application"
        },
        "columns": [
            {"id": "col-backlog", "title": "Backlog"},
            {"id": "col-todo", "title": "To Do"},
            {"id": "col-inprogress", "title": "In Progress"},
            {"id": "col-review", "title": "Review"},
            {"id": "col-done", "title": "Done"}
        ],
        "tasks": [
            {
                "id": "task-1",
                "title": "Setup Vite React frontend",
                "priority": "High",
                "columnId": "col-done",
                "status": "Done",
                "dueDate": "2026-11-20",
                "labels": ["Frontend", "Setup"]
            },
            {
                "id": "task-2",
                "title": "Build Kanban drag and drop",
                "priority": "High",
                "columnId": "col-inprogress",
                "status": "In Progress",
                "dueDate": "2026-11-23",
                "labels": ["Frontend", "UX"]
            },
            {
                "id": "task-3",
                "title": "Implement Gemini API board summary",
                "priority": "High",
                "columnId": "col-inprogress",
                "status": "In Progress",
                "dueDate": "2026-11-25",
                "labels": ["Backend", "AI"]
            },
            {
                "id": "task-4",
                "title": "Write unit and integration tests",
                "priority": "Medium",
                "columnId": "col-todo",
                "status": "To Do",
                "dueDate": "2026-11-26",
                "labels": ["Testing"]
            },
            {
                "id": "task-5",
                "title": "Legacy documentation cleanup",
                "priority": "Low",
                "columnId": "col-backlog",
                "status": "Backlog",
                "dueDate": "2026-11-10",
                "labels": ["Docs"]
            }
        ]
    }

def test_health_check(client):
    """Test GET /api/health returns 200 and healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "TaskFlow Backend API" in data["service"]
    assert "timestamp" in data

def test_ai_board_summary_fallback(client, sample_board_data):
    """Test POST /api/ai/board-summary produces rule-based summary when GEMINI_API_KEY is not set."""
    with patch.dict("os.environ", {}, clear=True):
        response = client.post(
            "/api/ai/board-summary",
            data=json.dumps(sample_board_data),
            content_type="application/json"
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["total_tasks"] == 5
        assert data["completed_tasks"] == 1
        assert data["pending_tasks"] == 4
        assert data["progress_percentage"] == 20.0
        assert data["provider"] == "fallback_rule_based"
        assert "fallback_reason" in data
        assert len(data["suggested_next_actions"]) > 0
        assert len(data["bottlenecks"]) > 0
        assert "overdue_tasks" in data
        # task-5 is due in the past, so overdue_count should be at least 1
        assert data["overdue_count"] >= 1

def test_ai_board_summary_empty_board(client):
    """Test POST /api/ai/board-summary handles empty board gracefully without crashing."""
    empty_board = {
        "board": {"id": "b-empty", "title": "Empty Board", "description": ""},
        "columns": [
            {"id": "col-1", "title": "To Do"},
            {"id": "col-2", "title": "Done"}
        ],
        "tasks": []
    }
    response = client.post(
        "/api/ai/board-summary",
        data=json.dumps(empty_board),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["total_tasks"] == 0
    assert data["completed_tasks"] == 0
    assert data["progress_percentage"] == 0.0
    assert data["provider"] == "fallback_rule_based"
    assert "Empty Board" in data["executive_summary"]

def test_ai_board_summary_invalid_payload(client):
    """Test error handling for non-JSON or malformed requests."""
    # Not JSON content type
    resp1 = client.post("/api/ai/board-summary", data="not json")
    assert resp1.status_code == 400

    # Malformed JSON schema: columns is not a list
    resp2 = client.post(
        "/api/ai/board-summary",
        data=json.dumps({"columns": "not-a-list", "tasks": []}),
        content_type="application/json"
    )
    assert resp2.status_code == 400

def test_ai_board_summary_gemini_mock_success(client, sample_board_data):
    """Test POST /api/ai/board-summary with valid Gemini API response."""
    mock_gemini_response = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": json.dumps({
                                "status_label": "High Velocity Sprint",
                                "executive_summary": "TaskFlow development is progressing with strong momentum across frontend and backend modules.",
                                "bottlenecks": ["Overdue backlog items require attention"],
                                "suggested_next_actions": ["Finish active in-progress tasks", "Review open pull requests"]
                            })
                        }
                    ]
                }
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_gemini_response

    with patch.dict("os.environ", {"GEMINI_API_KEY": "valid_test_key"}):
        with patch("requests.post", return_value=mock_resp):
            response = client.post(
                "/api/ai/board-summary",
                data=json.dumps(sample_board_data),
                content_type="application/json"
            )
            assert response.status_code == 200
            data = response.get_json()
            assert data["provider"] == "gemini"
            assert data["status_label"] == "High Velocity Sprint"
            assert data["total_tasks"] == 5
            assert "TaskFlow development" in data["executive_summary"]

def test_ai_board_summary_gemini_mock_failure_fallback(client, sample_board_data):
    """Test that when Gemini API throws an error, the system gracefully falls back to rule-based summary."""
    with patch.dict("os.environ", {"GEMINI_API_KEY": "valid_test_key"}):
        with patch("requests.post", side_effect=Exception("Connection timed out")):
            response = client.post(
                "/api/ai/board-summary",
                data=json.dumps(sample_board_data),
                content_type="application/json"
            )
            assert response.status_code == 200
            data = response.get_json()
            assert data["provider"] == "fallback_rule_based"
            assert "Gemini API connection error" in data["fallback_reason"]
            assert data["total_tasks"] == 5

def test_method_not_allowed_returns_json(client):
    """Test 405 Method Not Allowed returns structured JSON error."""
    resp = client.get("/api/ai/board-summary")
    assert resp.status_code == 405
    data = resp.get_json()
    assert data["error"] == "Method Not Allowed"

def test_bottleneck_detection_for_review_and_wip(client):
    """Test rule-based engine flags Review queue and high WIP bottlenecks."""
    board_payload = {
        "board": {"id": "b-wip", "title": "High WIP Sprint"},
        "columns": [
            {"id": "c-prog", "title": "In Progress"},
            {"id": "c-rev", "title": "Staging Review"},
            {"id": "c-done", "title": "Done"}
        ],
        "tasks": [
            {"id": "t1", "title": "Task 1", "columnId": "c-prog", "priority": "Medium"},
            {"id": "t2", "title": "Task 2", "columnId": "c-prog", "priority": "Medium"},
            {"id": "t3", "title": "Task 3", "columnId": "c-prog", "priority": "Medium"},
            {"id": "t4", "title": "Task 4", "columnId": "c-rev", "priority": "High"},
            {"id": "t5", "title": "Task 5", "columnId": "c-rev", "priority": "Medium"},
            {"id": "t6", "title": "Task 6", "columnId": "c-rev", "priority": "Low"}
        ]
    }
    with patch.dict("os.environ", {}, clear=True):
        resp = client.post(
            "/api/ai/board-summary",
            data=json.dumps(board_payload),
            content_type="application/json"
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["in_progress_tasks"] == 6
        bottleneck_text = " ".join(data["bottlenecks"])
        assert "Review" in bottleneck_text
        assert "Work-In-Progress" in bottleneck_text



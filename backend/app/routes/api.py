from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from app.services.ai_summary import generate_board_summary

api_bp = Blueprint("api", __name__)

@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status."""
    return jsonify({
        "status": "healthy",
        "service": "TaskFlow Backend API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200

@api_bp.route("/ai/board-summary", methods=["POST"])
def get_board_summary():
    """
    Accepts structured board data and returns an AI or rule-based summary
    containing progress metrics, bottlenecks, and suggested next actions.
    """
    if not request.is_json:
        return jsonify({
            "error": "Bad Request",
            "message": "Content-Type must be application/json"
        }), 400

    data = request.get_json()
    if not data or not isinstance(data, dict):
        return jsonify({
            "error": "Bad Request",
            "message": "Request body must be a valid JSON object"
        }), 400

    # Ensure columns and tasks are lists if provided
    columns = data.get("columns", [])
    tasks = data.get("tasks", [])

    if not isinstance(columns, list) or not isinstance(tasks, list):
        return jsonify({
            "error": "Bad Request",
            "message": "'columns' and 'tasks' must be JSON arrays"
        }), 400

    try:
        summary_result = generate_board_summary(data)
        return jsonify(summary_result), 200
    except Exception as e:
        return jsonify({
            "error": "Internal Server Error",
            "message": f"Failed to generate board summary: {str(e)}"
        }), 500


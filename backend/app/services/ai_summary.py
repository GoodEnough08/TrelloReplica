import os
from datetime import datetime, date
import json
import requests

def _parse_due_date(due_date_str):
    if not due_date_str:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y/%m/%d"):
        try:
            return datetime.strptime(due_date_str.split("T")[0], "%Y-%m-%d").date()
        except Exception:
            continue
    return None

def calculate_board_metrics(board_data):
    """
    Computes deterministic statistical metrics from board, columns, and tasks.
    Guarantees no hallucination: all counts and lists are derived directly from the payload.
    """
    columns = board_data.get("columns", [])
    tasks = board_data.get("tasks", [])
    board_info = board_data.get("board", {})
    if not board_info and "title" in board_data:
        board_info = {
            "id": board_data.get("id"),
            "title": board_data.get("title", "Untitled Board"),
            "description": board_data.get("description", "")
        }

    # Column mappings
    column_map = {col.get("id"): col.get("title", "") for col in columns}
    
    # Classify columns
    done_column_ids = set()
    in_progress_column_ids = set()
    review_column_ids = set()
    backlog_column_ids = set()

    for col in columns:
        cid = col.get("id")
        title_lower = col.get("title", "").strip().lower()
        if any(w in title_lower for w in ["done", "completed", "closed", "finished"]):
            done_column_ids.add(cid)
        elif any(w in title_lower for w in ["review", "qa", "testing", "verification"]):
            review_column_ids.add(cid)
        elif any(w in title_lower for w in ["progress", "doing", "active", "in-progress", "development"]):
            in_progress_column_ids.add(cid)
        elif any(w in title_lower for w in ["backlog", "to do", "todo", "open", "planned", "ready"]):
            backlog_column_ids.add(cid)
        else:
            # Fallback based on column index
            backlog_column_ids.add(cid)

    # In progress combines active progress and review
    active_in_progress_ids = in_progress_column_ids.union(review_column_ids)

    today = date.today()

    total_tasks = len(tasks)
    completed_tasks = []
    in_progress_tasks = []
    pending_tasks = []
    overdue_tasks = []
    high_priority_pending = []
    tasks_by_column = {col.get("id"): [] for col in columns}

    for task in tasks:
        col_id = task.get("columnId") or task.get("status")
        col_title = column_map.get(col_id, "Unknown")
        task_item = {
            "id": task.get("id"),
            "title": task.get("title", "Untitled Task"),
            "priority": task.get("priority", "Medium"),
            "columnId": col_id,
            "columnTitle": col_title,
            "dueDate": task.get("dueDate"),
            "labels": task.get("labels", [])
        }

        if col_id in tasks_by_column:
            tasks_by_column[col_id].append(task_item)

        is_done = (col_id in done_column_ids) or (task.get("status", "").lower() in ["done", "completed"])
        
        if is_done:
            completed_tasks.append(task_item)
        else:
            pending_tasks.append(task_item)
            if col_id in active_in_progress_ids:
                in_progress_tasks.append(task_item)

            # Check high priority
            if str(task.get("priority", "")).lower() == "high":
                high_priority_pending.append(task_item)

            # Check overdue
            due = _parse_due_date(task.get("dueDate"))
            if due and due < today:
                task_item["days_overdue"] = (today - due).days
                overdue_tasks.append(task_item)

    # Overall progress
    progress_percentage = round((len(completed_tasks) / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # Bottlenecks analysis
    bottlenecks = []
    if len(overdue_tasks) > 0:
        bottlenecks.append({
            "type": "overdue_tasks",
            "severity": "high" if len(overdue_tasks) > 2 else "medium",
            "message": f"{len(overdue_tasks)} task(s) are past their due dates and still pending completion."
        })

    # Review bottleneck
    review_tasks_count = sum(len(tasks_by_column.get(cid, [])) for cid in review_column_ids)
    if review_tasks_count >= 3:
        bottlenecks.append({
            "type": "review_blocker",
            "severity": "medium",
            "message": f"Review column has {review_tasks_count} tasks waiting for verification. Potential deployment or QA bottleneck."
        })

    # WIP overload
    in_prog_count = len(in_progress_tasks)
    if in_prog_count > 5:
        bottlenecks.append({
            "type": "high_wip",
            "severity": "medium",
            "message": f"High Work-In-Progress: {in_prog_count} tasks are actively ongoing simultaneously, which may reduce velocity."
        })

    # Unstarted High Priority
    unstarted_high = [t for t in high_priority_pending if t.get("columnId") in backlog_column_ids]
    if len(unstarted_high) > 0:
        bottlenecks.append({
            "type": "unstarted_high_priority",
            "severity": "high",
            "message": f"{len(unstarted_high)} high-priority task(s) are still in Backlog / To Do and haven't been started yet."
        })

    if not bottlenecks and total_tasks > 0:
        bottlenecks.append({
            "type": "none",
            "severity": "low",
            "message": "Workflow distribution is healthy with no critical bottlenecks detected."
        })
    elif total_tasks == 0:
        bottlenecks.append({
            "type": "empty_board",
            "severity": "low",
            "message": "The board has no tasks yet. Add tasks to start tracking progress."
        })

    # Suggested Next Actions
    suggested_actions = []
    if overdue_tasks:
        first_overdue = overdue_tasks[0]["title"]
        suggested_actions.append(f"Immediately address overdue task: '{first_overdue}' (and {len(overdue_tasks) - 1} other(s)).")
    
    if unstarted_high:
        first_unstarted = unstarted_high[0]["title"]
        suggested_actions.append(f"Prioritize starting high-priority item: '{first_unstarted}'.")

    if review_tasks_count > 0:
        suggested_actions.append(f"Clear review queue by reviewing and merging the {review_tasks_count} task(s) currently in Review.")

    if in_prog_count > 0:
        suggested_actions.append(f"Focus on finishing in-flight tasks in In Progress before pulling new items from Backlog.")

    if total_tasks == 0:
        suggested_actions.append("Break down project milestones into initial tasks across Backlog and To Do columns.")
    elif progress_percentage >= 80 and len(pending_tasks) > 0:
        suggested_actions.append("Sprint is near completion! Push remaining pending tasks to Done to achieve 100%.")
    elif len(suggested_actions) < 3:
        suggested_actions.append("Regularly update task statuses and maintain accurate due dates for optimal tracking.")

    return {
        "board_info": board_info,
        "total_tasks": total_tasks,
        "completed_count": len(completed_tasks),
        "pending_count": len(pending_tasks),
        "in_progress_count": len(in_progress_tasks),
        "high_priority_count": len(high_priority_pending),
        "overdue_count": len(overdue_tasks),
        "progress_percentage": progress_percentage,
        "high_priority_tasks": high_priority_pending[:5],
        "overdue_tasks": overdue_tasks[:5],
        "bottlenecks": bottlenecks,
        "suggested_actions": suggested_actions,
        "columns_summary": [{"title": col.get("title"), "count": len(tasks_by_column.get(col.get("id"), []))} for col in columns]
    }

def generate_rule_based_summary(metrics, board_data):
    """
    Generates a structured, highly articulate executive summary using actual metrics.
    Completely deterministic, zero hallucinations, fast, and reliable.
    """
    board_title = metrics["board_info"].get("title", "Project Board")
    total = metrics["total_tasks"]
    completed = metrics["completed_count"]
    in_progress = metrics["in_progress_count"]
    pending = metrics["pending_count"]
    progress = metrics["progress_percentage"]
    overdue = metrics["overdue_count"]
    high_prio = metrics["high_priority_count"]

    if total == 0:
        status_label = "Initialized"
        executive_summary = (
            f"**{board_title}** is currently set up and awaiting initial task entries. "
            "To jumpstart the workflow, define core milestones in the Backlog and populate initial action items with clear priorities and due dates."
        )
    elif progress == 100:
        status_label = "Complete"
        executive_summary = (
            f"Outstanding progress! All **{total} task(s)** on **{board_title}** have been completed. "
            "The board is in a finalized state. Review outcomes or archive completed tasks before commencing the next project phase."
        )
    elif overdue > 0:
        status_label = "Attention Required"
        executive_summary = (
            f"**{board_title}** has achieved **{progress}% completion** ({completed}/{total} tasks resolved). "
            f"However, immediate attention is required as **{overdue} task(s)** are overdue and **{high_prio} high-priority task(s)** are still pending. "
            f"Currently, {in_progress} task(s) are actively in progress."
        )
    elif in_progress > 0:
        status_label = "In Active Development"
        executive_summary = (
            f"**{board_title}** is progressing steadily at **{progress}% completion** with {completed} out of {total} tasks completed. "
            f"There are {in_progress} item(s) actively underway and {pending} total pending tasks. "
            f"Workflow health is stable with no immediate blockers."
        )
    else:
        status_label = "Planning & Queued"
        executive_summary = (
            f"**{board_title}** has {total} task(s) queued across columns with {progress}% completed so far. "
            "Team capacity should be focused on moving prioritized items from Backlog into active development."
        )

    return {
        "status_label": status_label,
        "executive_summary": executive_summary,
        "progress_percentage": progress,
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "in_progress_tasks": in_progress,
        "high_priority_pending_tasks": [t["title"] for t in metrics["high_priority_tasks"]],
        "high_priority_count": high_prio,
        "overdue_tasks": [f"{t['title']} (Due: {t.get('dueDate', 'N/A')})" for t in metrics["overdue_tasks"]],
        "overdue_count": overdue,
        "bottlenecks": [b["message"] for b in metrics["bottlenecks"]],
        "suggested_next_actions": metrics["suggested_actions"],
        "columns_summary": metrics["columns_summary"],
        "provider": "fallback_rule_based",
        "fallback_reason": "Generated using TaskFlow's intelligent statistical engine. (To activate Gemini LLM analysis, set GEMINI_API_KEY in backend/.env)"
    }

def generate_gemini_summary(metrics, board_data, api_key):
    """
    Calls Google Gemini API using requests library to provide an insightful AI narrative
    strictly grounded in the board's factual metrics.
    """
    board_title = metrics["board_info"].get("title", "Project Board")
    board_desc = metrics["board_info"].get("description", "")

    prompt = f"""You are TaskFlow AI, an expert project management advisor.
Analyze the following real-time board data for project: "{board_title}".
Description: "{board_desc}"

Board Statistics (FACTUAL & VERIFIED):
- Total Tasks: {metrics["total_tasks"]}
- Completed Tasks: {metrics["completed_count"]} ({metrics["progress_percentage"]}%)
- In-Progress Tasks: {metrics["in_progress_count"]}
- Pending Tasks: {metrics["pending_count"]}
- High Priority Pending: {metrics["high_priority_count"]} ({[t['title'] for t in metrics["high_priority_tasks"]]})
- Overdue Tasks: {metrics["overdue_count"]} ({[t['title'] for t in metrics["overdue_tasks"]]})
- Columns breakdown: {json.dumps(metrics["columns_summary"])}

RULES:
1. Ground your response STRICTLY on the actual numbers and tasks above. Never hallucinate tasks or names not listed.
2. Return ONLY a valid JSON object matching the requested schema with no surrounding markdown or code blocks.

SCHEMA:
{{
  "status_label": "Short status (e.g. On Track / Attention Required / Near Completion / Planning)",
  "executive_summary": "2-3 concise paragraphs evaluating project health, momentum, and risk factors.",
  "bottlenecks": ["Specific bottleneck 1 grounded in data", "Specific bottleneck 2 grounded in data"],
  "suggested_next_actions": ["Actionable step 1 for team", "Actionable step 2 for team", "Actionable step 3 for team"]
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }

    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=12)
        if response.status_code == 200:
            res_data = response.json()
            candidates = res_data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    raw_text = parts[0].get("text", "").strip()
                    # Parse JSON from response
                    if raw_text.startswith("```"):
                        raw_text = raw_text.split("```")[1]
                        if raw_text.startswith("json"):
                            raw_text = raw_text[4:]
                        raw_text = raw_text.strip()
                    parsed = json.loads(raw_text)

                    return {
                        "status_label": parsed.get("status_label", "Active"),
                        "executive_summary": parsed.get("executive_summary", ""),
                        "progress_percentage": metrics["progress_percentage"],
                        "total_tasks": metrics["total_tasks"],
                        "completed_tasks": metrics["completed_count"],
                        "pending_tasks": metrics["pending_count"],
                        "in_progress_tasks": metrics["in_progress_count"],
                        "high_priority_pending_tasks": [t["title"] for t in metrics["high_priority_tasks"]],
                        "high_priority_count": metrics["high_priority_count"],
                        "overdue_tasks": [f"{t['title']} (Due: {t.get('dueDate', 'N/A')})" for t in metrics["overdue_tasks"]],
                        "overdue_count": metrics["overdue_count"],
                        "bottlenecks": parsed.get("bottlenecks") or [b["message"] for b in metrics["bottlenecks"]],
                        "suggested_next_actions": parsed.get("suggested_next_actions") or metrics["suggested_actions"],
                        "columns_summary": metrics["columns_summary"],
                        "provider": "gemini",
                        "fallback_reason": None
                    }
        # If API returned non-200 or unexpected payload, fall back safely
        fallback = generate_rule_based_summary(metrics, board_data)
        fallback["fallback_reason"] = f"Gemini API returned status code {response.status_code}. Seamlessly switched to intelligent rule engine."
        return fallback
    except Exception as exc:
        fallback = generate_rule_based_summary(metrics, board_data)
        fallback["fallback_reason"] = f"Gemini API connection error ({str(exc)}). Seamlessly switched to intelligent rule engine."
        return fallback

def generate_board_summary(board_data):
    """
    Main entry point for generating board summary.
    Checks environment for GEMINI_API_KEY.
    """
    metrics = calculate_board_metrics(board_data)
    api_key = os.getenv("GEMINI_API_KEY")

    if api_key and api_key.strip() and api_key.strip() != "your_gemini_api_key_here":
        return generate_gemini_summary(metrics, board_data, api_key.strip())
    else:
        return generate_rule_based_summary(metrics, board_data)


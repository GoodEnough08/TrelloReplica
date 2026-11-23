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


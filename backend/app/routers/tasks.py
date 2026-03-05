from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.task import Task, TaskCreate, TaskUpdate, TaskGanttView
from ..services.storage import get_storage, StorageService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("", response_model=Task)
async def create_task(
    task_data: TaskCreate,
    storage: StorageService = Depends(get_storage),
):
    """Create a new task."""
    # Validate dates
    if task_data.end_date < task_data.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )

    # Validate parent exists if specified
    if task_data.parent_id:
        parent = storage.get_task(task_data.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent task not found")

    # Validate dependencies exist
    for dep_id in task_data.dependencies:
        if not storage.get_task(dep_id):
            raise HTTPException(
                status_code=404,
                detail=f"Dependency task {dep_id} not found"
            )

    task = Task(**task_data.model_dump())
    return storage.save_task(task)


@router.get("", response_model=list[Task])
async def list_tasks(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    assigned_to: Optional[str] = Query(None),
    analysis_id: Optional[str] = Query(None),
    issue_id: Optional[str] = Query(None),
    storage: StorageService = Depends(get_storage),
):
    """List tasks with optional filters."""
    return storage.list_tasks(
        status=status,
        priority=priority,
        assigned_to=assigned_to,
        analysis_id=analysis_id,
        issue_id=issue_id,
    )


@router.get("/gantt", response_model=list[TaskGanttView])
async def get_gantt_tasks(
    storage: StorageService = Depends(get_storage),
):
    """Get all tasks formatted for Gantt chart display."""
    tasks = storage.list_tasks()
    return [TaskGanttView.from_task(task) for task in tasks]


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get a specific task."""
    task = storage.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=Task)
async def update_task(
    task_id: str,
    update: TaskUpdate,
    storage: StorageService = Depends(get_storage),
):
    """Update a task."""
    task = storage.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = update.model_dump(exclude_unset=True)

    # Validate dates if both are provided
    start = updates.get("start_date", task.start_date)
    end = updates.get("end_date", task.end_date)
    if end < start:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )

    # Validate dependencies
    if "dependencies" in updates:
        for dep_id in updates["dependencies"]:
            if dep_id == task_id:
                raise HTTPException(
                    status_code=400,
                    detail="Task cannot depend on itself"
                )
            if not storage.get_task(dep_id):
                raise HTTPException(
                    status_code=404,
                    detail=f"Dependency task {dep_id} not found"
                )

    updated_task = storage.update_task(task_id, **updates)
    return updated_task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Delete a task."""
    if not storage.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.get("/{task_id}/subtasks", response_model=list[Task])
async def get_subtasks(
    task_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get all subtasks of a task."""
    task = storage.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return storage.get_subtasks(task_id)


@router.post("/from-issue/{issue_id}", response_model=Task)
async def create_task_from_issue(
    issue_id: str,
    task_data: TaskCreate,
    storage: StorageService = Depends(get_storage),
):
    """Create a task linked to an issue."""
    issue = storage.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    task = Task(
        **task_data.model_dump(),
        issue_id=issue_id,
        analysis_id=issue.analysis_id,
    )

    # Use issue title if task title not provided
    if not task.title or task.title == "":
        task.title = f"Remediate: {issue.title}"

    return storage.save_task(task)

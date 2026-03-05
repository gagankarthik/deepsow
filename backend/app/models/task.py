from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from enum import Enum
import uuid


class TaskStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    priority: TaskPriority = TaskPriority.MEDIUM
    start_date: date
    end_date: date
    progress: int = Field(default=0, ge=0, le=100)
    assigned_to: Optional[str] = None
    parent_id: Optional[str] = None  # For subtasks
    dependencies: list[str] = Field(default_factory=list)  # Task IDs this depends on
    issue_id: Optional[str] = None  # Link to an issue
    analysis_id: Optional[str] = None  # Link to an analysis
    color: Optional[str] = None  # For Gantt chart display
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    priority: TaskPriority = TaskPriority.MEDIUM
    start_date: date
    end_date: date
    progress: int = Field(default=0, ge=0, le=100)
    assigned_to: Optional[str] = None
    parent_id: Optional[str] = None
    dependencies: list[str] = Field(default_factory=list)
    issue_id: Optional[str] = None
    analysis_id: Optional[str] = None
    color: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    assigned_to: Optional[str] = None
    parent_id: Optional[str] = None
    dependencies: Optional[list[str]] = None
    color: Optional[str] = None


class TaskGanttView(BaseModel):
    """Task representation for Gantt chart."""
    id: str
    title: str
    start_date: date
    end_date: date
    progress: int
    status: TaskStatus
    priority: TaskPriority
    dependencies: list[str]
    parent_id: Optional[str]
    color: Optional[str]
    assigned_to: Optional[str]

    @classmethod
    def from_task(cls, task: Task) -> "TaskGanttView":
        return cls(
            id=task.id,
            title=task.title,
            start_date=task.start_date,
            end_date=task.end_date,
            progress=task.progress,
            status=task.status,
            priority=task.priority,
            dependencies=task.dependencies,
            parent_id=task.parent_id,
            color=task.color,
            assigned_to=task.assigned_to,
        )

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid


class IssueStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    CONFIRMED = "confirmed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class KanbanColumn(str, Enum):
    IDENTIFIED = "identified"
    UNDER_REVIEW = "under_review"
    CONFIRMED = "confirmed"
    REMEDIATION = "remediation"
    CLOSED = "closed"


class IssueComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str = Field(..., min_length=1)
    author: str = "User"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Issue(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    analysis_id: str
    document_id: str
    finding_id: str
    category: str
    title: str
    description: str
    evidence: str
    risk_level: str
    estimated_savings: Optional[float] = None
    recommendation: str
    page_reference: Optional[str] = None
    status: IssueStatus = IssueStatus.OPEN
    kanban_column: KanbanColumn = KanbanColumn.IDENTIFIED
    priority: int = Field(default=0, ge=0, le=10)
    assigned_to: Optional[str] = None
    comments: list[IssueComment] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IssueCreate(BaseModel):
    analysis_id: str
    document_id: str
    finding_id: str
    category: str
    title: str
    description: str
    evidence: str
    risk_level: str
    estimated_savings: Optional[float] = None
    recommendation: str
    page_reference: Optional[str] = None


class IssueUpdate(BaseModel):
    status: Optional[IssueStatus] = None
    kanban_column: Optional[KanbanColumn] = None
    priority: Optional[int] = Field(None, ge=0, le=10)
    assigned_to: Optional[str] = None


class IssueCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    author: str = "User"

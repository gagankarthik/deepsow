from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional
from enum import Enum
import uuid


class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    qualification: Optional[str] = None
    rate: Optional[float] = None
    hours_allocated: Optional[float] = None
    department: Optional[str] = None


class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    progress: int = Field(default=0, ge=0, le=100)
    status: str = "pending"  # pending, in_progress, completed, delayed
    deliverables: list[str] = Field(default_factory=list)


class ProjectPhase(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    progress: int = Field(default=0, ge=0, le=100)
    budget: Optional[float] = None
    spent: Optional[float] = None


class BudgetItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str
    description: Optional[str] = None
    planned_amount: float
    actual_amount: float = 0
    variance: float = 0


class SOWExtractedData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    analysis_id: Optional[str] = None

    # Project Overview
    project_name: Optional[str] = None
    project_description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration_days: Optional[int] = None

    # Financial Data
    total_budget: Optional[float] = None
    spent_to_date: Optional[float] = None
    remaining_budget: Optional[float] = None
    budget_items: list[BudgetItem] = Field(default_factory=list)

    # Team/Staffing
    employees: list[Employee] = Field(default_factory=list)
    total_fte: Optional[float] = None
    labor_cost: Optional[float] = None

    # Timeline & Milestones
    milestones: list[Milestone] = Field(default_factory=list)
    phases: list[ProjectPhase] = Field(default_factory=list)

    # Tasks
    tasks: list[dict] = Field(default_factory=list)

    # Overall Progress
    overall_progress: int = Field(default=0, ge=0, le=100)

    # Metadata
    extracted_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SOWDataResponse(BaseModel):
    id: str
    document_id: str
    project_name: Optional[str]
    project_description: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    duration_days: Optional[int]
    total_budget: Optional[float]
    spent_to_date: Optional[float]
    remaining_budget: Optional[float]
    budget_items: list[BudgetItem]
    employees: list[Employee]
    total_fte: Optional[float]
    labor_cost: Optional[float]
    milestones: list[Milestone]
    phases: list[ProjectPhase]
    tasks: list[dict]
    overall_progress: int

    @classmethod
    def from_sow_data(cls, data: SOWExtractedData) -> "SOWDataResponse":
        return cls(
            id=data.id,
            document_id=data.document_id,
            project_name=data.project_name,
            project_description=data.project_description,
            start_date=data.start_date,
            end_date=data.end_date,
            duration_days=data.duration_days,
            total_budget=data.total_budget,
            spent_to_date=data.spent_to_date,
            remaining_budget=data.remaining_budget,
            budget_items=data.budget_items,
            employees=data.employees,
            total_fte=data.total_fte,
            labor_cost=data.labor_cost,
            milestones=data.milestones,
            phases=data.phases,
            tasks=data.tasks,
            overall_progress=data.overall_progress,
        )

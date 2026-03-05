from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AbuseCategory(str, Enum):
    INTENTIONAL_SCOPE_CREEP = "intentional_scope_creep"
    FABRICATION_OF_DOCUMENTATION = "fabrication_of_documentation"
    FALSE_STANDARDS_COMPLIANCE = "false_standards_compliance"
    GAMING_THE_AUDIT = "gaming_the_audit"
    LACK_OF_INDEPENDENCE = "lack_of_independence"
    INFLATED_STAFFING = "inflated_staffing"
    UNQUALIFIED_STAFF = "unqualified_staff"
    OMITTED_CRITICAL_AREAS = "omitted_critical_areas"


ABUSE_CATEGORY_LABELS = {
    AbuseCategory.INTENTIONAL_SCOPE_CREEP: "Intentional Scope Creep",
    AbuseCategory.FABRICATION_OF_DOCUMENTATION: "Fabrication of Documentation",
    AbuseCategory.FALSE_STANDARDS_COMPLIANCE: "False Standards Compliance",
    AbuseCategory.GAMING_THE_AUDIT: "Gaming the Audit",
    AbuseCategory.LACK_OF_INDEPENDENCE: "Lack of Independence",
    AbuseCategory.INFLATED_STAFFING: "Inflated Staffing",
    AbuseCategory.UNQUALIFIED_STAFF: "Unqualified Staff",
    AbuseCategory.OMITTED_CRITICAL_AREAS: "Omitted Critical Areas",
}


class Finding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: AbuseCategory
    title: str
    description: str
    evidence: str
    risk_level: RiskLevel
    estimated_savings: Optional[float] = None
    recommendation: str
    page_reference: Optional[str] = None


class Analysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    status: AnalysisStatus = AnalysisStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: int = Field(default=0, ge=0, le=100)
    current_step: str = "Initializing"
    findings: list[Finding] = Field(default_factory=list)
    summary: Optional[str] = None
    total_estimated_savings: Optional[float] = None
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    error_message: Optional[str] = None


class AnalysisResponse(BaseModel):
    id: str
    document_id: str
    status: AnalysisStatus
    progress: int
    current_step: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None


class AnalysisResults(BaseModel):
    id: str
    document_id: str
    status: AnalysisStatus
    findings: list[Finding]
    summary: Optional[str]
    total_estimated_savings: Optional[float]
    risk_score: Optional[int]
    category_breakdown: dict[str, int]
    risk_breakdown: dict[str, int]

    @classmethod
    def from_analysis(cls, analysis: Analysis) -> "AnalysisResults":
        category_breakdown = {}
        risk_breakdown = {}

        for finding in analysis.findings:
            cat_key = ABUSE_CATEGORY_LABELS.get(finding.category, finding.category.value)
            category_breakdown[cat_key] = category_breakdown.get(cat_key, 0) + 1
            risk_breakdown[finding.risk_level.value] = risk_breakdown.get(finding.risk_level.value, 0) + 1

        return cls(
            id=analysis.id,
            document_id=analysis.document_id,
            status=analysis.status,
            findings=analysis.findings,
            summary=analysis.summary,
            total_estimated_savings=analysis.total_estimated_savings,
            risk_score=analysis.risk_score,
            category_breakdown=category_breakdown,
            risk_breakdown=risk_breakdown,
        )

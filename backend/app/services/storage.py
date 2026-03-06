from typing import Optional
from functools import lru_cache
from ..models.document import Document
from ..models.analysis import Analysis
from ..models.issue import Issue
from ..models.task import Task
from ..models.sow_data import SOWExtractedData


class StorageService:
    """In-memory storage service for documents, analyses, issues, and tasks."""

    def __init__(self):
        self._documents: dict[str, Document] = {}
        self._analyses: dict[str, Analysis] = {}
        self._issues: dict[str, Issue] = {}
        self._tasks: dict[str, Task] = {}
        self._sow_data: dict[str, SOWExtractedData] = {}

    # Document operations
    def save_document(self, document: Document) -> Document:
        self._documents[document.id] = document
        return document

    def get_document(self, document_id: str) -> Optional[Document]:
        return self._documents.get(document_id)

    def list_documents(self) -> list[Document]:
        return sorted(
            self._documents.values(),
            key=lambda d: d.uploaded_at,
            reverse=True
        )

    def delete_document(self, document_id: str) -> bool:
        if document_id in self._documents:
            del self._documents[document_id]
            # Also delete related analyses and issues
            analyses_to_delete = [
                a.id for a in self._analyses.values()
                if a.document_id == document_id
            ]
            for analysis_id in analyses_to_delete:
                self.delete_analysis(analysis_id)
            return True
        return False

    # Analysis operations
    def save_analysis(self, analysis: Analysis) -> Analysis:
        self._analyses[analysis.id] = analysis
        return analysis

    def get_analysis(self, analysis_id: str) -> Optional[Analysis]:
        return self._analyses.get(analysis_id)

    def get_analysis_by_document(self, document_id: str) -> Optional[Analysis]:
        for analysis in self._analyses.values():
            if analysis.document_id == document_id:
                return analysis
        return None

    def list_analyses(self) -> list[Analysis]:
        return list(self._analyses.values())

    def delete_analysis(self, analysis_id: str) -> bool:
        if analysis_id in self._analyses:
            # Delete related issues
            issues_to_delete = [
                i.id for i in self._issues.values()
                if i.analysis_id == analysis_id
            ]
            for issue_id in issues_to_delete:
                del self._issues[issue_id]
            del self._analyses[analysis_id]
            return True
        return False

    # Issue operations
    def save_issue(self, issue: Issue) -> Issue:
        self._issues[issue.id] = issue
        return issue

    def get_issue(self, issue_id: str) -> Optional[Issue]:
        return self._issues.get(issue_id)

    def list_issues(
        self,
        analysis_id: Optional[str] = None,
        status: Optional[str] = None,
        risk_level: Optional[str] = None,
        category: Optional[str] = None,
        kanban_column: Optional[str] = None,
    ) -> list[Issue]:
        issues = list(self._issues.values())

        if analysis_id:
            issues = [i for i in issues if i.analysis_id == analysis_id]
        if status:
            issues = [i for i in issues if i.status.value == status]
        if risk_level:
            issues = [i for i in issues if i.risk_level == risk_level]
        if category:
            issues = [i for i in issues if i.category == category]
        if kanban_column:
            issues = [i for i in issues if i.kanban_column.value == kanban_column]

        return sorted(issues, key=lambda i: i.created_at, reverse=True)

    def update_issue(self, issue_id: str, **updates) -> Optional[Issue]:
        issue = self.get_issue(issue_id)
        if issue:
            from datetime import datetime
            for key, value in updates.items():
                if value is not None and hasattr(issue, key):
                    setattr(issue, key, value)
            issue.updated_at = datetime.utcnow()
            self._issues[issue_id] = issue
            return issue
        return None

    def delete_issue(self, issue_id: str) -> bool:
        if issue_id in self._issues:
            del self._issues[issue_id]
            return True
        return False

    # Task operations
    def save_task(self, task: Task) -> Task:
        self._tasks[task.id] = task
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def list_tasks(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assigned_to: Optional[str] = None,
        analysis_id: Optional[str] = None,
        issue_id: Optional[str] = None,
    ) -> list[Task]:
        tasks = list(self._tasks.values())

        if status:
            tasks = [t for t in tasks if t.status.value == status]
        if priority:
            tasks = [t for t in tasks if t.priority.value == priority]
        if assigned_to:
            tasks = [t for t in tasks if t.assigned_to == assigned_to]
        if analysis_id:
            tasks = [t for t in tasks if t.analysis_id == analysis_id]
        if issue_id:
            tasks = [t for t in tasks if t.issue_id == issue_id]

        return sorted(tasks, key=lambda t: t.start_date)

    def update_task(self, task_id: str, **updates) -> Optional[Task]:
        task = self.get_task(task_id)
        if task:
            from datetime import datetime
            for key, value in updates.items():
                if value is not None and hasattr(task, key):
                    setattr(task, key, value)
            task.updated_at = datetime.utcnow()
            self._tasks[task_id] = task
            return task
        return None

    def delete_task(self, task_id: str) -> bool:
        if task_id in self._tasks:
            # Also remove this task from dependencies of other tasks
            for task in self._tasks.values():
                if task_id in task.dependencies:
                    task.dependencies.remove(task_id)
            del self._tasks[task_id]
            return True
        return False

    def get_subtasks(self, parent_id: str) -> list[Task]:
        return [t for t in self._tasks.values() if t.parent_id == parent_id]

    # Stats
    def get_stats(self) -> dict:
        issues = list(self._issues.values())
        tasks = list(self._tasks.values())
        return {
            "total_documents": len(self._documents),
            "total_analyses": len(self._analyses),
            "total_issues": len(issues),
            "total_tasks": len(tasks),
            "issues_by_status": self._count_by_field(issues, "status"),
            "issues_by_risk": self._count_by_field(issues, "risk_level"),
            "issues_by_category": self._count_by_field(issues, "category"),
            "tasks_by_status": self._count_by_field(tasks, "status"),
            "tasks_by_priority": self._count_by_field(tasks, "priority"),
        }

    def _count_by_field(self, items: list, field: str) -> dict:
        counts = {}
        for item in items:
            value = getattr(item, field)
            if hasattr(value, "value"):
                value = value.value
            counts[value] = counts.get(value, 0) + 1
        return counts

    # SOW Data operations
    def save_sow_data(self, sow_data: SOWExtractedData) -> SOWExtractedData:
        self._sow_data[sow_data.id] = sow_data
        return sow_data

    def get_sow_data(self, sow_data_id: str) -> Optional[SOWExtractedData]:
        return self._sow_data.get(sow_data_id)

    def get_sow_data_by_document(self, document_id: str) -> Optional[SOWExtractedData]:
        for sow_data in self._sow_data.values():
            if sow_data.document_id == document_id:
                return sow_data
        return None

    def get_sow_data_by_analysis(self, analysis_id: str) -> Optional[SOWExtractedData]:
        for sow_data in self._sow_data.values():
            if sow_data.analysis_id == analysis_id:
                return sow_data
        return None

    def list_sow_data(self) -> list[SOWExtractedData]:
        return sorted(
            self._sow_data.values(),
            key=lambda s: s.extracted_at,
            reverse=True
        )

    def update_sow_data(self, sow_data_id: str, **updates) -> Optional[SOWExtractedData]:
        sow_data = self.get_sow_data(sow_data_id)
        if sow_data:
            from datetime import datetime
            for key, value in updates.items():
                if value is not None and hasattr(sow_data, key):
                    setattr(sow_data, key, value)
            sow_data.updated_at = datetime.utcnow()
            self._sow_data[sow_data_id] = sow_data
            return sow_data
        return None

    def delete_sow_data(self, sow_data_id: str) -> bool:
        if sow_data_id in self._sow_data:
            del self._sow_data[sow_data_id]
            return True
        return False

    # Dashboard summary
    def get_dashboard_summary(self) -> dict:
        sow_data_list = list(self._sow_data.values())
        tasks = list(self._tasks.values())
        issues = list(self._issues.values())

        total_budget = sum(s.total_budget or 0 for s in sow_data_list)
        total_spent = sum(s.spent_to_date or 0 for s in sow_data_list)
        all_employees = []
        all_milestones = []
        all_phases = []

        for sow_data in sow_data_list:
            all_employees.extend(sow_data.employees)
            all_milestones.extend(sow_data.milestones)
            all_phases.extend(sow_data.phases)

        return {
            "total_projects": len(sow_data_list),
            "total_budget": total_budget,
            "total_spent": total_spent,
            "budget_remaining": total_budget - total_spent,
            "total_employees": len(all_employees),
            "total_milestones": len(all_milestones),
            "milestones_completed": len([m for m in all_milestones if m.status == "completed"]),
            "total_tasks": len(tasks),
            "tasks_completed": len([t for t in tasks if t.status.value == "completed"]),
            "total_issues": len(issues),
            "critical_issues": len([i for i in issues if i.risk_level == "critical"]),
            "employees": [e.model_dump() for e in all_employees[:10]],
            "recent_milestones": [m.model_dump() for m in all_milestones[:5]],
            "phases": [p.model_dump() for p in all_phases],
        }


@lru_cache
def get_storage() -> StorageService:
    return StorageService()

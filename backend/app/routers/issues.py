from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.issue import Issue, IssueUpdate, IssueComment, IssueCommentCreate
from ..services.storage import get_storage, StorageService

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("", response_model=list[Issue])
async def list_issues(
    analysis_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    kanban_column: Optional[str] = Query(None),
    storage: StorageService = Depends(get_storage),
):
    """List issues with optional filters."""
    return storage.list_issues(
        analysis_id=analysis_id,
        status=status,
        risk_level=risk_level,
        category=category,
        kanban_column=kanban_column,
    )


@router.get("/{issue_id}", response_model=Issue)
async def get_issue(
    issue_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get a specific issue."""
    issue = storage.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.patch("/{issue_id}", response_model=Issue)
async def update_issue(
    issue_id: str,
    update: IssueUpdate,
    storage: StorageService = Depends(get_storage),
):
    """Update an issue's status, kanban column, priority, or assignee."""
    issue = storage.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    updates = update.model_dump(exclude_unset=True)
    updated_issue = storage.update_issue(issue_id, **updates)

    return updated_issue


@router.post("/{issue_id}/comments", response_model=Issue)
async def add_comment(
    issue_id: str,
    comment: IssueCommentCreate,
    storage: StorageService = Depends(get_storage),
):
    """Add a comment to an issue."""
    issue = storage.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    new_comment = IssueComment(
        content=comment.content,
        author=comment.author,
        created_at=datetime.utcnow(),
    )

    issue.comments.append(new_comment)
    issue.updated_at = datetime.utcnow()
    storage.save_issue(issue)

    return issue


@router.delete("/{issue_id}")
async def delete_issue(
    issue_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Delete an issue."""
    if not storage.delete_issue(issue_id):
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"message": "Issue deleted successfully"}


@router.get("/stats/summary")
async def get_issues_stats(
    storage: StorageService = Depends(get_storage),
):
    """Get summary statistics for issues."""
    return storage.get_stats()

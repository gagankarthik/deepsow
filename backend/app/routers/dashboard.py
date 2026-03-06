from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query

from ..models.sow_data import SOWExtractedData, SOWDataResponse, Employee, Milestone, ProjectPhase, BudgetItem
from ..services.storage import get_storage, StorageService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    storage: StorageService = Depends(get_storage),
):
    """Get comprehensive dashboard summary."""
    return storage.get_dashboard_summary()


@router.get("/sow-data", response_model=list[SOWDataResponse])
async def list_sow_data(
    storage: StorageService = Depends(get_storage),
):
    """List all SOW extracted data."""
    sow_data_list = storage.list_sow_data()
    return [SOWDataResponse.from_sow_data(s) for s in sow_data_list]


@router.get("/sow-data/{sow_data_id}", response_model=SOWDataResponse)
async def get_sow_data(
    sow_data_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get specific SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")
    return SOWDataResponse.from_sow_data(sow_data)


@router.get("/sow-data/by-document/{document_id}", response_model=SOWDataResponse)
async def get_sow_data_by_document(
    document_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get SOW data for a specific document."""
    sow_data = storage.get_sow_data_by_document(document_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found for this document")
    return SOWDataResponse.from_sow_data(sow_data)


@router.get("/sow-data/by-analysis/{analysis_id}", response_model=SOWDataResponse)
async def get_sow_data_by_analysis(
    analysis_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get SOW data for a specific analysis."""
    sow_data = storage.get_sow_data_by_analysis(analysis_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found for this analysis")
    return SOWDataResponse.from_sow_data(sow_data)


@router.patch("/sow-data/{sow_data_id}")
async def update_sow_data(
    sow_data_id: str,
    updates: dict,
    storage: StorageService = Depends(get_storage),
):
    """Update SOW data (for editing)."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    updated = storage.update_sow_data(sow_data_id, **updates)
    return SOWDataResponse.from_sow_data(updated)


@router.patch("/sow-data/{sow_data_id}/employee/{employee_id}")
async def update_employee(
    sow_data_id: str,
    employee_id: str,
    updates: dict,
    storage: StorageService = Depends(get_storage),
):
    """Update an employee in SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    for i, emp in enumerate(sow_data.employees):
        if emp.id == employee_id:
            for key, value in updates.items():
                if hasattr(emp, key):
                    setattr(emp, key, value)
            sow_data.employees[i] = emp
            break
    else:
        raise HTTPException(status_code=404, detail="Employee not found")

    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Employee updated successfully"}


@router.patch("/sow-data/{sow_data_id}/milestone/{milestone_id}")
async def update_milestone(
    sow_data_id: str,
    milestone_id: str,
    updates: dict,
    storage: StorageService = Depends(get_storage),
):
    """Update a milestone in SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    for i, ms in enumerate(sow_data.milestones):
        if ms.id == milestone_id:
            for key, value in updates.items():
                if hasattr(ms, key):
                    setattr(ms, key, value)
            sow_data.milestones[i] = ms
            break
    else:
        raise HTTPException(status_code=404, detail="Milestone not found")

    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Milestone updated successfully"}


@router.post("/sow-data/{sow_data_id}/employee")
async def add_employee(
    sow_data_id: str,
    employee: dict,
    storage: StorageService = Depends(get_storage),
):
    """Add a new employee to SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    new_employee = Employee(
        name=employee.get("name", "New Employee"),
        role=employee.get("role", "Team Member"),
        qualification=employee.get("qualification"),
        rate=employee.get("rate"),
        hours_allocated=employee.get("hours_allocated"),
        department=employee.get("department"),
    )
    sow_data.employees.append(new_employee)
    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Employee added successfully", "employee_id": new_employee.id}


@router.post("/sow-data/{sow_data_id}/milestone")
async def add_milestone(
    sow_data_id: str,
    milestone: dict,
    storage: StorageService = Depends(get_storage),
):
    """Add a new milestone to SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    new_milestone = Milestone(
        name=milestone.get("name", "New Milestone"),
        description=milestone.get("description"),
        due_date=milestone.get("due_date"),
        progress=milestone.get("progress", 0),
        status=milestone.get("status", "pending"),
        deliverables=milestone.get("deliverables", []),
    )
    sow_data.milestones.append(new_milestone)
    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Milestone added successfully", "milestone_id": new_milestone.id}


@router.delete("/sow-data/{sow_data_id}/employee/{employee_id}")
async def delete_employee(
    sow_data_id: str,
    employee_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Delete an employee from SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    sow_data.employees = [e for e in sow_data.employees if e.id != employee_id]
    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Employee deleted successfully"}


@router.delete("/sow-data/{sow_data_id}/milestone/{milestone_id}")
async def delete_milestone(
    sow_data_id: str,
    milestone_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Delete a milestone from SOW data."""
    sow_data = storage.get_sow_data(sow_data_id)
    if not sow_data:
        raise HTTPException(status_code=404, detail="SOW data not found")

    sow_data.milestones = [m for m in sow_data.milestones if m.id != milestone_id]
    sow_data.updated_at = datetime.utcnow()
    storage.save_sow_data(sow_data)
    return {"message": "Milestone deleted successfully"}

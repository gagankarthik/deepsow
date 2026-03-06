import asyncio
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

from ..models.analysis import Analysis, AnalysisStatus, AnalysisResponse, AnalysisResults
from ..services.storage import get_storage, StorageService
from ..services.openai_analyzer import OpenAIAnalyzer

router = APIRouter(prefix="/analysis", tags=["analysis"])


async def run_analysis(
    analysis_id: str,
    document_text: str,
    vendor_name: str,
    contract_value: float,
):
    """Background task to run the analysis."""
    analyzer = OpenAIAnalyzer()
    try:
        await analyzer.analyze_document(
            analysis_id=analysis_id,
            document_text=document_text,
            vendor_name=vendor_name,
            contract_value=contract_value,
        )
    except Exception as e:
        storage = get_storage()
        analysis = storage.get_analysis(analysis_id)
        if analysis:
            analysis.status = AnalysisStatus.FAILED
            analysis.error_message = str(e)
            storage.save_analysis(analysis)


@router.post("/start/{document_id}", response_model=AnalysisResponse)
async def start_analysis(
    document_id: str,
    background_tasks: BackgroundTasks,
    storage: StorageService = Depends(get_storage),
):
    """Start analysis of a document."""
    # Get document
    document = storage.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if not document.text_content:
        raise HTTPException(status_code=400, detail="Document has no extracted text")

    # Check if analysis already exists
    existing = storage.get_analysis_by_document(document_id)
    if existing and existing.status == AnalysisStatus.PROCESSING:
        raise HTTPException(status_code=400, detail="Analysis already in progress")

    # Create new analysis
    analysis = Analysis(
        document_id=document_id,
        status=AnalysisStatus.PENDING,
        current_step="Queued for analysis",
    )
    storage.save_analysis(analysis)

    # Update document with analysis ID
    document.analysis_id = analysis.id
    storage.save_document(document)

    # Start background analysis
    background_tasks.add_task(
        run_analysis,
        analysis_id=analysis.id,
        document_text=document.text_content,
        vendor_name=document.metadata.vendor_name,
        contract_value=document.metadata.contract_value or 0,
    )

    return AnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        status=analysis.status,
        progress=analysis.progress,
        current_step=analysis.current_step,
        started_at=analysis.started_at,
        completed_at=analysis.completed_at,
        error_message=analysis.error_message,
    )


@router.get("/{analysis_id}/status", response_model=AnalysisResponse)
async def get_analysis_status(
    analysis_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get the status of an analysis."""
    analysis = storage.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found. The server may have been restarted. Please upload and analyze the document again."
        )

    return AnalysisResponse(
        id=analysis.id,
        document_id=analysis.document_id,
        status=analysis.status,
        progress=analysis.progress,
        current_step=analysis.current_step,
        started_at=analysis.started_at,
        completed_at=analysis.completed_at,
        error_message=analysis.error_message,
    )


@router.get("/{analysis_id}/results", response_model=AnalysisResults)
async def get_analysis_results(
    analysis_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get the results of a completed analysis."""
    analysis = storage.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.status != AnalysisStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail=f"Analysis not completed. Current status: {analysis.status.value}"
        )

    return AnalysisResults.from_analysis(analysis)


@router.get("", response_model=list[AnalysisResponse])
async def list_analyses(
    storage: StorageService = Depends(get_storage),
):
    """List all analyses."""
    analyses = storage.list_analyses()
    return [
        AnalysisResponse(
            id=a.id,
            document_id=a.document_id,
            status=a.status,
            progress=a.progress,
            current_step=a.current_step,
            started_at=a.started_at,
            completed_at=a.completed_at,
            error_message=a.error_message,
        )
        for a in analyses
    ]

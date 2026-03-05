import os
import uuid
import aiofiles
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional

from ..config import get_settings, Settings
from ..models.document import Document, DocumentMetadata, DocumentResponse
from ..services.storage import get_storage, StorageService
from ..services.document_processor import DocumentProcessor

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    vendor_name: str = Form(...),
    contract_value: Optional[float] = Form(None),
    contract_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    settings: Settings = Depends(get_settings),
    storage: StorageService = Depends(get_storage),
):
    """Upload a document for analysis."""
    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = os.path.splitext(file.filename)[1].lower().lstrip(".")
    if extension not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {settings.allowed_extensions_list}"
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    # Validate file size
    if file_size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.max_file_size_mb}MB"
        )

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{extension}"
    file_path = os.path.join(settings.upload_dir, filename)

    # Ensure upload directory exists
    os.makedirs(settings.upload_dir, exist_ok=True)

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Extract text
    try:
        text_content = DocumentProcessor.extract_text(file_path)
    except Exception as e:
        # Clean up file if extraction fails
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

    # Parse contract date
    parsed_date = None
    if contract_date:
        try:
            parsed_date = datetime.fromisoformat(contract_date)
        except ValueError:
            pass

    # Create document metadata
    metadata = DocumentMetadata(
        vendor_name=vendor_name,
        contract_value=contract_value,
        contract_date=parsed_date,
        description=description,
    )

    # Create and save document
    document = Document(
        id=file_id,
        filename=filename,
        original_filename=file.filename,
        file_size=file_size,
        file_type=extension,
        metadata=metadata,
        text_content=text_content,
    )

    storage.save_document(document)

    return DocumentResponse.from_document(document)


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    storage: StorageService = Depends(get_storage),
):
    """List all uploaded documents."""
    documents = storage.list_documents()
    return [DocumentResponse.from_document(doc) for doc in documents]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    storage: StorageService = Depends(get_storage),
):
    """Get a specific document."""
    document = storage.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.from_document(document)


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    storage: StorageService = Depends(get_storage),
    settings: Settings = Depends(get_settings),
):
    """Delete a document."""
    document = storage.get_document(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    file_path = os.path.join(settings.upload_dir, document.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete from storage
    storage.delete_document(document_id)

    return {"message": "Document deleted successfully"}

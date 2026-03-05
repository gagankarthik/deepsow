from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid


class DocumentMetadata(BaseModel):
    vendor_name: str = Field(..., min_length=1, max_length=200)
    contract_value: Optional[float] = Field(None, ge=0)
    contract_date: Optional[datetime] = None
    description: Optional[str] = None


class DocumentCreate(BaseModel):
    metadata: DocumentMetadata


class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    metadata: DocumentMetadata
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    text_content: Optional[str] = None
    analysis_id: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_size: int
    file_type: str
    metadata: DocumentMetadata
    uploaded_at: datetime
    has_text_content: bool
    analysis_id: Optional[str] = None

    @classmethod
    def from_document(cls, doc: Document) -> "DocumentResponse":
        return cls(
            id=doc.id,
            filename=doc.filename,
            original_filename=doc.original_filename,
            file_size=doc.file_size,
            file_type=doc.file_type,
            metadata=doc.metadata,
            uploaded_at=doc.uploaded_at,
            has_text_content=doc.text_content is not None,
            analysis_id=doc.analysis_id,
        )

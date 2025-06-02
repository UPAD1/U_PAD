from pydantic import BaseModel
from typing import Optional
import uuid

class UploadCreate(BaseModel):
    file_name: str
    file_type: str
    upload_path: str

class UploadOut(UploadCreate):
    id: uuid.UUID
    upload_time: Optional[str]

class OCRResultOut(BaseModel):
    id: uuid.UUID
    upload_id: uuid.UUID
    extracted_text: str
    #engine: str
    ocr_time: Optional[str]

class MaskingResultOut(BaseModel):
    id: uuid.UUID
    upload_id: uuid.UUID
    masked_file_path: str
    masking_method: dict
    masking_time: Optional[str]

class DLPResultOut(BaseModel):
    id: uuid.UUID
    ocr_result_id: uuid.UUID
    info_type: str
    quote: str #민감정보 원문
    likelihood: str #민감한 정도
    original_text: str
    masked_text: str
    position_start: Optional[str]
    position_end: Optional[str]
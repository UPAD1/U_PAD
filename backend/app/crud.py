from sqlalchemy.orm import Session
from app import models, schemas
import uuid
from datetime import datetime

def get_upload_by_id(db: Session, upload_id:uuid.UUID):
    return db.query(models.Upload).filter(models.Upload.id == upload_id).first()

def create_upload(db: Session, filename: str, upload_path: str, text: str, created_at: datetime, file_type: str):
    new_upload = models.Upload(
        id=uuid.uuid4(),
        filename=filename,
        upload_path=upload_path,
        extracted_text=text,
        created_at=created_at,
        file_type=file_type
    )
    db.add(new_upload)
    db.commit()
    db.refresh(new_upload)
    return new_upload

def create_ocr_result(db: Session, upload_id: uuid.UUID, text: str):
    ocr = models.OCRResult(upload_id=upload_id, extracted_text=text, engine="pytesseract")
    db.add(ocr)
    db.commit()
    db.refresh(ocr)
    return ocr

def create_masking_result(db: Session, upload_id:uuid.UUID, path: str, method: dict):
    masking = models.MaskingResult(upload_id=upload_id, masked_file_path=path, masking_method=method)
    db.add(masking)
    db.commit()
    db.refresh(masking)
    return masking

def create_dlp_result(db: Session, ocr_id: uuid.UUID, info_type: str, quote: str, likelihood: str):
    dlp = models.DLPResult(
        ocr_result_id=ocr_id,
        info_type=info_type,
        quote=quote,
        likelihood=likelihood
    )
    db.add(dlp)
    db.commit()
    db.refresh(dlp)
    return dlp

def get_ocr_result_by_upload(db: Session, upload_id: uuid.UUID):
    return db.query(models.OCRResult).filter_by(upload_id=upload_id).first()

def get_masking_result_by_upload(db: Session, upload_id: uuid.UUID):
    return db.query(models.MaskingResult).filter_by(upload_id=upload_id).first()

def get_dlp_results_by_ocr(db: Session, ocr_id: uuid.UUID):
    return db.query(models.DLPResult).filter_by(ocr_result_id=ocr_id).all()
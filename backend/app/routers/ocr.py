from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import database, crud
from app.utils.ocr import process_document 
from uuid import UUID

router = APIRouter()

@router.post("/ocr/{upload_id}")
def ocr_process(upload_id: UUID, db: Session = Depends(database.get_db)):
    upload = crud.get_upload_by_id(db, upload_id)
    if not upload:
        return {"error": "Upload not found"}
    
    text = process_document(upload.upload_path)
    result = crud.create_ocr_result(db, upload_id, text)
    return {"upload_id": str(upload_id), "ocr_text": text, "ocr_id": result.id}



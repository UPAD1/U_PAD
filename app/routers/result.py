from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, database
from uuid import UUID

router = APIRouter()

@router.get("/results/{upload_id}")
def get_result(upload_id: UUID, db: Session = Depends(database.get_db)):
    upload = crud.get_upload_by_id(db, upload_id)
    ocr_result = crud.get_ocr_result_by_upload(db, upload_id)
    masking = crud.get_masking_result_by_upload(db, upload_id)
    dlp = crud.get_dlp_results_by_ocr(db, ocr_result.id) if ocr_result else []

    return {
        "upload": upload,
        "ocr": ocr_result,
        "masking_result": masking,
        "dlp_result": dlp
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import crud, database
from app.utils.face import mask_sensitive_info
from uuid import UUID

router = APIRouter()

@router.post("/masking/{upload_id}")
def masking_process(upload_id: UUID, db: Session = Depends(database.get_db)):
    upload = crud.get_upload_by_id(db, upload_id)
    if not upload:
        return {"error": "Upload not found"}

    masked_path, method = mask_sensitive_info(upload.upload_path)
    result = crud.create_masking_result(db, upload_id, masked_path, method)
    return {"masked_file_path": masked_path, "method": method}

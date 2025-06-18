from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
import os

from app import crud, database
from app.utils.face_mascot_blur import mask_faces  # mascot & blur
from app.utils.toonify import run_dualstyle_toonify  # toonify 추가

router = APIRouter()

@router.post("/mask/{upload_id}")
def process_face_mask(upload_id: UUID, mode: str = "mascot", db: Session = Depends(database.get_db)):
    """
    얼굴 인식 후 비식별 처리
    mode: "mascot", "blur", "toon"
    """
    assert mode in ["mascot", "blur", "toon"], "mode must be 'mascot', 'blur', or 'toon'"

    upload = crud.get_upload_by_id(db, upload_id)
    if not upload:
        return {"error": "Upload not found"}

    input_path = upload.upload_path

    try:
        if mode in ["mascot", "blur"]:
            result_path, meta, found = mask_faces(input_path, mode=mode)
        elif mode == "toon":
            result_path = run_dualstyle_toonify(input_path)
            meta = {"face": "stylized", "image": "toon", "text": "none"}
            found = True  # toonify는 YOLO를 쓰지 않으므로 true로 고정

        return {
            "original": input_path,
            "masked_result": result_path,
            "metadata": meta,
            "face_found": found,
            "mode": mode
        }

    except Exception as e:
        return {"error": str(e)}

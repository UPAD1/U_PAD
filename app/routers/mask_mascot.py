from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
import os
from app import crud, database
from app.utils.face import mask_sensitive_info
from app.utils.face_mascot import create_mascot_image
import cv2

router = APIRouter()

@router.post("/mascot/generate-and-mask/{upload_id}")
def generate_and_overlay(upload_id: UUID, db: Session = Depends(database.get_db)):
    upload = crud.get_upload_by_id(db, upload_id)
    if not upload:
        return {"error": "Upload not found"}

    input_path = upload.upload_path
    base_dir = os.path.dirname(input_path)
    mascot_path = os.path.join(base_dir, "generated_mascot.png")
    result_path = os.path.join(base_dir, "final_mascot_overlay.png")

    # Step 1: StyleGAN으로 마스코트 생성
    create_mascot_image(mascot_path, seed=upload_id.int % 10000)  # UUID 기반 seed 고정

    # Step 2: YOLO 또는 사전 좌표로 사용자 얼굴 bbox 설정
    image = load_image(input_path)
    h, w = image.shape[:2]
    x1, y1, x2, y2 = w//3, h//4, (w//3)*2, (h//4)*2  # 임시 박스 (실제 사용 시 YOLO로 대체 가능)

    mascot_img = load_image(mascot_path)
    result_img = apply_mascot_overlay(image.copy(), mascot_img, (x1, y1, x2, y2), w, h)

    cv2.imwrite(result_path, result_img)

    return {
        "generated_mascot": mascot_path,
        "result_image": result_path,
        "status": "success"
    }

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import database, crud
from google.cloud import dlp_v2
import os
from uuid import UUID

router = APIRouter()

@router.post("/dlp/{ocr_id}")
def dlp_inspect(ocr_id: UUID, db: Session = Depends(database.get_db)):
    ocr_result = crud.get_ocr_result_by_upload(db, ocr_id)
    if not ocr_result:
        return {"error": "OCR result not found."}

    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    parent = f"projects/{project_id}"

    dlp = dlp_v2.DlpServiceClient()
    item = {"value": ocr_result.extracted_text}

    info_types = [
        {"name": "EMAIL_ADDRESS"},
        {"name": "PHONE_NUMBER"},
        {"name": "CREDIT_CARD_NUMBER"}
    ]

    response = dlp.inspect_content(
        request={
            "parent": parent,
            "item": item,
            "inspect_config": {
                "info_types": info_types,
                "include_quote": True
            },
        }
    )

    for finding in response.result.findings:
        crud.create_dlp_result(
            db,
            ocr_id=ocr_result.id,
            info_type=finding.info_type.name,
            quote=finding.quote,
            likelihood=finding.likelihood.name
        )

    return {"message": f"DLP inspection 완료, OCR ID: {ocr_id} 로 저장됨"}

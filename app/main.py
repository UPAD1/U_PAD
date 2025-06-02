from fastapi import FastAPI, File, UploadFile, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pathlib import Path
import shutil
import uuid

from app import crud, database
from app.utils.face import mask_sensitive_info
from app.utils.video import process_video
from app.utils.ocr import process_document

from app.utils.image import process_image
from app.utils.image_mask import process_image_with_blocks  # ✅ 새 OCR + 위치 추출 유틸
from app.utils.mask_text import mask_sensitive_info_on_image  # ✅ 마스킹 유틸
from app.utils.text_cleaning import normalize_ocr_text

from app.routers import upload, ocr, masking, result
from app.dlp import app as dlp_app
from app.dlp import inspect_text

# 초기 설정
app = FastAPI()

app.include_router(upload.router)
app.include_router(ocr.router)
app.include_router(masking.router)
app.include_router(result.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/dlp", dlp_app)
templates = Jinja2Templates(directory="app/templates")

UPLOAD_DIR_DOC = Path("static/uploads/document")
UPLOAD_DIR_IMG = Path("static/uploads/image")
UPLOAD_DIR_VID = Path("static/uploads/video")
UPLOAD_DIR_DOC.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR_IMG.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR_VID.mkdir(parents=True, exist_ok=True)

# DB 테이블 생성용
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)


@app.get("/", response_class=HTMLResponse)
def main_page(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.get("/upload/document", response_class=HTMLResponse)
def document_upload_page(request: Request):
    return templates.TemplateResponse("document_upload.html", {
        "request": request,
        "doc_path": None,
        "text": ""
    })

@app.post("/upload/document", response_class=HTMLResponse)
async def upload_document(request: Request, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR_DOC / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result_docs, text = process_document(str(file_path))
        print(f"[INFO] 문서 OCR 완료: {file_path}")

        crud.create_upload(
            db=db,
            filename=filename,
            upload_path=str(file_path).replace("\\", "/"),
            text=text,
            created_at=datetime.now(timezone.utc),
            file_type="document"
        )
    except Exception as e:
        print(f"[ERROR] 문서 처리 실패: {e}")
        result_docs, text = [], "문서 처리 실패"

    dlp_result = await inspect_text(text=text)
    findings = dlp_result.get("findings", [])

    return templates.TemplateResponse("document_upload.html", {
        "request": request,
        "doc_path": "/" + str(file_path).replace("\\", "/"),
        "images": ["/" + path for path in result_docs],
        "text": text,
        "findings": findings
    })

@app.get("/upload/image", response_class=HTMLResponse)
def image_upload_page(request: Request):
    return templates.TemplateResponse("image_upload.html", {
        "request": request,
        "img_path": None,
        "text": ""
    })

@app.post("/upload/image", response_class=HTMLResponse)
async def upload_image(request: Request, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR_IMG / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        #masked_path, extracted_text = process_image(str(file_path))
        #print(f"[INFO] 이미지 처리 완료: {masked_path}")

        # ✅ 변경: OCR 텍스트 + 좌표 블록 추출
        image_path, extracted_text, ocr_blocks = process_image_with_blocks(str(file_path))

        # ✅ 추가: OCR 결과 전처리
        cleaned_text = normalize_ocr_text(extracted_text)

        # ✅ DLP로 민감 정보 탐지
        dlp_result = await inspect_text(text=cleaned_text)
        findings = dlp_result.get("findings", [])

        # ✅ 민감 정보 마스킹된 이미지 경로
        masked_output_path = str(file_path).replace(".jpg", "_masked.jpg").replace(".png", "_masked.png")

        # ✅ 마스킹 처리 수행
        mask_sensitive_info_on_image(image_path, ocr_blocks, findings, masked_output_path)

        # ✅ DB 저장 - 업로드 정보
        upload_record = crud.create_upload(
            db=db,
            filename=filename,
            upload_path=masked_output_path.replace("\\", "/"),
            text=cleaned_text,
            created_at=datetime.utcnow(),
            file_type="image"
        )

        # ✅ DB 저장 - 마스킹 결과
        crud.create_masking_result(
            db=db,
            upload_id=upload_record.id,  # ← 여기 중요: 업로드 ID 연결
            path=masked_output_path,
            method={"face": "none", "text": "bbox_black"}
        )

    except Exception as e:
        print(f"[ERROR] 이미지 처리 실패: {e}")
        masked_path = str(file_path)
        extracted_text = "이미지 처리 실패"

    dlp_result = await inspect_text(text=extracted_text)
    findings = dlp_result.get("findings", [])

    print("[DEBUG] 전처리 전:", extracted_text)
    print("[DEBUG] 전처리 후:", cleaned_text)

    return templates.TemplateResponse("image_upload.html", {
        "request": request,
        "img_path": "/" + masked_output_path.replace("\\", "/"),
        "text": cleaned_text,
        "findings": findings
    })

@app.get("/upload/video", response_class=HTMLResponse)
def video_upload_page(request: Request):
    return templates.TemplateResponse("video_upload.html", {
        "request": request,
        "video_path": None,
        "text": ""
    })

@app.post("/upload/video", response_class=HTMLResponse)
async def upload_video(request: Request, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = UPLOAD_DIR_VID / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result_path, text = process_video(str(file_path))
        print(f"[INFO] 영상 처리 완료: {result_path}")

        crud.create_upload(
            db=db,
            filename=filename,
            upload_path=result_path.replace("\\", "/"),
            text=text,
            created_at=datetime.utcnow(),
            file_type="video"
        )
    except Exception as e:
        print(f"[ERROR] 영상 처리 실패: {e}")
        result_path, text = str(file_path), "처리 실패"

    dlp_result = await inspect_text(text=text)
    findings = dlp_result.get("findings", [])

    return templates.TemplateResponse("video_upload.html", {
        "request": request,
        "video_path": "/" + result_path.replace("\\", "/"),
        "text": text,
        "findings": findings
    })

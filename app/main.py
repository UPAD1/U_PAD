from fastapi import FastAPI, File, UploadFile, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from datetime import datetime
import shutil
import os
import uuid

from app import crud, database
from app.utils.face import mask_sensitive_info
from app.utils.video import process_video
from app.utils.ocr import process_document
from app.utils.image import process_image
from app.routers import upload, ocr, masking, result
#from app.dlp import app as dlp_app
#from app.dlp import inspect_text

#  초기 설정
app = FastAPI()

app.include_router(upload.router)
app.include_router(ocr.router)
app.include_router(masking.router)
app.include_router(result.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
#app.mount("/dlp", dlp_app)
templates = Jinja2Templates(directory="app/templates")

UPLOAD_DIR_DOC = "static/uploads/document"
UPLOAD_DIR_IMG = "static/uploads/image"
UPLOAD_DIR_VID = "static/uploads/video"
os.makedirs(UPLOAD_DIR_DOC, exist_ok=True)
os.makedirs(UPLOAD_DIR_IMG, exist_ok=True)
os.makedirs(UPLOAD_DIR_VID, exist_ok=True)


# ================================
# 메인 페이지
# ================================
@app.get("/", response_class=HTMLResponse)
def main_page(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})


# ================================
# 문서 업로드
# ================================
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
    file_path = os.path.join(UPLOAD_DIR_DOC, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result_docs, text = process_document(file_path)
        print(f"[INFO] 문서 OCR 완료: {file_path}")

        crud.create_upload(
            db=db,
            filename=filename,
            upload_path=file_path.replace("\\", "/"),
            text=text,
            created_at=datetime.utcnow(),
            file_type="document"
        )
    except Exception as e:
        print(f"[ERROR] 문서 처리 실패: {e}")
        result_docs, text = [], "문서 처리 실패"

    #dlp_result = await inspect_text(text=text)
    #findings = dlp_result.get("findings", [])
    findings =[]

    return templates.TemplateResponse("document_upload.html", {
        "request": request,
        "doc_path": "/" + file_path.replace("\\", "/"),
        "images": ["/" + path for path in result_docs],
        "text": text,
        "findings": findings
    })


# ================================
# 이미지 업로드
# ================================
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
    file_path = os.path.join(UPLOAD_DIR_IMG, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        masked_path, extracted_text = process_image(file_path)
        print(f"[INFO] 이미지 처리 완료: {masked_path}")

        crud.create_upload(
            db=db,
            filename=filename,
            upload_path=masked_path.replace("\\", "/"),
            text=extracted_text,
            created_at=datetime.utcnow(),
            file_type="image"
        )

    except Exception as e:
        print(f"[ERROR] 이미지 처리 실패: {e}")
        masked_path = file_path
        extracted_text = "이미지 처리 실패"

    #dlp_result = await inspect_text(text=extracted_text)
    #findings = dlp_result.get("findings", [])
    findings = []


    return templates.TemplateResponse("image_upload.html", {
        "request": request,
        "img_path": "/" + masked_path.replace("\\", "/"),
        "text": extracted_text,
        "findings": findings
    })


# ================================
# 영상 업로드
# ================================
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
    file_path = os.path.join(UPLOAD_DIR_VID, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result_path, text = process_video(file_path)
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
        result_path, text = file_path, "처리 실패"

    #dlp_result = await inspect_text(text=text)
    #findings = dlp_result.get("findings", [])
    findings = []

    return templates.TemplateResponse("video_upload.html", {
        "request": request,
        "video_path": "/" + result_path.replace("\\", "/"),
        "text": text,
        "findings": findings
    })

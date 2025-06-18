from fastapi import FastAPI, File, UploadFile, Request, Depends, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from datetime import datetime
import shutil
import os
import uuid
from fastapi.responses import JSONResponse



from app.utils.vision_ocr import process_image_with_blocks, normalize_ocr_text, mask_sensitive_info_on_image

from app import crud, database

from app.utils.face_mascot_blur import mask_faces
#from app.utils.video import process_video
#from app.utils.ocr import process_document
from app.utils.toonify import run_dualstyle_toonify
from app.routers import upload, result
from app.routers import face_mask
#from app.dlp import app as dlp_app
#from app.dlp import inspect_text
from app.database import Base, engine
from app import models
from fastapi.middleware.cors import CORSMiddleware

#  초기 설정
Base.metadata.create_all(bind=engine)
app = FastAPI()


origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"],  # 모든 HTTP 헤더 허용
)

app.include_router(upload.router)
#app.include_router(ocr.router)
#app.include_router(masking.router)
app.include_router(result.router)
#app.include_router(mask_mascot.router)

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
    """
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
    """
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
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    mode: str = Form("mascot"),
    db: Session = Depends(database.get_db)
):
    assert mode in ["mascot", "blur", "toonify"], "Invalid mode"

    # 1. 파일 저장
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR_IMG, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uuid_part = filename.split("_")[0]
    processed_dir = os.path.join("static/processed", uuid_part)
    os.makedirs(processed_dir, exist_ok=True)
    processed_path = os.path.join(processed_dir, f"{mode}.jpg")

    try:
        # 2. 얼굴 마스킹 or 캐릭터화
        if mode in ["mascot", "blur"]:
            masked_path, meta, found = mask_faces(file_path, mode=mode)
        elif mode == "toonify":
            masked_path = run_dualstyle_toonify(file_path)
            meta = {"face": "stylized", "image": "toon", "text": "none"}
            found = True

        # 3. OCR 수행 및 텍스트 정규화
        _, extracted_text, ocr_blocks = process_image_with_blocks(masked_path)
        cleaned_text = normalize_ocr_text(extracted_text)

        for block in ocr_blocks:
            block["text"] = normalize_ocr_text(block["text"])

        # 4. 민감정보 감지 (mock): 이름, 전화번호, 주민번호 등 키워드 기반
        findings = [
            {"quote": block["text"], "bbox": block["bbox"]}
            for block in ocr_blocks
            if any(keyword in block["text"].lower() for keyword in ["name", "id", "phone", "email"])
        ]

        # 5. 민감정보 영역 마스킹
        mask_sensitive_info_on_image(
            image_path=masked_path,
            ocr_blocks=ocr_blocks,
            findings=findings,
            output_path=processed_path
        )

        # 6. DB 저장
        upload_record = crud.create_upload(
            db=db,
            filename=filename,
            upload_path=processed_path.replace("\\", "/"),
            text=cleaned_text,
            created_at=datetime.utcnow(),
            file_type="image"
        )
        crud.create_masking_result(
            db=db,
            upload_id=upload_record.id,
            path=processed_path.replace("\\", "/"),
            method={"face": mode, "text": "bbox_black" if findings else "none"}
        )

    except Exception as e:
        print(f"[ERROR] 이미지 처리 실패: {e}")
        processed_path = file_path
        cleaned_text = "이미지 처리 실패"
        findings = []
        found = False
        meta = {"error": str(e)}
        ocr_blocks = []

    print("[DEBUG] 전처리 전:", extracted_text)
    print("[DEBUG] 전처리 후:", cleaned_text)


    return JSONResponse(
        content={
            "img_path": "/" + processed_path.replace("\\", "/"),
            "text": cleaned_text,
            "mode": mode,
            "found": found,
            "findings": findings,
            "metadata": meta,
            "ocr_blocks": ocr_blocks,
            "uuid": uuid_part
        }
    )

"""
@app.post("/upload/image", response_class=HTMLResponse)
async def upload_image(request: Request, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR_IMG, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        masked_path = face_mask(file_path)
        extracted_text = "블러 또는 마스코트 오버레이  완료"
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
# 디즈니풍 캐릭터화 업로드
# ================================
@app.post("/upload/disney", response_class=HTMLResponse)
async def upload_disney_image(request: Request, file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR_IMG, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        toonified_path = run_dualstyle_disney(file_path)
        print(f"[INFO] 디즈니풍 변환 완료: {toonified_path}")
    except Exception as e:
        print(f"[ERROR] DualStyleGAN 실행 실패: {e}")
        toonified_path = file_path  # fallback

    return templates.TemplateResponse("image_upload.html", {
        "request": request,
        "img_path": "/" + toonified_path.replace("\\", "/"),
        "text": "디즈니풍 캐릭터화 완료",
        "findings": []
    })
"""
@app.get("/api/get-meta")
def get_masking_meta(image_url: str):
    # uuid 추출
    uuid_part = image_url.split("/")[-2]
    record = crud.get_upload_by_uuid(uuid_part)
    findings = crud.get_findings_by_upload_id(record.id)
    return {"findings": findings}


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

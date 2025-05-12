from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app import crud, schemas, database
import os, shutil, uuid
from uuid import UUID

router = APIRouter()

def get_upload_path(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1].lower()
    uid = str(uuid.uuid4())

    if ext in ["pdf", "doc", "docx"]:
        subdir = "document"
    elif ext in ["jpg", "jpeg", "png", "bmp", "gif"]:
        subdir = "image"
    elif ext in ["mp4", "avi", "mov", "mkv"]:
        subdir = "video"
    else:
        subdir = "etc"  

    save_dir = f"static/uploads/{subdir}"
    os.makedirs(save_dir, exist_ok=True)
    save_path = f"{save_dir}/{uid}_{file.filename}"
    return save_path, subdir

@router.post("/upload", response_model=schemas.UploadOut)
def upload_file(file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    path, file_type = get_upload_path(file)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = schemas.UploadCreate(
        file_name=file.filename,
        file_type=file_type,
        upload_path=path
    )
    return crud.create_upload(db, data)
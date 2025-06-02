# app/utils/image_mask.py

from google.cloud import vision
from google.oauth2 import service_account
import os
from PIL import Image
import io

credentials_path = os.getenv("GOOGLE_VISION_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(credentials_path)
client = vision.ImageAnnotatorClient(credentials=credentials)

def process_image_with_blocks(file_path: str):
    with open(file_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        return file_path, f"[❌ Vision API 오류: {response.error.message}]", []

    annotations = response.text_annotations
    if not annotations:
        return file_path, "[⚠️ OCR 결과 없음]", []

    extracted_text = annotations[0].description.strip()
    ocr_blocks = []

    for ann in annotations[1:]:  # 첫 번째는 전체 텍스트
        box = ann.bounding_poly.vertices
        x1 = min(v.x for v in box)
        y1 = min(v.y for v in box)
        x2 = max(v.x for v in box)
        y2 = max(v.y for v in box)

        ocr_blocks.append({
            "text": ann.description,
            "bbox": (x1, y1, x2, y2)
        })

    return file_path, extracted_text, ocr_blocks

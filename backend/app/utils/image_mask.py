# app/utils/image_mask.py

from google.cloud import vision
from google.oauth2 import service_account
import os
from PIL import Image, ImageDraw
import io
import cv2
import numpy as np

credentials_path = os.getenv("GOOGLE_VISION_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(credentials_path)
client = vision.ImageAnnotatorClient(credentials=credentials)


import re

def normalize_ocr_text(text: str) -> str:
    text = text.replace("\n", " ")
    text = re.sub(r'\s+', ' ', text).strip()

    # 전화번호 보정
    text = re.sub(r'\b(01[016789])(\d{3,4})(\d{4})\b', r'\1-\2-\3', text)

    # 주민등록번호 보정
    text = re.sub(r'\b(\d{6})(\d{7})\b', r'\1-\2', text)

    # 이메일 보정
    text = re.sub(r'\b([\w\.-]+)\s*[@\s]?\s*([a-z]+\.[a-z]{2,3})\b', r'\1@\2', text)

    return text

def process_image_with_blocks(file_path: str,  findings: list = [], output_path: str = None):
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

    if findings:
        image_pil = Image.open(file_path)
        draw = ImageDraw.Draw(image_pil)

        for finding in findings:
            quote = finding.get("quote")
            for block in ocr_blocks:
                if quote in block["text"]:
                    x1, y1, x2, y2 = block["bbox"]
                    draw.rectangle([x1, y1, x2, y2], fill="black")

        # 저장 경로 설정
        if not output_path:
            output_path = file_path.replace("uploads", "processed")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        image_pil.save(output_path)

    #return output_path, extracted_text, ocr_blocks
    return output_path , extracted_text, ocr_blocks

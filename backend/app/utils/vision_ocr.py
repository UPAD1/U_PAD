import os
import re
from typing import List, Tuple, Dict
from google.cloud import vision
from google.oauth2 import service_account
from PIL import Image, ImageDraw

# ✅ 환경 변수에서 인증 정보 읽기
credentials_path = os.getenv("GOOGLE_VISION_CREDENTIALS")
if not credentials_path or not os.path.isfile(credentials_path):
    raise EnvironmentError("GOOGLE_VISION_CREDENTIALS 경로가 올바르지 않거나 파일이 존재하지 않습니다.")

credentials = service_account.Credentials.from_service_account_file(credentials_path)
client = vision.ImageAnnotatorClient(credentials=credentials)


# ✅ 텍스트 정규화 함수
def normalize_ocr_text(text: str) -> str:
    """
    OCR 결과로 얻은 텍스트를 정제 및 보정하여 민감정보 패턴을 통일
    """
    text = text.replace("\n", " ")
    text = re.sub(r'\s+', ' ', text).strip()

    # 전화번호 보정 (예: 01012345678 → 010-1234-5678)
    text = re.sub(r'\b(01[016789])(\d{3,4})(\d{4})\b', r'\1-\2-\3', text)

    # 주민등록번호 보정 (예: 1234561234567 → 123456-1234567)
    text = re.sub(r'\b(\d{6})(\d{7})\b', r'\1-\2', text)

    # 이메일 보정 (예: hello @ naver.com → hello@naver.com)
    text = re.sub(r'\b([\w\.-]+)\s*[@\s]?\s*([a-z]+\.[a-z]{2,3})\b', r'\1@\2', text)

    return text


# ✅ 전체 텍스트만 추출
def extract_text_from_image_gvision(image_path: str) -> str:
    """
    이미지에서 전체 텍스트만 단일 문자열로 추출
    """
    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        raise RuntimeError(f"[❌ Vision API 오류] {response.error.message}")

    texts = response.text_annotations
    if not texts:
        return "[⚠️ OCR 결과 없음]"

    return texts[0].description.strip()


# ✅ OCR + 블록 정보 추출
def process_image_with_blocks(file_path: str) -> Tuple[str, str, List[Dict]]:
    """
    이미지에서 텍스트 및 각 OCR 블록의 좌표와 텍스트 추출
    """
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


# ✅ 민감정보 블록 마스킹 처리
def mask_sensitive_info_on_image(
    image_path: str,
    ocr_blocks: List[Dict],
    findings: List[Dict],
    output_path: str
) -> str:
    """
    OCR 블록 중 민감정보(`findings`)와 일치하는 텍스트 영역을 블랙박스로 마스킹
    """
    image = Image.open(image_path).convert("RGB")
    draw = ImageDraw.Draw(image)

    for finding in findings:
        quote = finding.get("quote")
        if not quote:
            continue
        for block in ocr_blocks:
            if quote in block["text"]:
                x1, y1, x2, y2 = block["bbox"]
                draw.rectangle([x1, y1, x2, y2], fill="black")

    image.save(output_path)
    return output_path

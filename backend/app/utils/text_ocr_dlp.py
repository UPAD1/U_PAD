import os
import fitz  # PyMuPDF
import docx2txt
from app.dlp import inspect_text
from app.utils.vision_ocr import extract_text_from_image_gvision

import os
import uuid
import re
import json
from pathlib import Path
from typing import Dict
from google.cloud import dlp_v2
from dotenv import load_dotenv

from PyPDF2 import PdfReader
import docx


DLP_CLIENT = dlp_v2.DlpServiceClient()
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
OUTPUT_DIR = "static/output"
MASKED_OUTPUT_DIR = "static/txt_output"
os.makedirs(MASKED_OUTPUT_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
def extract_text_from_document(file_path: str, ext: str) -> str:
    """
    파일 확장자에 따라 문서에서 텍스트 추출
    - PDF: 텍스트 추출, 없으면 OCR
    - TXT: 그대로 읽기
    - DOCX: docx2txt로 추출
    """
    extracted_text = ""

    if ext == "pdf":
        doc = fitz.open(file_path)
        for page in doc:
            extracted_text += page.get_text()
        doc.close()

        # 텍스트 없을 경우 OCR
        if not extracted_text.strip():
            img_path = f"{file_path}_page1.png"
            page = fitz.open(file_path)[0]
            pix = page.get_pixmap()
            pix.save(img_path)
            extracted_text = extract_text_from_image_gvision(img_path)

    elif ext == "txt":
        with open(file_path, "r", encoding="utf-8") as f:
            extracted_text = f.read()

    elif ext in ["docx"]:
        extracted_text = docx2txt.process(file_path)

    else:
        extracted_text = "[지원하지 않는 문서 형식입니다.]"

    return extracted_text


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def extract_text_from_docx(file_path: str) -> str:
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
    
def normalize_for_dlp(text: str) -> str:
    # 주민번호: 011005-4323518 → 0110054323518
    text = re.sub(r"(\d{6})-(\d{7})", r"\1\2", text)

    # 전화번호: 010-1234-5678 → 01012345678
    text = re.sub(r"(\d{3})-(\d{3,4})-(\d{4})", r"\1\2\3", text)

    return text


def detect_sensitive_info(text: str) -> list:
    parent = f"projects/{PROJECT_ID}"
    normalized_text = normalize_for_dlp(text)

    info_types = [
        {"name": "KOREA_RRN"},
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},
        {"name": "PERSON_NAME"},
        {"name": "LOCATION"},
        {"name": "EMAIL_ADDRESS"},
        {"name": "PHONE_NUMBER"},
        {"name": "CREDIT_CARD_NUMBER"},
    ]

    response = DLP_CLIENT.inspect_content(
        request={
            "parent": parent,
            "item": {"value": normalized_text},
            "inspect_config": {
                "info_types": info_types,
                "include_quote": True,
                "min_likelihood": "POSSIBLE"
            }
        }
    )

    findings = []
    for f in response.result.findings:
        findings.append({
            "info_type": f.info_type.name,
            "quote": f.quote,
            "likelihood": f.likelihood.name
        })
    # ✅ 주민등록번호 직접 정규식 탐지 (보완)
    rrn_pattern = re.compile(r"\b\d{6}-\d{7}\b")
    rrns = rrn_pattern.findall(text)
    for rrn in rrns:
        if rrn not in [f["quote"] for f in findings]:
            findings.append({
                "info_type": "KOREA_RRN",
                "quote": rrn,
                "likelihood": "LIKELY"
            })
    return findings


def mask_sensitive_text(text: str, findings: list) -> str:
    for f in findings:
        quote = f["quote"]
        info_type = f["info_type"]

        # 주민번호/전화번호의 경우 하이픈을 포함한 원본에서 찾기 위해 변형된 패턴으로 대체
        quote_variants = [quote]
        if info_type in ["KOREA_RRN", "PHONE_NUMBER"]:
            if len(quote) in [13, 11]:  # 주민번호 13자리, 전화번호 10~11자리
                if info_type == "KOREA_RRN":
                    quote_variants.append(quote[:6] + "-" + quote[6:])
                elif info_type == "PHONE_NUMBER":
                    if len(quote) == 11:
                        quote_variants.append(quote[:3] + "-" + quote[3:7] + "-" + quote[7:])
                    elif len(quote) == 10:
                        quote_variants.append(quote[:3] + "-" + quote[3:6] + "-" + quote[6:])

        for q in quote_variants:
            if q in text:
                if info_type == "PERSON_NAME" and len(q) >= 2:
                    masked = q[0] + "*" + q[2:] if len(q) > 2 else q[0] + "*"
                elif info_type == "LOCATION":
                    masked = q.split(" ")[0] + " ***"
                elif info_type == "EMAIL_ADDRESS":
                    masked = "***@***"
                elif info_type == "PHONE_NUMBER":
                    masked = q[:3] + "-****-" + q[-4:]
                elif info_type == "KOREA_RRN":
                    masked = q[:6] + "-*******"
                else:
                    masked = "*" * len(q)
                text = text.replace(q, masked)
                break

    return text


    return text
def process_document_with_dlp(file_path: str) -> Dict:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        text = extract_text_from_docx(file_path)
    elif ext == ".txt":
        text = extract_text_from_txt(file_path)
    else:
        raise ValueError(f"지원되지 않는 문서 형식: {ext}")

    findings = detect_sensitive_info(text)
    masked_text = mask_sensitive_text(text, findings)

    uuid_part = Path(file_path).stem.split("_")[0]
    json_path = os.path.join(MASKED_OUTPUT_DIR, f"{uuid_part}_doc.json")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "filename": Path(file_path).name,
            "text": masked_text,
            "findings": findings,
            "uuid": uuid_part
        }, f, ensure_ascii=False, indent=2)

    return {
        "text": masked_text,
        "findings": findings,
        "json_path": json_path
    }

"""def process_document_with_dlp(file_path: str) -> Dict:
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        text = extract_text_from_docx(file_path)
    elif ext == ".txt":
        text = extract_text_from_txt(file_path)
    else:
        raise ValueError(f"지원되지 않는 문서 형식: {ext}")

    findings = detect_sensitive_info(text)

    uuid_part = Path(file_path).stem.split("_")[0]
    json_path = os.path.join(OUTPUT_DIR, f"{uuid_part}_doc.json")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "filename": Path(file_path).name,
            "text": text,
            "findings": findings,
            "uuid": uuid_part
        }, f, ensure_ascii=False, indent=2)

    return {
        "text": text,
        "findings": findings,
        "json_path": json_path
    }"""


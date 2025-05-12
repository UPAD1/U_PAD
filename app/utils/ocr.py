import os
import fitz  # PyMuPDF
import uuid
import tempfile
import subprocess
import numpy as np
import cv2
from pptx import Presentation
import docx
from paddleocr import PaddleOCR

ocr_model = PaddleOCR(use_angle_cls=True, lang='korean')  # PaddleOCR 초기화

def is_scanned_pdf(page):
    return not page.get_text().strip()

def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        text = "\n".join(p.text for p in doc.paragraphs)
        return text if text.strip() else "[⚠️ DOCX에서 텍스트를 추출하지 못했습니다.]"
    except Exception as e:
        return f"[❌ DOCX 처리 오류: {e}]"

def extract_text_from_pptx(file_path):
    try:
        prs = Presentation(file_path)
        text_runs = []
        for slide in prs.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text_runs.append(shape.text)
        return "\n".join(text_runs)
    except Exception as e:
        return f"[❌ PPTX 처리 오류: {e}]"

def extract_text_from_hwp(file_path):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".txt") as tmp:
            subprocess.run(['hwp5txt', file_path], stdout=tmp, stderr=subprocess.DEVNULL)
        with open(tmp.name, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"[❌ HWP 처리 오류: {e}]"

def process_document(file_path: str):
    output_dir = "static/uploads/document"
    os.makedirs(output_dir, exist_ok=True)
    result_image_paths = []
    output_text = ""
    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext == '.pdf':
            doc = fitz.open(file_path)
            for i in range(len(doc)):
                page = doc.load_page(i)
                if is_scanned_pdf(page):
                    pix = page.get_pixmap(dpi=300)
                    img_path = os.path.join(output_dir, f"{uuid.uuid4().hex}_page{i}.jpg")
                    pix.save(img_path)
                    result_image_paths.append(img_path)

                    image = cv2.imread(img_path)
                    if image is None:
                        raise ValueError("이미지를 불러올 수 없습니다.")

                    ocr_result = ocr_model.ocr(image, cls=True)
                    extracted_text = "\n".join([res[1][0] for res in ocr_result[0]]) if ocr_result else "[⚠️ OCR 실패]"
                else:
                    extracted_text = page.get_text()

                output_text += f"\n\n--- Page {i+1} ---\n{extracted_text.strip() or '[⚠️ 텍스트 없음]'}"

        elif ext == '.docx':
            output_text = extract_text_from_docx(file_path)
        elif ext == '.pptx':
            output_text = extract_text_from_pptx(file_path)
        elif ext == '.hwp':
            output_text = extract_text_from_hwp(file_path)
        else:
            output_text = "⚠️ 지원하지 않는 파일 형식입니다."

    except Exception as e:
        output_text = f"[❌ 문서 전체 처리 실패: {e}]"

    return result_image_paths, output_text

# image와 video 위한 ocr 추가가
def extract_text_from_image(image: np.ndarray) -> str:
    try:
        result = ocr_model.ocr(image, cls=True)
        return "\n".join([res[1][0] for res in result[0]]) if result else "[⚠️ OCR 실패]"
    except Exception as e:
        return f"[❌ 이미지 OCR 실패: {e}]"

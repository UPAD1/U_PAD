import cv2
from paddleocr import PaddleOCR
from app.utils.face import mask_sensitive_info
from app.utils.ocr import extract_text_from_image


# PaddleOCR 초기화
ocr_engine = PaddleOCR(use_angle_cls=True, lang='korean')

def process_image(file_path: str):
    # 이미지 로드
    image = cv2.imread(file_path)
    if image is None:
        return file_path, "[이미지 로딩 실패]"

    # OCR 수행
    result = ocr_engine.ocr(file_path, cls=True)
    extracted_text = ""
    for line in result:
        for word_info in line:
            extracted_text += word_info[1][0] + "\n"

    # 얼굴 마스킹
    masked_path, method, face_found = mask_sensitive_info(file_path)

    # ✅ 얼굴 마스킹 정보 출력
    print(f"[INFO] 얼굴 탐지됨: {face_found} / 마스킹 이미지 경로: {masked_path}")
    print(f"[INFO] 마스킹 방법: {method}")

    return masked_path, extracted_text
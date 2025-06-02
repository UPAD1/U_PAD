import cv2
from paddleocr import PaddleOCR
from app.utils.face import mask_sensitive_info
from app.utils.ocr import extract_text_from_image


# PaddleOCR 초기화
ocr_engine = PaddleOCR(use_angle_cls=True, lang='korean')

def process_image(file_path: str):
    image = cv2.imread(file_path)
    if image is None:
        return file_path, "[이미지 로딩 실패]"

    # 이미지 해상도 확대 (너무 작을 경우)
    h, w = image.shape[:2]
    if max(h, w) < 1000:
        scale = 1000 / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)))
        print(f"[INFO] 이미지 확대 적용됨: ({w}, {h}) → {image.shape[1]}, {image.shape[0]}")
        cv2.imwrite("debug_resized.jpg", image)

    # OCR
    result = ocr_engine.ocr(file_path, cls=True)
    extracted_text = ""

    if result:
        for line in result:
            for word_info in line:
                extracted_text += word_info[1][0] + "\n"
    else:
        print("[WARN] PaddleOCR에서 텍스트 감지 실패")
        extracted_text = "[텍스트 없음]"

    # 얼굴 마스코트 처리
    from app.utils.face import mask_sensitive_info
    try:
        masked_path, _, face_found = mask_sensitive_info(file_path)
        print(f"[INFO] 얼굴 탐지됨: {face_found} / 마스킹 이미지 경로: {masked_path}")
    except Exception as e:
        print(f"[ERROR] 마스코트 처리 실패: {e}")
        masked_path = file_path

    return masked_path, extracted_text

import cv2
from app.utils.vision_ocr import extract_text_from_image_gvision


def process_image(file_path: str):
    import cv2
    from app.utils.face import mask_sensitive_info

    image = cv2.imread(file_path)
    if image is None:
        return file_path, "[이미지 로딩 실패]"

    extracted_text = extract_text_from_image_gvision(file_path)

    masked_path, method, face_found = mask_sensitive_info(file_path)
    print(f"[INFO] 얼굴 탐지됨: {face_found} / 마스킹 이미지 경로: {masked_path}")
    print(f"[INFO] 마스킹 방법: {method}")

    return masked_path, extracted_text
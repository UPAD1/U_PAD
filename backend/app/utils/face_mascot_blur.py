import cv2
from pathlib import Path
import uuid
import numpy as np
import os
import tempfile
from PIL import Image
from ultralytics import YOLO
from PIL import ImageOps
#from deepface import DeepFace
#from app.utils.face_mascot import create_mascot_image

YOLO_MODEL_PATH = "models/face_yolov8m.pt"
MASK_DIR = "static/mask"
os.makedirs(MASK_DIR, exist_ok=True)

if not os.path.exists(YOLO_MODEL_PATH):
    raise FileNotFoundError(f"YOLO 모델이 존재하지 않습니다: {YOLO_MODEL_PATH}")
yolo_model = YOLO(YOLO_MODEL_PATH)

def load_image(path: str):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise ValueError(f"이미지를 열 수 없습니다: {path}")

# 이미지가 4채널(RGBA)인 경우 3채널(RGB)로 변환
    if img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    return img

def map_emotion_to_expression(emotion: str) -> str:
    mapping = {
        "happy": "smile",
        "sad": "neutral",
        "angry": "angry",
        "surprise": "smile",
        "neutral": "neutral",
        "fear": "neutral",
        "disgust": "angry"
    }
    return mapping.get(emotion, "neutral")

# 감정별 오프셋 설정 (원한다면 더 조정 가능)
EXPRESSION_OFFSET = {
    "smile": (0, -10),    # 위로 10px 이동
    "angry": (0, -5),
    "neutral": (0, 0),
}

def overlay_generated_face(image, gen_face_pil, bbox, expression ="neutral"):
    x1, y1, x2, y2 = bbox
    face_w, face_h = x2 - x1, y2 - y1
    
    # 1. 여백 제거 (투명 여백 포함)
    gen_face_pil = ImageOps.crop(gen_face_pil)

    gen_face_resized = gen_face_pil.resize((face_w, face_h))
    gen_np = np.array(gen_face_resized)
    """
    if gen_np.shape[2] == 4:
        alpha = gen_np[:, :, 3] / 255.0
        fg_rgb = gen_np[:, :, :3]
        bg_rgb = image[y1:y2, x1:x2]

        blended = (fg_rgb * alpha[..., None] + bg_rgb * (1 - alpha[..., None])).astype(np.uint8)
        image[y1:y2, x1:x2] = blended
    else:
        gen_np = cv2.cvtColor(gen_np, cv2.COLOR_RGB2BGR)
        image[y1:y2, x1:x2] = gen_np
    """
# 4. 알파 블렌딩
    if gen_np.shape[2] == 4:
        alpha = gen_np[:, :, 3] / 255.0
        fg_rgb = gen_np[:, :, :3]
        bg_rgb = image[y1:y2, x1:x2]
        blended = (fg_rgb * alpha[..., None] + bg_rgb * (1 - alpha[..., None])).astype(np.uint8)
        image[y1:y2, x1:x2] = blended
    else:
        image[y1:y2, x1:x2] = cv2.cvtColor(gen_np, cv2.COLOR_RGB2BGR)

    # ✅ Bounding box 표시 (초록색 사각형)
    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), thickness=2)

    return image




 

def _save_output(original_path: str, img, mode: str = "mascot"):
    """
    원본 경로로부터 UUID를 추출하여 static/processed/<uuid>/<mode>.jpg 형식으로 저장
    mode: "blur" 또는 "mascot"
    """
    original_path = Path(original_path)
    filename = original_path.name

    # UUID 추출
    uid = filename.split("_")[0]  # <uuid>_original.jpg 형식이라고 가정

    # 저장 경로 구성
    save_dir = Path("static/processed") / uid
    save_dir.mkdir(parents=True, exist_ok=True)

    # 저장 파일명: mascot.jpg 또는 blur.jpg
    save_path = save_dir / f"{mode}.jpg"

    # 이미지 저장
    cv2.imwrite(str(save_path), img)
    return str(save_path)


def map_expression_to_mascot_file(expression: str) -> str:
    mapping = {
        "smile": "rori2.png",        # 또는 smile.png
        "angry": "angry.png",
        "neutral": "neutral.png"
    }
    return mapping.get(expression, "neutral.png")

def mask_faces(image_path: str, mode: str = "mascot"):
    """
    얼굴 탐지 후 비식별 처리 (마스코트 오버레이 또는 블러)
    mode: "mascot" or "blur"
    """
    assert mode in ["mascot", "blur"], "mode must be 'mascot' or 'blur'"

    image = load_image(image_path)
    h, w = image.shape[:2]

    # Resize if image too small
    max_size = 640
    if max(h, w) < max_size:
        scale = max_size / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)))
        h, w = image.shape[:2]

    results = yolo_model(image)
    detections_raw = results[0].boxes.data

    if detections_raw is None or len(detections_raw) == 0:
        return _save_output(image_path, image), {"face": "none", "image": "none", "text": "none"}, False, []

    detections = detections_raw.cpu().numpy()
    face_found = False
    face_bboxes = [] 

    for i, det in enumerate(detections):
        if len(det) < 4:
            continue
        if det.shape[0] < 4:
            continue  # bbox 정보 부족 → 무시
        x1, y1, x2, y2 = det[:4].astype(int)
        face_bboxes.append((x1, y1, x2, y2))

        face_crop = image[y1:y2, x1:x2]
        if face_crop.size == 0:
            continue

        if mode == "blur":
            # Apply Gaussian Blur
            blurred = cv2.GaussianBlur(face_crop, (99, 99), 30)
            image[y1:y2, x1:x2] = blurred

        elif mode == "mascot":
            # Optional: 감정 분석 기반으로 표정 선택
            try:
                face_crop_resized = cv2.resize(face_crop, (224, 224))
                with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
                    temp_face_path = tmp_file.name
                    cv2.imwrite(temp_face_path, face_crop_resized)

                analysis = DeepFace.analyze(
                    img_path=temp_face_path,
                    actions=["emotion"],
                    detector_backend="opencv",
                    enforce_detection=False
                )
                emotion = analysis[0].get("dominant_emotion", "neutral")
                os.remove(temp_face_path)
            except:
                emotion = "neutral"

            expression = map_emotion_to_expression(emotion)
            mascot_filename = map_expression_to_mascot_file(expression)
            save_path = os.path.join(MASK_DIR, mascot_filename)
            gen_face_pil = Image.open(save_path)
            image = overlay_generated_face(image, gen_face_pil, (x1, y1, x2, y2))

        face_found = True

    output_path = _save_output(image_path, image, mode=mode)
    return output_path, {"face": mode, "image": mode, "text": "none"}, face_found, face_bboxes

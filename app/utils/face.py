# face.py
import cv2
import numpy as np
import os
from deepface import DeepFace
from ultralytics import YOLO
import tempfile
from app.utils.face_mascot import create_mascot_image
from PIL import Image

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

def overlay_generated_face(image, gen_face_pil, bbox):
    x1, y1, x2, y2 = bbox
    face_w, face_h = x2 - x1, y2 - y1

    gen_face_resized = gen_face_pil.resize((face_w, face_h))
    gen_np = np.array(gen_face_resized)
    if gen_np.shape[2] == 3:
        gen_np = cv2.cvtColor(gen_np, cv2.COLOR_RGB2BGR)

    image[y1:y2, x1:x2] = gen_np
    return image

def mask_sensitive_info(image_path: str):
    image = load_image(image_path)
    h, w = image.shape[:2]

    max_size = 640
    if max(h, w) < max_size:
        scale = max_size / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)))
        h, w = image.shape[:2]

    results = yolo_model(image)
    detections_raw = results[0].boxes.data

    if detections_raw is None or len(detections_raw) == 0:
        return _save_output(image_path, image), {"face": "none", "image": "none", "text": "none"}, False

    detections = detections_raw.cpu().numpy()
    face_found = False

    for i, det in enumerate(detections):
        if len(det) < 4:
            continue

        x1, y1, x2, y2 = det[:4].astype(int)
        face_crop = image[y1:y2, x1:x2]
        if face_crop.size == 0:
            continue

        face_crop_resized = cv2.resize(face_crop, (224, 224))
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
            temp_face_path = tmp_file.name
            cv2.imwrite(temp_face_path, face_crop_resized)

        try:
            analysis = DeepFace.analyze(
                img_path=temp_face_path,
                actions=["emotion"],
                detector_backend="opencv",
                enforce_detection=False
            )
            emotion = analysis[0].get("dominant_emotion", "neutral")
        except Exception as e:
            emotion = "neutral"

        os.remove(temp_face_path)

        save_path = os.path.join(MASK_DIR, f"gen_face_{i}.png")
        create_mascot_image(save_path, seed=42 + i)
        gen_face_pil = Image.open(save_path)

        image = overlay_generated_face(image, gen_face_pil, (x1, y1, x2, y2))
        face_found = True

    output_path = _save_output(image_path, image)
    return output_path, {"face": "generated", "image": "overlay", "text": "none"}, face_found

def _save_output(original_path: str, img):
    base, ext = os.path.splitext(original_path)
    output_path = base + "_masked" + ext
    cv2.imwrite(output_path, img)
    return output_path

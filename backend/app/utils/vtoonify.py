import os
import cv2
import uuid
import time
import subprocess
import numpy as np
from pathlib import Path
from ultralytics import YOLO

# YOLO 모델 경로
YOLO_MODEL_PATH = "models/face_yolov8m.pt"
yolo_model = YOLO(YOLO_MODEL_PATH)

# 최신 파일 찾기
def get_latest_file(directory: Path, ext=".jpg") -> Path:
    jpg_files = list(directory.glob(f"*{ext}"))
    if not jpg_files:
        raise FileNotFoundError("output 디렉토리에 .jpg 파일이 없습니다.")
    return max(jpg_files, key=lambda f: f.stat().st_mtime)

# 이미지 선명하게
def sharpen(img):
    kernel = np.array([[0, -1, 0],
                       [-1, 5.2, -1],
                       [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

# 메인 실행 함수
def run_vtoonify_d(original_path: str):
    original_path = Path(original_path)
    img = cv2.imread(str(original_path))
    if img is None:
        from PIL import Image
        img = Image.open(str(original_path)).convert("RGB")
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # 얼굴 감지
    results = yolo_model(img)
    detections = results[0].boxes.data.cpu().numpy()
    if detections is None or len(detections) == 0:
        raise RuntimeError("얼굴이 감지되지 않았습니다.")

    uuid_part = uuid.uuid4().hex
    output_img = img.copy()

    for i, det in enumerate(detections):
        x1, y1, x2, y2 = det[:4].astype(int)
        face_crop = img[y1:y2, x1:x2]
        if face_crop.size == 0:
            continue

        # 1. 얼굴 crop 저장 (절대 경로)
        face_crop_path = Path(f"VToonify/data/face_crop_{uuid_part}.jpg").resolve()
        face_crop_path.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(face_crop_path), face_crop)

        # 저장 완료 확인
        for _ in range(10):
            if face_crop_path.exists():
                break
            time.sleep(0.1)
        else:
            raise RuntimeError(f"얼굴 이미지 저장 실패: {face_crop_path}")

        # 2. style_transfer.py 실행
        try:
            subprocess.run(
                [
                    "python3", "style_transfer.py",
                    "--content", str(face_crop_path),
                    "--style_id", "10",
                    "--scale_image",
                    "--style_degree", "0.8",
                    "--ckpt", "./checkpoint/VToonify/models/vtoonify_d_cartoon/vtoonify_s_d.pt",
                    "--exstyle_path", "./checkpoint/VToonify/models/vtoonify_d_cartoon/exstyle_code.npy",
                    "--style_encoder_path", "./checkpoint/VToonify/models/encoder.pt",
                    "--faceparsing_path", "./checkpoint/VToonify/models/faceparsing.pth"
                ],
                cwd="VToonify",
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            print("[stderr]", e.stderr)
            raise RuntimeError(f"VToonify-D 실행 실패: {e.stderr}")

        # 3. 결과 이미지 로드
        output_dir = Path("VToonify/output")
        toonified_path = get_latest_file(output_dir)
        toonified_img = cv2.imread(str(toonified_path))
        if toonified_img is None or toonified_img.size == 0:
            raise RuntimeError(f"toonified 얼굴을 읽을 수 없습니다: {toonified_path}")

        # 4. 후처리 및 원본 얼굴 교체
        toonified_img = sharpen(toonified_img)
        resized_face = cv2.resize(toonified_img, (x2 - x1, y2 - y1))
        output_img[y1:y2, x1:x2] = resized_face

    # 5. 최종 결과 저장
    save_dir = Path("static/processed") / uuid_part
    save_dir.mkdir(parents=True, exist_ok=True)
    final_path = save_dir / "toon.jpg"
    cv2.imwrite(str(final_path), output_img)

    return final_path


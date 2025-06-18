import shutil
import subprocess
from pathlib import Path
import os
import cv2
import uuid
import numpy as np
from ultralytics import YOLO

YOLO_MODEL_PATH = "models/face_yolov8m.pt"
yolo_model = YOLO(YOLO_MODEL_PATH)

def get_latest_file(directory: Path, ext=".jpg") -> Path:
    jpg_files = list(directory.glob(f"*{ext}"))
    if not jpg_files:
        raise FileNotFoundError("output 디렉토리에 .jpg 파일이 없습니다.")
    return max(jpg_files, key=lambda f: f.stat().st_mtime)

def sharpen(img):
    kernel = np.array([[0, -1, 0],
                       [-1, 5.2, -1],
                       [0, -1, 0]])
    return cv2.filter2D(img, -1, kernel)

def run_dualstyle_toonify(original_path: str):
    original_path = Path(original_path)
    img = cv2.imread(str(original_path))
    if img is None:
        raise ValueError(f"이미지를 열 수 없습니다: {original_path}")

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

        # 1. 얼굴 crop 저장
        face_crop_path = Path(f"DualStyleGAN/data/content/face_crop_{uuid_part}.jpg")
        cv2.imwrite(str(face_crop_path), face_crop)

        # 2. style_transfer.py 실행
        try:
            subprocess.run(
                [
                    "python", "style_transfer.py",
                    "--style", "pixar",
                    "--style_id", "10",
                    "--weight",
                    *["1"]*18,
                    "--name", f"toonified_{uuid_part}"
                ],
                cwd="DualStyleGAN",
                check=True,
                capture_output=True,
                text=True
            )
        except subprocess.CalledProcessError as e:
            print("[stderr]", e.stderr)
            raise RuntimeError(f"DualStyleGAN 실행 실패: {e.stderr}")

        # 3. 결과 자동 탐색
        output_dir = Path("DualStyleGAN/output")
        toonified_path = get_latest_file(output_dir)
        toonified_img = cv2.imread(str(toonified_path))
        if toonified_img is None:
            raise RuntimeError(f"toonified 얼굴을 읽을 수 없습니다: {toonified_path}")

        # 4. 선명하게 만들고 크기 맞춤
        toonified_img = sharpen(toonified_img)
        resized_face = cv2.resize(toonified_img, (x2 - x1, y2 - y1))

        # 5. 원본에 붙이기
        output_img[y1:y2, x1:x2] = resized_face

    # 6. 결과 저장
    save_dir = Path("static/processed") / uuid_part
    save_dir.mkdir(parents=True, exist_ok=True)
    final_path = save_dir / "toon.jpg"
    cv2.imwrite(str(final_path), output_img)

    return str(final_path)

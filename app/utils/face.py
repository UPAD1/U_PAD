import cv2
import os
import numpy as np

# 모델 로딩
MODEL_PATH = "models/res10_300x300_ssd_iter_140000.caffemodel"
CONFIG_PATH = "models/deploy.prototxt"
net = cv2.dnn.readNetFromCaffe(CONFIG_PATH, MODEL_PATH)

# 마스코트 이미지 (RGBA)
MASCOT_PATH = "static/mask/mascot.png"
mascot_img = cv2.imread(MASCOT_PATH, cv2.IMREAD_UNCHANGED)  # RGBA

def overlay_mascot(image, mascot, x, y, w, h):
    """얼굴 위치(x,y,w,h)에 맞춰 마스코트를 알파 블렌딩"""
    resized = cv2.resize(mascot, (w, h), interpolation=cv2.INTER_AREA)

    if resized.shape[2] != 4:
        raise ValueError("마스코트 이미지에는 알파 채널이 필요합니다 (RGBA).")

    alpha = resized[:, :, 3] / 255.0
    for c in range(3):  # RGB 채널만
        image[y:y+h, x:x+w, c] = (
            alpha * resized[:, :, c] + (1 - alpha) * image[y:y+h, x:x+w, c]
        )

    return image

def blur_faces(image):
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), (104, 177, 123))
    net.setInput(blob)
    detections = net.forward()
    face_count = 0

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.5:
            face_count += 1
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            x1, y1, x2, y2 = box.astype(int)

            # 얼굴 중심 좌표
            face_w = x2 - x1
            face_h = y2 - y1

            # 마스코트 비율에 맞게 얼굴보다 작게 조절 (예: 80%)
            scale = 1.2
            new_w = int(face_w * scale)
            new_h = int(face_h * scale)
            resized_mascot = cv2.resize(mascot_img, (new_w, new_h), interpolation=cv2.INTER_AREA)

            # 좌상단 좌표 보정 (중앙 정렬)
            start_x = x1 + (face_w - new_w) // 2
            start_y = y1 + (face_h - new_h) // 2

            # 알파 채널 처리
            if resized_mascot.shape[2] == 4:
                alpha_s = resized_mascot[:, :, 3] / 255.0
                alpha_l = 1.0 - alpha_s

                for c in range(3):  # BGR
                    image[start_y:start_y+new_h, start_x:start_x+new_w, c] = (
                        alpha_s * resized_mascot[:, :, c] +
                        alpha_l * image[start_y:start_y+new_h, start_x:start_x+new_w, c]
                    )
            else:
                image[start_y:start_y+new_h, start_x:start_x+new_w] = resized_mascot

    return image, face_count > 0

def mask_sensitive_info(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"이미지를 열 수 없습니다: {image_path}")

    masked_image, face_found = blur_faces(image)

    base, ext = os.path.splitext(image_path)
    output_path = base + "_masked" + ext
    cv2.imwrite(output_path, masked_image)

    method = {
        "face": "mascot" if face_found else "none",
        "image": "overlay",
        "text": "none"
    }

    return output_path, method, face_found



'''import cv2
import os

# 모델 로딩 (최초 1번만)
MODEL_PATH = "models/res10_300x300_ssd_iter_140000.caffemodel"
CONFIG_PATH = "models/deploy.prototxt"
net = cv2.dnn.readNetFromCaffe(CONFIG_PATH, MODEL_PATH)

# 마스코트 이미지 미리 로딩 (PNG 투명 배경 추천)
MASCOT_PATH = "static/mask/mascot.png"
mascot_img = cv2.imread(MASCOT_PATH, cv2.IMREAD_UNCHANGED)  # 투명 배경 유지

def blur_faces(image):
    """얼굴을 탐지해서 우리 학교 마스코트로 마스킹 처리."""
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    face_count = 0

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.5:
            face_count += 1
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            (x1, y1, x2, y2) = box.astype("int")

            face_w = x2 - x1
            face_h = y2 - y1

            if face_w > 0 and face_h > 0:
                resized_mascot = cv2.resize(mascot_img, (face_w, face_h))

                # 알파 채널 (투명도) 처리
                if resized_mascot.shape[2] == 4:  # RGBA라면
                    alpha_s = resized_mascot[:, :, 3] / 255.0
                    alpha_l = 1.0 - alpha_s

                    for c in range(0, 3):
                        image[y1:y2, x1:x2, c] = (alpha_s * resized_mascot[:, :, c] +
                                                 alpha_l * image[y1:y2, x1:x2, c])
                else:
                    # 그냥 RGB일 경우
                    image[y1:y2, x1:x2] = resized_mascot
    
    print(f"[INFO] 얼굴 후보 개수: {detections.shape[2]}")
    print(f"[INFO] 이미지 크기: {image.shape}")
    print(f"[INFO] 실제 마스코트 마스킹된 얼굴 수: {face_count}")
    if face_count == 0:
        print("[WARNING] 탐지된 얼굴 없음.")

    return image, face_count >0

def mask_sensitive_info(image_path: str):
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError(f"이미지를 열 수 없습니다: {image_path}")

    masked_image, face_found = blur_faces(image)

    # 저장 경로
    base, ext = os.path.splitext(image_path)
    output_path = base + "_masked" + ext
    cv2.imwrite(output_path, masked_image)

    
    # 마스킹 방법 메타정보
    method = {
        "face": "mascot" if face_found else "none",
        "image": "blur",
        "text": "none"
    }


    return output_path, method, face_found
'''
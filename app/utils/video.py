import cv2
import os
import tempfile
from app.utils.face import blur_faces
from app.utils.vision_ocr import extract_text_from_image_gvision

# 얼굴 탐지 모델 로드
modelFile = "models/res10_300x300_ssd_iter_140000.caffemodel"
configFile = "models/deploy.prototxt"
net = cv2.dnn.readNetFromCaffe(configFile, modelFile)

# 마스코트 이미지 로드
mascot_img = cv2.imread("static/mask/mascot.png", cv2.IMREAD_UNCHANGED)  # 투명 배경 유지

def apply_mascot_mask(frame):
    h, w = frame.shape[:2]
    blob = cv2.dnn.blobFromImage(frame, 1.0, (300, 300), (104.0, 177.0, 123.0))
    net.setInput(blob)
    detections = net.forward()
    masked_count = 0

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.5:
            box = detections[0, 0, i, 3:7] * [w, h, w, h]
            (x1, y1, x2, y2) = box.astype("int")

            face_w, face_h = x2 - x1, y2 - y1
            if face_w > 0 and face_h > 0:
                resized_mascot = cv2.resize(mascot_img, (face_w, face_h))

                if resized_mascot.shape[2] == 4:  # 알파 채널 존재
                    alpha_s = resized_mascot[:, :, 3] / 255.0
                    alpha_l = 1.0 - alpha_s

                    for c in range(0, 3):
                        frame[y1:y2, x1:x2, c] = (
                            alpha_s * resized_mascot[:, :, c] +
                            alpha_l * frame[y1:y2, x1:x2, c]
                        )
                else:
                    frame[y1:y2, x1:x2] = resized_mascot

                masked_count += 1

    return frame, masked_count

def process_video(video_path: str):
    base_name = os.path.splitext(os.path.basename(video_path))[0]
    result_filename = f"{base_name}_result.mp4" 
    output_path = os.path.join("static", "uploads", "video", result_filename)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return "", "영상 열기에 실패했습니다."

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    fps = cap.get(cv2.CAP_PROP_FPS)
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    resize_ratio = 1.0
    resized_size = (int(width * resize_ratio), int(height * resize_ratio))

    out = cv2.VideoWriter(output_path, fourcc, fps, resized_size)

    text_result = ""
    frame_count = 0
    ocr_interval = int(fps * 1.0)  # 1초당 OCR 한 번

    total_masked_faces = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, resized_size)

        # ✅ 마스코트 얼굴 마스킹
        frame, masked_count = apply_mascot_mask(frame)
        total_masked_faces += masked_count

        # ✅ Google Vision OCR
        if frame_count % ocr_interval == 0:
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tmp_img:
                cv2.imwrite(tmp_img.name, frame)
                try:
                    ocr_text = extract_text_from_image_gvision(tmp_img.name)
                    text_result += ocr_text + "\n"
                except Exception as e:
                    text_result += f"[OCR 실패: {e}]\n"

        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()

    print(f"[INFO] 영상 처리 완료: {output_path}")
    print(f"[INFO] 마스코트 처리된 얼굴 총 수: {total_masked_faces}")

    return output_path, text_result

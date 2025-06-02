import os
from google.cloud import vision
from google.oauth2 import service_account

credentials_path = os.getenv("GOOGLE_VISION_CREDENTIALS")
credentials = service_account.Credentials.from_service_account_file(credentials_path)
client = vision.ImageAnnotatorClient(credentials=credentials)

def extract_text_from_image_gvision(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Vision API 오류: {response.error.message}")

    texts = response.text_annotations
    if not texts:
        return "[⚠️ OCR 결과 없음]"

    return texts[0].description.strip()

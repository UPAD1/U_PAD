import re

def normalize_ocr_text(text: str) -> str:
    text = text.replace("\n", " ")
    text = re.sub(r'\s+', ' ', text).strip()

    # 전화번호 보정
    text = re.sub(r'\b(01[016789])(\d{3,4})(\d{4})\b', r'\1-\2-\3', text)

    # 주민등록번호 보정
    text = re.sub(r'\b(\d{6})(\d{7})\b', r'\1-\2', text)

    # 이메일 보정
    text = re.sub(r'\b([\w\.-]+)\s*[@\s]?\s*([a-z]+\.[a-z]{2,3})\b', r'\1@\2', text)

    return text

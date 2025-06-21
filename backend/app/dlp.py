from fastapi import FastAPI, Form
from google.cloud import dlp_v2
from dotenv import load_dotenv
import os
import re
from app.deidentify_text import deidentify_text

load_dotenv()

app = FastAPI()


@app.post("/inspect")
async def inspect_text(text: str = Form(...)):
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    parent = f"projects/{project_id}"

    dlp = dlp_v2.DlpServiceClient(
        client_options={"api_endpoint": "dlp.googleapis.com"}
    )

    item = {"value": text}

    info_types = [
        {"name": "KOREA_RRN"},  # 주민등록번호
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},  # 운전면허번호
        {"name": "PERSON_NAME"},  # 사람 이름
        {"name": "LOCATION"},  # 주소
        {"name": "EMAIL_ADDRESS"},
        {"name": "PHONE_NUMBER"},
        {"name": "CREDIT_CARD_NUMBER"},
    ]

    # ✅ 1. DLP API 호출
    response = dlp.inspect_content(
        request={
            "parent": parent,
            "item": item,
            "inspect_config": {
                "info_types": info_types,
                "include_quote": True,
                "min_likelihood": "POSSIBLE"
            },
        }
    )

    # ✅ 2. DLP 결과 정리
    findings = []
    found_quotes = set()

    for finding in response.result.findings:
        quote = finding.quote
        findings.append({
            "info_type": finding.info_type.name,
            "likelihood": finding.likelihood.name,
            "quote": quote
        })
        found_quotes.add(quote)

    # ✅ 3. 주민등록번호 fallback
    rrn_matches = re.findall(r'\b\d{6}-\d{7}\b', text)
    for match in rrn_matches:
        if match not in found_quotes:
            findings.append({
                "info_type": "KOREA_RRN",
                "likelihood": "LIKELY",
                "quote": match
            })
            found_quotes.add(match)

    # ✅ 4. 주소 fallback (키워드 기반)
    address_keywords = ["시", "도", "구", "동", "읍", "면", "로", "길", "호"]
    for word in text.split():
        if any(k in word for k in address_keywords):
            if word not in found_quotes:
                findings.append({
                    "info_type": "LOCATION",
                    "likelihood": "POSSIBLE",
                    "quote": word
                })
                found_quotes.add(word)

    # ✅ 5. 비식별화 텍스트 생성
    deidentified_text = deidentify_text(text, findings)

    return {
        "findings": findings,
        "deidentified_text": deidentified_text
    }

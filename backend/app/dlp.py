from fastapi import FastAPI, Form
from google.cloud import dlp_v2
from dotenv import load_dotenv
import os
from app.deidentify_text import deidentify_text

load_dotenv()

app = FastAPI()

# 민감 정보 검출 요청 처리 엔드포인트
@app.post("/inspect")
async def inspect_text(text: str = Form(...)):
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    parent = f"projects/{project_id}"

    #dlp = dlp_v2.DlpServiceClient()
    dlp = dlp_v2.DlpServiceClient(
        client_options={"api_endpoint": "dlp.googleapis.com"}
    )

    item = {"value": text}

    # 검출할 민감 정보 유형 정의
    info_types = [
        {"name": "KOREA_RRN"},  # 주민등록번호
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"}, # 운전면허번호
        {"name": "PERSON_NAME"},  # 사람 이름
        {"name": "LOCATION"},     # 주소
        {"name": "EMAIL_ADDRESS"},
        {"name": "PHONE_NUMBER"},
        {"name": "CREDIT_CARD_NUMBER"},
    ]

    # DLP API 요청 구성 및 실행
    response = dlp.inspect_content(
        request={
            "parent": parent,
            "item": item,
            "inspect_config": {
                "info_types": info_types,
                "include_quote": True,
            },
        }
    )

    # 민감 정보 검출 결과 정리
    findings = []
    for finding in response.result.findings:
        findings.append({
            "info_type": finding.info_type.name,
            "likelihood": finding.likelihood.name,
            "quote": finding.quote
        })

    # 비식별화된 텍스트 생성
    deidentified_text = deidentify_text(text, findings)

    return {
        "findings": findings,
        "deidentified_text": deidentified_text
    }
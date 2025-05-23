from google.cloud import dlp_v2
import re
import os

def deidentify_text(text, findings):
    """
    원본 텍스트와 DLP 검출 결과를 바탕으로 개인정보를 비식별화합니다.
    
    비식별화 규칙:
    - 이름: 성씨만 남기고 나머지 비식별화 (예: 김**)
    - 주소: 큰 주소만 남기고 상세주소 비식별화 (예: 서울시 강남구 ***)
    - 이메일: 첫 글자와 도메인만 남기고 비식별화 (예: a***@gmail.com)
    - 기타 개인정보: 첫 글자만 남기고 나머지 비식별화
    """
    deidentified_text = text
    
    # 뒤에서부터 적용해야 인덱스가 밀리는 문제 방지
    sorted_findings = sorted(findings, key=lambda x: x["quote"], reverse=True)
    
    for finding in sorted_findings:
        info_type = finding["info_type"]
        quote = finding["quote"]
        
        # 타입별 비식별화 처리
        if info_type == "PERSON_NAME":
            # 한글 이름 처리: 성씨만 남기고 나머지 *로 대체
            if re.match(r'[가-힣]+', quote):
                surname = quote[0]  # 성씨
                masked = surname + "*" * (len(quote) - 1)
            else:
                # 영문 이름은 첫 글자만 남기고 나머지 *로 대체
                masked = quote[0] + "*" * (len(quote) - 1)
            
            deidentified_text = deidentified_text.replace(quote, masked)
        
        elif info_type == "LOCATION":
            # 주소는 큰 주소(시/도, 구/군)만 남기고 상세주소 비식별화
            # 한국어 주소 패턴 매칭 (예: 서울시 강남구 테헤란로 123)
            address_parts = re.split(r'([시도군구읍면동])\s*', quote)
            
            if len(address_parts) > 3:  # 구분자가 있는 경우
                # 시/도, 구/군까지 포함
                main_address = ''
                detail_found = False
                
                for i in range(min(4, len(address_parts))):
                    main_address += address_parts[i]
                    if i % 2 == 1:  # 구분자('시','군','구' 등) 뒤에 공백 추가
                        main_address += ' '
                        if address_parts[i] in ['구', '군']:
                            detail_found = True
                            break
                
                if detail_found:
                    masked = main_address.strip() + " ***"
                else:
                    # 구분자가 명확하지 않은 경우 단순 처리
                    words = quote.split()
                    if len(words) > 2:
                        masked = ' '.join(words[:2]) + " ***"
                    else:
                        masked = quote[0] + "*" * (len(quote) - 1)
            else:
                # 구분자가 없거나 단순 주소인 경우
                words = quote.split()
                if len(words) > 2:
                    masked = ' '.join(words[:2]) + " ***"
                else:
                    masked = quote[0] + "*" * (len(quote) - 1)
            
            deidentified_text = deidentified_text.replace(quote, masked)
        
        elif info_type == "EMAIL_ADDRESS":
            # 이메일은 첫 글자와 도메인만 남기고 비식별화
            parts = quote.split('@')
            if len(parts) == 2:
                username, domain = parts
                masked_username = username[0] + "*" * (len(username) - 1)
                masked = f"{masked_username}@{domain}"
            else:
                # 이메일 형식이 아닌 경우 기본 마스킹
                masked = quote[0] + "*" * (len(quote) - 1)
            
            deidentified_text = deidentified_text.replace(quote, masked)
        
        elif info_type in ["PHONE_NUMBER", "CREDIT_CARD_NUMBER", "KOREA_RRN", "KOREA_DRIVERS_LICENSE_NUMBER"]:
            # 기타 개인정보는 첫 글자만 남기고 나머지 비식별화
            masked = quote[0] + "*" * (len(quote) - 1)
            deidentified_text = deidentified_text.replace(quote, masked)
    
    return deidentified_text

# Google Cloud DLP API를 사용한 비식별화 (대안)
def deidentify_with_google_dlp(text):
    """
    Google Cloud DLP API를 사용하여 텍스트를 비식별화합니다.
    """
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    parent = f"projects/{project_id}"
    
    dlp = dlp_v2.DlpServiceClient(
        client_options={"api_endpoint": "dlp.googleapis.com"}
    )
    
    # 비식별화할 민감 정보 유형
    info_types = [
        {"name": "KOREA_RRN"},
        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},
        {"name": "PERSON_NAME"},
        {"name": "LOCATION"},
        {"name": "EMAIL_ADDRESS"},
        {"name": "PHONE_NUMBER"},
        {"name": "CREDIT_CARD_NUMBER"},
    ]
    
    # 비식별화 규칙 설정
    deidentify_config = {
        "info_type_transformations": {
            "transformations": [
                {
                    "info_types": [{"name": "PERSON_NAME"}],
                    "primitive_transformation": {
                        "character_mask_config": {
                            "masking_character": "*",
                            "number_to_mask": 100,
                            "characters_to_ignore": [
                                {"characters": " "},
                                {"characters": "-"}
                            ],
                            "reverse_order": True
                        }
                    }
                },
                {
                    "info_types": [
                        {"name": "KOREA_RRN"},
                        {"name": "KOREA_DRIVERS_LICENSE_NUMBER"},
                        {"name": "PHONE_NUMBER"},
                        {"name": "CREDIT_CARD_NUMBER"},
                    ],
                    "primitive_transformation": {
                        "character_mask_config": {
                            "masking_character": "*",
                            "number_to_mask": 100,
                            "characters_to_ignore": [
                                {"characters": " "},
                                {"characters": "-"}
                            ]
                        }
                    }
                },
                {
                    "info_types": [{"name": "EMAIL_ADDRESS"}],
                    "primitive_transformation": {
                        "replace_config": {
                            "new_value": {
                                "string_value": "[EMAIL REDACTED]"
                            }
                        }
                    }
                },
                {
                    "info_types": [{"name": "LOCATION"}],
                    "primitive_transformation": {
                        "replace_config": {
                            "new_value": {
                                "string_value": "[ADDRESS REDACTED]"
                            }
                        }
                    }
                }
            ]
        }
    }
    
    # DLP API 요청 구성 및 실행
    response = dlp.deidentify_content(
        request={
            "parent": parent,
            "deidentify_config": deidentify_config,
            "inspect_config": {
                "info_types": info_types
            },
            "item": {"value": text}
        }
    )
    
    return response.item.value
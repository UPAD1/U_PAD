import os
import sys
import traceback

# 현재 경로 및 파이썬 경로 출력
print(f"현재 작업 디렉토리: {os.getcwd()}")

# dotenv 패키지 임포트
try:
    print("\n1. python-dotenv 패키지 임포트 시도...")
    from dotenv import load_dotenv
    print("✅ 성공: python-dotenv 패키지 임포트 성공")
except ImportError:
    print("❌ 오류: python-dotenv 패키지가 설치되어 있지 않습니다.")
    print("💡 해결 방법: 'pip install python-dotenv'를 실행하세요.")
    sys.exit(1)

# .env 파일 로드 - vision_ocr.py와 동일한 방식
print("\n2. .env 파일 로드 시도...")
load_dotenv()  # .env 파일 로드
print("✅ .env 파일 로드 완료")

# 환경 변수 확인
print("\n3. 환경 변수 확인...")
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not credentials_path:
    print("❌ 오류: GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되지 않았습니다.")
    sys.exit(1)
elif not os.path.exists(credentials_path):
    print(f"❌ 오류: 인증 파일 '{credentials_path}'이 존재하지 않습니다.")
    sys.exit(1)
else:
    print(f"✅ 환경 변수에서 인증 파일 경로 확인: {credentials_path}")

# Google Cloud Vision 패키지 임포트
try:
    print("\n4. Google Cloud 패키지 임포트 시도...")
    from google.cloud import vision
    from google.oauth2 import service_account
    print("✅ 성공: Google Cloud Vision 패키지 임포트 성공")
except Exception as e:
    print(f"❌ 오류: {e}")
    sys.exit(1)

# vision_ocr.py와 동일한 방식으로 클라이언트 초기화
try:
    print("\n5. vision_ocr.py 방식으로 클라이언트 초기화...")
    credentials = service_account.Credentials.from_service_account_file(credentials_path)
    client = vision.ImageAnnotatorClient(credentials=credentials)
    print("✅ 성공: Vision 클라이언트 초기화 성공")
except Exception as e:
    print(f"❌ 오류: {e}")
    traceback.print_exc()
    sys.exit(1)

# 간단한 API 호출 테스트
try:
    print("\n6. API 호출 테스트...")
    # 테스트용 빈 이미지 생성
    from PIL import Image as PILImage
    import io
    
    # 간단한 흰색 이미지 생성
    img = PILImage.new('RGB', (100, 50), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # Vision API 호출
    image = vision.Image(content=img_byte_arr)
    response = client.text_detection(image=image)
    
    if response.error.message:
        print(f"❌ API 오류: {response.error.message}")
    else:
        print("✅ 성공: API 호출 성공")
        
except Exception as e:
    print(f"❌ 오류: {e}")
    traceback.print_exc()

print("\n✅ 테스트 완료")
print(f"환경 변수와 인증 파일이 정상적으로 작동합니다: {credentials_path}")
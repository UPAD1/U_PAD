import React, { useState, useEffect } from "react";
import { FileUploader } from "./FileUploader";
import { MaskSelectButton } from "./MaskSelectButton";
import SpinnerSmSquareHorizontal from "./SpinnerSmSquareHorizontal";

const UploaderPage = ({ fileUploadData1, onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [maskType, setMaskType] = useState("blur"); // 기본 마스킹 타입은 블러 처리
  const [maskFile, setMaskFile] = useState(null); // 마스코트 이미지 파일
  const [uploadId, setUploadId] = useState(""); // UUID 저장용
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가
  const file_path = "http://localhost:8000/upload/image"; // 서버 URL

  // 마스코트 이미지를 위한 설정
  const mascotFileData = {
    fileExtensions: ["jpg", "jpeg", "png"],
    fileExtensionsText: "JPG, JPEG, PNG",
  };

  // 컴포넌트 마운트 시 UUID 생성
  useEffect(() => {
    // 간단한 UUID 생성 함수
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    };

    setUploadId(generateUUID());
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      if (onFileUpload) {
        onFileUpload("error", "업로드할 파일이 선택되지 않았습니다.");
      } else {
        alert("업로드할 파일이 선택되지 않았습니다.");
      }
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", maskType); // 선택된 마스킹 타입을 서버로 전송
    formData.append("upload_id", uploadId); // UUID 전송

    // 마스코트 모드인 경우 마스크 파일도 추가 (활성화)
    if (maskType === "mascot" && maskFile) {
      // 파일 이름을 UUID 포함하도록 변경
      const fileExt = maskFile.name.split(".").pop(); // 파일 확장자 추출
      const newFileName = `${uploadId}_mascot.${fileExt}`;

      // 새 파일 객체 생성 (이름 변경을 위해)
      const renamedFile = new File([maskFile], newFileName, {
        type: maskFile.type,
      });

      formData.append("mask_file", renamedFile);
      console.log(`마스코트 파일 이름 변경: ${maskFile.name} → ${newFileName}`);
    }

    // FormData 내용 콘솔에 출력
    console.log("======= FormData 내용 =======");
    console.log("업로드 ID (UUID):", uploadId);
    console.log("선택된 마스킹 타입:", maskType);
    console.log("원본 파일 정보:", {
      name: selectedFile.name,
      type: selectedFile.type,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
    });

    if (maskType === "mascot" && maskFile) {
      console.log("마스코트 파일 정보:", {
        name: maskFile.name,
        type: maskFile.type,
        size: `${(maskFile.size / 1024).toFixed(2)} KB`,
      });
    }

    // FormData의 키-값 쌍 출력
    console.log("FormData 키-값 쌍:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], ":", {
          name: pair[1].name,
          type: pair[1].type,
          size: `${(pair[1].size / 1024).toFixed(2)} KB`,
        });
      } else {
        console.log(pair[0], ":", pair[1]);
      }
    }
    console.log("============================");
    setIsLoading(true);

    try {
      const response = await fetch(file_path, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `업로드 실패: ${errorText || response.statusText}`;
        if (onFileUpload) {
          onFileUpload("error", errorMessage);
        }
        return;
      }

      const result = await response.json();
      console.log("업로드 완료:", result);

      // img_path 가 존재하는지 확인 후 절대 경로로 변경
      // file_path 변경
      if (onFileUpload && result.img_path) {
        onFileUpload("success", {
          ...result,
          img_path: `http://localhost:8000/${result.img_path.replace(
            /^\/+/,
            ""
          )}`,
        });
      } else {
        onFileUpload("error", "서버에서 이미지 경로를 반환하지 않았습니다.");
      }
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      const networkErrorMessage =
        "업로드 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.";
      if (onFileUpload) {
        onFileUpload("error", networkErrorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 마스크 타입이 변경될 때 마스크 파일 초기화
  useEffect(() => {
    if (maskType !== "mascot") {
      setMaskFile(null);
    }
  }, [maskType]);

  return (
    <div className="min-w-5xl max-w-4xl mt-2 p-8 mx-auto justify-center bg-white rounded-xl shadow-md space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-2">비식별화할 이미지</h3>
        <FileUploader
          className="min-h-[240px]"
          filetype={fileUploadData1.filetype}
          fileExtensions={fileUploadData1.fileExtensions}
          fileExtensionsText={fileUploadData1.fileExtensionsText}
          onFileSelect={(file) => setSelectedFile(file)}
          selectedFile={selectedFile}
        />
      </div>

      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-2">마스킹 옵션 선택</h3>
        <div className="flex gap-2 justify-center items-center">
          <div className="flex flex-col items-center relative">
            <MaskSelectButton
              selected={maskType === "mascot"}
              onClick={() => setMaskType("mascot")}
            >
              마스코트로 가리기
            </MaskSelectButton>
            {maskType === "mascot" && (
              <div className="absolute -top-15 right-40 w-64 z-10 mt-2 bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
                <h4 className="text-sm font-medium mb-2 text-center">
                  마스코트 이미지 선택
                </h4>
                <FileUploader
                  className="max-h-[120px] border border-blue-200"
                  filetype="마스코트 이미지"
                  fileExtensions={mascotFileData.fileExtensions}
                  fileExtensionsText={mascotFileData.fileExtensionsText}
                  onFileSelect={(file) => setMaskFile(file)}
                  selectedFile={maskFile}
                />
                <p className="text-xs text-gray-500 text-center">
                  이미지는 얼굴 위에 덮어씌워집니다
                </p>
              </div>
            )}
          </div>

          <MaskSelectButton
            selected={maskType === "toonify"}
            onClick={() => setMaskType("toonify")}
          >
            AI 이미지로 가리기
          </MaskSelectButton>

          <MaskSelectButton
            selected={maskType === "blur"}
            onClick={() => setMaskType("blur")}
          >
            블러로 가리기
          </MaskSelectButton>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center m-2">
        업로드된 이미지는 자동으로 개인정보 탐지 및 비식별화가 진행됩니다.
      </p>
      {/* 로딩 스피너 또는 업로드 버튼 */}

      <div className="flex justify-center mt-2">
        <button
          onClick={handleUpload}
          className="px-10 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-sky-700"
        >
          {isLoading ? <SpinnerSmSquareHorizontal /> : "업로드 실행"}
        </button>
      </div>
    </div>
  );
};

export default UploaderPage;

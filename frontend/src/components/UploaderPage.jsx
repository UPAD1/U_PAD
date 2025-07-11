import React, { useState, useEffect } from "react";
import { FileUploader } from "./FileUploader";
import { MaskSelectButton } from "./MaskSelectButton";
import SpinnerSmSquareHorizontal from "./SpinnerSmSquareHorizontal";

const UploaderPage = ({ fileUploadData1, onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [maskType, setMaskType] = useState("blur");
  const [maskFile, setMaskFile] = useState(null);
  const [uploadId, setUploadId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getUploadPath = () => {
    switch (fileUploadData1.filetype.toLowerCase()) {
      case "document":
        return "http://128.134.233.158:8001/upload/document";
      case "video":
        return "http://128.134.233.158:8001/upload/video";
      default:
        return "http://128.134.233.158:8001/upload/image";
    }
  };

  const mascotFileData = {
    fileExtensions: ["jpg", "jpeg", "png"],
    fileExtensionsText: "JPG, JPEG, PNG",
  };

  useEffect(() => {
    const generateUUID = () =>
      "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });

    setUploadId(generateUUID());
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      onFileUpload?.("error", "업로드할 파일이 선택되지 않았습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mode", maskType);
    formData.append("upload_id", uploadId);

    if (maskType === "mascot" && maskFile) {
      const fileExt = maskFile.name.split(".").pop();
      const newFileName = `${uploadId}_mascot.${fileExt}`;
      const renamedFile = new File([maskFile], newFileName, {
        type: maskFile.type,
      });
      formData.append("mask_file", renamedFile);
    }

    setIsLoading(true);

    try {
      const response = await fetch(getUploadPath(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        onFileUpload?.("error", `업로드 실패: ${errorText || response.statusText}`);
        return;
      }

      const result = await response.json();
      console.log("✅ 업로드 결과:", result);

      if (onFileUpload) {
        if (fileUploadData1.filetype.toLowerCase() === "document") {
          // 문서일 경우: uuid 기반 결과 조회
          onFileUpload("success", { uuid: result.uuid });
        } else if (result.img_path) {
          // 이미지/비디오일 경우: img_path 포함 응답
          onFileUpload("success", {
            ...result,
            img_path: `http://128.134.233.158:8001/${result.img_path.replace(/^\/+/, "")}`,
          });
        } else {
          onFileUpload("error", "서버에서 결과 경로를 반환하지 않았습니다.");
        }
      }
    } catch (error) {
      console.error("❌ 업로드 중 오류 발생:", error);
      onFileUpload?.("error", "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (maskType !== "mascot") {
      setMaskFile(null);
    }
  }, [maskType]);

  return (
    <div className="min-w-5xl max-w-4xl mt-2 p-8 mx-auto justify-center bg-white rounded-xl shadow-md space-y-4">
      <div className="mb-2">
        <h3 className="text-lg font-semibold mb-2">비식별화할 파일</h3>
        <FileUploader
          className="min-h-[240px]"
          filetype={fileUploadData1.filetype}
          fileExtensions={fileUploadData1.fileExtensions}
          fileExtensionsText={fileUploadData1.fileExtensionsText}
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
        />
      </div>

      {fileUploadData1.filetype.toLowerCase() === "image" && (
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
                    onFileSelect={setMaskFile}
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
      )}

      <p className="text-sm text-gray-500 text-center m-2">
        업로드된 파일은 자동으로 개인정보 탐지 및 비식별화가 진행됩니다.
      </p>

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

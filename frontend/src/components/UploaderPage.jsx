import React, { useState } from "react";
import { FileUploader } from "./FileUploader";

const UploaderPage = ({ fileUploadData1, onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

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

    try {
      const response = await fetch("http://localhost:8000/upload/image", {
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
      if (onFileUpload) {
        onFileUpload("success", result);
      }
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      const networkErrorMessage =
        "업로드 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.";
      if (onFileUpload) {
        onFileUpload("error", networkErrorMessage);
      }
    }
  };

  return (
    <div className="min-w-5xl max-w-4xl mt-10 p-8 mx-auto justify-center bg-white rounded-xl shadow-md space-y-6">
      

      <FileUploader
        className="min-h-[280px]"
        filetype={fileUploadData1.filetype}
        fileExtensions={fileUploadData1.fileExtensions}
        fileExtensionsText={fileUploadData1.fileExtensionsText}
        onFileSelect={(file) => setSelectedFile(file)}
        selectedFile={selectedFile}
      />

      <p className="text-sm text-gray-500 text-center">
        업로드된 이미지는 자동으로 개인정보 탐지 및 비식별화가 진행됩니다.
      </p>

      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          className="mt-2 px-10 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-sky-700 transition ease-in-out duration-200"
        >
          업로드 실행
        </button>
      </div>
    </div>
  );
};

export default UploaderPage;

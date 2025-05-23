import { HeaderPage } from "../components/HeaderPage";
import { useState } from "react";
import StepperUploader from "../components/StepperUploader";
import { UploadResult } from "../components/UploadResult";

function About() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUploadComplete = (resultType, data) => {
    if (resultType === "success") {
      setUploadResult({ type: resultType, content: data });
    }
  };

  const handleClose = () => {
    // UploadResult에서 닫기 눌렀을 때 업로드 화면으로 복귀
    setUploadResult(null);
    setFile1(null);
    setFile2(null);
  };

  // 업로드 성공 시 결과 화면 보여주고, 그렇지 않으면 업로드 화면
  return (
    <>
      <HeaderPage
        strong="<이미지 마스킹>"
        description="이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        {uploadResult?.type === "success" ? (
          <UploadResult
            onClose={handleClose}
            imageUrl={uploadResult.content.img_path}
          />
        ) : (
          <StepperUploader
            fileUploadData1={{
              filetype: "image1",
              fileExtensions: ".jpg, .jpeg, .png",
              fileExtensionsText: "JPG, JPEG, PNG",
              onFileSelect: setFile1,
              selectedFile: file1,
            }}
            fileUploadData2={{
              filetype: "image2",
              fileExtensions: ".jpg, .jpeg, .png",
              fileExtensionsText: "JPG, JPEG, PNG",
              onFileSelect: setFile2,
              selectedFile: file2,
            }}
            onFileUpload={handleUploadComplete}
          />
        )}
      </HeaderPage>
    </>
  );
}

export default About;

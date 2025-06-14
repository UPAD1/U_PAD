import { HeaderPage } from "../components/HeaderPage";
import { useState } from "react";
import UploaderPage from "../components/UploaderPage";
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
      {uploadResult?.type === "success" ? (
        <div className="lg:grid py-8 px-8 h-screen shado bg-gradient-to-b from-[#fcfcfc] from-50% to-[#a2cbeb] place-content-center dark:bg-gray-900 rounded-b-[70px]">
          <div className="mx-auto max-w-5xl w-full pt-10 px-5 sm:px-[5vw] lg:px-[3vw]"></div>
          <div className="flex justify-center">
            <UploadResult
              onClose={handleClose}
              imageUrl={uploadResult.content.img_path}
            />
          </div>
        </div>
      ) : (
        <HeaderPage
          strong="<이미지 마스킹>"
          description="이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
        >
          <UploaderPage
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
        </HeaderPage>
      )}
      <div className="flex justify-center">
        <UploadResult
          onClose={handleClose}
          imageUrl={"../public/masking.png"}
        />
      </div>
    </>
  );
}

export default About;

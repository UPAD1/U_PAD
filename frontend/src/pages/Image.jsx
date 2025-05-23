import { HeaderPage } from "../components/HeaderPage";
import { FileUploader } from "../components/FileUploader";
import StepperUploader from "../components/StepperUploader";
import { useState } from "react";

function Image() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);

  return (
    <>
      <HeaderPage
        strong="<이미지 마스킹>"
        description="이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
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
        />
      </HeaderPage>
      <div className="m-10"></div>
    </>
  );
}

export default Image;

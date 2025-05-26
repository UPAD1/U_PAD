import StepperUploader from "../components/StepperUploader";
import { Header } from "../components/Header";
import { HeaderPage } from "../components/HeaderPage";
import { useState } from "react";

function Document() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  return (
    <>
      <HeaderPage
        strong="<문서 마스킹>"
        description="문서에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        <StepperUploader
          fileUploadData1={{
            filetype: "Document",
            fileExtensions: ".pdf, .txt, .doc, .docs",
            fileExtensionsText: "PDF, DOC, DOCS, TXT",
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
    </>
  );
}

export default Document;

import UploaderPage from "../components/UploaderPage";
import { Header } from "../components/Header";
import { HeaderPage } from "../components/HeaderPage";
import UploadIntro from "../components/UploadIntro";
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
        <UploaderPage
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


      <UploadIntro
        imageSrc="/preview-doc.png" // 문서용 미리보기 이미지
        title="How to anonymize your documents in 3 easy steps"
        description={{
          headline: (
            <>
              Protect sensitive data in{" "}
              <span className="text-blue-500">documents</span> effortlessly
            </>
          ),
          subtext: `주민등록번호, 전화번호, 주소 등 문서 내 개인정보를 쉽게 비식별화할 수 있습니다.\n문서 업로드만 하면 자동 탐지로 빠르게 시작할 수 있어요.`,
        }}
        steps={[
          {
            image: "/images/doc-step1.png",
            title: "Upload your document",
            desc: "PDF, Word, PPT 등 다양한 포맷을 지원해요.",
          },
          {
            image: "/images/doc-step2.png",
            title: "Detect sensitive data",
            desc: "OCR로 텍스트를 추출하고\n개인정보를 자동 탐지합니다.",
          },
          {
            image: "/images/doc-step3.png",
            title: "Anonymize & Download",
            desc: "블러 처리, 마스킹, 삭제 등\n다양한 방식으로 비식별화하고 저장하세요.",
          },
        ]}
        features={[
          {
            icon: "/icons/pdf.png",
            title: "Multi-format support",
            desc: "PDF, DOCX, PPTX 등 다양한 문서 포맷을 지원합니다.",
          },
          {
            icon: "/icons/ocr.png",
            title: "Smart OCR & detection",
            desc: "문서에서 텍스트를 OCR로 추출한 뒤 AI가 자동으로 개인정보를 탐지합니다.",
          },
          {
            icon: "/icons/mask.png",
            title: "Flexible anonymization",
            desc: "마스킹, 블러, 삭제 등 다양한 방식으로 처리 가능해요.",
          },
        ]}
        exampleBefore="/examples/doc-before.png"
        exampleAfter="/examples/doc-after.png"
      />

    </>
  );
}

export default Document;

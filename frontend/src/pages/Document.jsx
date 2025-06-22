import UploaderPage from "../components/UploaderPage";
import { HeaderPage } from "../components/HeaderPage";
import UploadIntro from "../components/UploadIntro";
import ResultDocumentLoader from "../components/ResultDocumentLoader";
import { useState } from "react";

function Document() {
  const [uploadResult, setUploadResult] = useState(null); // { uuid: ... }

  const handleUploadResult = (status, result) => {
    if (status === "success" && result.uuid) {
      setUploadResult(result);
    } else {
      alert("문서 업로드 실패 또는 uuid 누락");
      console.error(result);
    }
  };

  return (
    <>
      <HeaderPage
        strong="<문서 마스킹>"
        description="문서에 있는 텍스트에서 개인정보를 자동으로 추출 및 마스킹합니다."
      >
        <div className="w-full flex flex-col items-center justify-center gap-6">
          {/* ✅ 분석 결과가 업로더 위에 출력되도록 */}
          {uploadResult?.uuid && (
            <ResultDocumentLoader
              uuid={uploadResult.uuid}
              onClose={() => setUploadResult(null)}
            />
          )}

          {/* 📁 파일 업로드 */}
          <UploaderPage
            fileUploadData1={{
              filetype: "document",
              fileExtensions: ".pdf, .txt, .doc, .docx",
              fileExtensionsText: "PDF, DOC, DOCX, TXT",
              onFileSelect: () => {},
            }}
            onFileUpload={handleUploadResult}
          />
        </div>
      </HeaderPage>

      <UploadIntro
        imageSrc="/preview-doc.png"
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
            desc: "홍*순, 서울특별시 *** 등으로 비식별화하고 결과를 다운로드하세요.",
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

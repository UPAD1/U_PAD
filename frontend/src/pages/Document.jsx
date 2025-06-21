import UploaderPage from "../components/UploaderPage";
import { HeaderPage } from "../components/HeaderPage";
import UploadIntro from "../components/UploadIntro";
import ResultDocument from "../components/UploadResultDocument";
import { useState } from "react";
import axios from "axios";

function Document() {
  const [file1, setFile1] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file1) return alert("문서 파일을 선택해주세요!");

    const formData = new FormData();
    formData.append("file", file1);

    try {
      setLoading(true);
      const res = await axios.post("/upload/document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadResult(res.data);
    } catch (err) {
      alert("업로드 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!uploadResult ? (
        <>
          <HeaderPage
            strong="<문서 마스킹>"
            description="문서에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
          >
            <UploaderPage
              fileUploadData1={{
                filetype: "Document",
                fileExtensions: ".pdf, .txt, .doc, .docx",
                fileExtensionsText: "PDF, DOC, DOCX, TXT",
                onFileSelect: setFile1,
                selectedFile: file1,
              }}
            />
            <div className="text-center mt-4">
              <button
                onClick={handleUpload}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "처리 중..." : "문서 업로드 및 분석"}
              </button>
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
      ) : (
        <ResultDocument
          onClose={() => {
            setUploadResult(null);
            setFile1(null);
          }}
          text={uploadResult.text}
          findings={uploadResult.findings}
          ocr_blocks={uploadResult.ocr_blocks}
          filename={file1?.name}
        />
      )}
    </>
  );
}

export default Document;

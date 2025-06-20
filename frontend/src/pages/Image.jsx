//Image.jsx
import axios from "axios";
import { HeaderPage } from "../components/HeaderPage";
import { useState } from "react";
import { UploadResult } from "../components/UploadResult";
import UploaderPage from "../components/UploaderPage";
import UploadIntro from "../components/UploadIntro";
import UploadResultNew from "../components/UploadResultNew"; // 새로운 컴포넌트 임포트

function Image() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [mode, setMode] = useState("mascot"); //옵션선택
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
        <>
          <div className="grid py-8 px-8 h-screen shado bg-gradient-to-b from-[#fcfcfc] from-50% to-[#a2cbeb] place-content-center dark:bg-gray-900 rounded-b-[70px]">
            <div className="mx-auto w-full pt-7 px-5">
              <UploadResult
                onClose={handleClose}
                imageUrl={uploadResult.content.img_path}
                founds={uploadResult.content.found}
                findings={uploadResult.content.findings}
              />
            </div>
          </div>
          <div className="grid py-8 px-8 h-screen...">
            <div className="mx-auto w-full pt-7 px-5">
              <UploadResultNew // UploadResult 대신 UploadResultNew 사용
                onClose={handleClose}
                imageUrl={uploadResult.content.img_path}
                text={uploadResult.content.text}
                findings={uploadResult.content.findings}
                ocr_blocks={uploadResult.content.ocr_blocks}
                // 얼굴 감지 정보도 추가
                found={uploadResult.content.found}
                metadata={uploadResult.content.metadata}
                mode={uploadResult.content.mode}
              />
            </div>
          </div>
        </>
      ) : (
        <HeaderPage
          strong="<이미지 마스킹>"
          description="이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
        >
          <UploaderPage
            fileUploadData1={{
              filetype: "image",
              fileExtensions: ".jpg, .jpeg, .png",
              fileExtensionsText: "JPG, JPEG, PNG",
              onFileSelect: setFile1,
              selectedFile: file1,
            }}
            onFileUpload={handleUploadComplete}
            pageId={"image"}
          />
        </HeaderPage>
      )}
      <UploadIntro
        imageSrc="/preview.png"
        title="How to mask your images in 3 easy steps"
        description={{
          headline: (
            <>
              Mask your image in seconds with{" "}
              <span className="text-blue-500">U-PAD's</span> masking tool
            </>
          ),
          subtext: `이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹할 수 있습니다.\n누구나 클릭 몇 번으로 개인정보 보호를 시작할 수 있어요.`,
        }}
        steps={[
          {
            image: "/images/step1.png",
            title: "Upload your image",
            desc: "업로드 후 바로 시작!\n마스킹할 이미지를 선택하세요.",
          },
          {
            image: "/images/step2.png",
            title: "Mask your image",
            desc: "자동 탐지된 요소를 확인하고\n원하는 스타일로 조정하세요.",
          },
          {
            image: "/images/step3.png",
            title: "Download and share",
            desc: "비식별화된 이미지를 저장하고\n원하는 곳에 공유해보세요.",
          },
        ]}
        features={[
          {
            icon: "/icons/edit.png",
            title: "Start editing in a snap",
            desc: "업로드만 하면 AI가 자동으로 얼굴과 텍스트를 감지해 마스킹합니다.",
          },
          {
            icon: "/icons/crop.png",
            title: "Polish your image",
            desc: "드래그로 직접 마스킹 수정도 가능! 회전, 조정 기능도 제공 예정입니다.",
          },
          {
            icon: "/icons/design.png",
            title: "Use custom elements",
            desc: "마스코트, 스티커 등 디자인 요소로 개성 있게 비식별화할 수 있어요.",
          },
        ]}
        exampleBefore="/examples/before.png"
        exampleAfter="/examples/after.png"
      />
    </>
  );
}
// file_path 변경 필요
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode); //원하는 모드 선택

  try {
    const response = await axios.post(
      "http://localhost:8000/upload/image",
      formData
    );
    const imgPath = response.data.img_path;

    if (imgPath) {
      setUploadResult({
        type: "success",
        content: {
          ...response.data,
          img_path: `http://localhost:8000/${response.data.img_path}`, // full URL로 전달
        },
      });
    } else {
      console.error("img_path not found in response");
    }
  } catch (err) {
    console.error("파일 업로드 실패:", err);
  }
};

export default Image;

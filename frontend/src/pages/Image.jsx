import { HeaderPage } from "../components/HeaderPage";
import { FileUploader } from "../components/FileUploader";
import UploaderPage from "../components/UploaderPage";
import UploadIntro from "../components/UploadIntro";
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
        />
      </HeaderPage>

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

export default Image;

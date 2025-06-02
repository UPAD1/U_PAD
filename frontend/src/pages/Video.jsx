import { HeaderPage } from "../components/HeaderPage";
import UploaderPage from "../components/UploaderPage";
import UploadIntro from "../components/UploadIntro";
import { useState } from "react";

function Video() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  return (
    <>
      <HeaderPage
        strong="<동영상 마스킹>"
        description="동영상에 있는 얼굴을 쉽고 빠르게 마스킹합니다."
      >
        <UploaderPage
          fileUploadData1={{
            fileExtensions: ".mp4, .mov, .avi",
            fileExtensionsText: "MP4, MOV, AVI",
            onFileSelect: setFile1,
            selectedFile: file1,
          }}
          fileUploadData2={{
            fileExtensions: ".jpg, .jpeg, .png",
            fileExtensionsText: "JPG, JPEG, PNG",
            onFileSelect: setFile2,
            selectedFile: file2,
          }}
        />
      </HeaderPage>
      <div className="m-10"></div>

      <UploadIntro
        imageSrc="/preview-video.png"
        title="How to anonymize your videos in 3 easy steps"
        description={{
          headline: (
            <>
              Mask faces in your <span className="text-blue-500">videos</span> automatically
            </>
          ),
          subtext:
            "영상에 등장하는 사람들의 얼굴을 자동으로 인식하고\n모자이크 또는 캐릭터로 비식별화할 수 있습니다.",
        }}
        steps={[
          {
            image: "/images/video-step1.png",
            title: "Upload your video",
            desc: "MP4, MOV 등 다양한 확장자 지원\n길이 제한 없이 자유롭게 업로드 가능해요.",
          },
          {
            image: "/images/video-step2.png",
            title: "Auto-detect faces",
            desc: "영상 내 얼굴을 자동 탐지하고\n위치와 움직임까지 추적해요.",
          },
          {
            image: "/images/video-step3.png",
            title: "Apply masking & export",
            desc: "마스코트나 모자이크 스타일을 선택해\n영상 전체에 반영하고 저장하세요.",
          },
        ]}
        features={[
          {
            icon: "/icons/video.png",
            title: "Face recognition in motion",
            desc: "영상 속 얼굴을 자동 추적하고\n정확한 위치에 마스킹을 적용합니다.",
          },
          {
            icon: "/icons/character.png",
            title: "Custom avatars & effects",
            desc: "단순 블러 대신 캐릭터로 대체해\n창의적이고 자연스러운 마스킹 가능.",
          },
          {
            icon: "/icons/export.png",
            title: "Easy export",
            desc: "마스킹된 영상을 바로 저장하고\nSNS, 웹사이트 등에 활용할 수 있어요.",
          },
        ]}
        exampleBefore="/examples/video-before.png"
        exampleAfter="/examples/video-after.png"
      />

    </>
  );
}

export default Video;

import { HeaderPage } from "../components/HeaderPage";
import StepperUploader from "../components/StepperUploader";
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
        <StepperUploader
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
    </>
  );
}

export default Video;

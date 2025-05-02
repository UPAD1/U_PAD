import { Header } from "../components/Header";
import { FileUplodButton } from "../components/FileUploadButton";
import { HeaderPage } from "../components/HeaderPage";

function Video() {
  return (
    <>
      <HeaderPage
        title="원하는 영상을 넣어보세요"
        strong="<동영상 마스킹>"
        description="동영상에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        <FileUplodButton
          fileExtensions=".gif, .mp3, .mp4"
          filetype="Video"
          fileExtensionsText="GIF, MP3, MP4"
        ></FileUplodButton>
      </HeaderPage>
      <div className="m-10"></div>
    </>
  );
}

export default Video;

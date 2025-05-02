import { Header } from "../components/Header";
import { FileUplodButton } from "../components/FileUploadButton";
import { HeaderPage } from "../components/HeaderPage";

function Image() {
  return (
    <>
      <HeaderPage
        title="원하는 이미지를 넣어보세요"
        strong="<이미지 마스킹>"
        description="이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        <FileUplodButton
          fileExtensions=".jpg, .jpeg, .png"
          filetype="Image"
          fileExtensionsText="JPG, JPEG, PNG"
        ></FileUplodButton>
      </HeaderPage>
      <div className="m-10"></div>
    </>
  );
}

export default Image;

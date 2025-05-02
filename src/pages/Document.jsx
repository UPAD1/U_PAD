import { FileUplodButton } from "../components/FileUploadButton";
import { Header } from "../components/Header";
import { HeaderPage } from "../components/HeaderPage";

function Document() {
  return (
    <>
      <HeaderPage
        title="원하는 문서를 넣어보세요"
        strong="<문서 마스킹>"
        description="문서 파일과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        <FileUplodButton
          fileExtensions=".pdf, .doc, .docs, .txt"
          filetype="document"
          fileExtensionsText="PDF, DOC, DOCS, TXT"
        ></FileUplodButton>
      </HeaderPage>
    </>
  );
}

export default Document;

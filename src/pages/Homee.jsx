import { Feature } from "../components/Feature";
import FileCategory from "../components/FileCategory";
import { Header } from "../components/Header";
import { Link } from "react-router-dom";

function Homee() {
  return (
    <>
      <Header
        title="문서와 텍스트 마스킹"
        strong="캐릭터 얼굴 마스킹"
        description="문서 파일과 텍스트를 쉽고 빠르게 마스킹합니다."
      >
        <a
          className="inline-block rounded-[8px] border border-transparent bg-blue-500 px-7 py-3 text-xl text-white shadow-sm transition-colors hover:bg-blue-700"
          href="#FileCategory"
        >
          Get Started
        </a>
        <a
          className="inline-block rounded-[8px] border border-white px-7 py-3 text-xl shadow-sm transition-colors text-gray-200 hover:bg-white hover:text-black"
          href="#Feature"
        >
          Learn More
        </a>
      </Header>
      <FileCategory id="FileCategory" />
      <Feature id="Feature" />
    </>
  );
}

export default Homee;

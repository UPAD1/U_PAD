import { Feature } from "../components/Feature";
import FileCategory from "../components/FileCategory";
import { Header } from "../components/Header";
import { Link } from "react-router-dom";

function Homee() {
  return (
    <>
      <Header
        title="개인정보 텍스트 마스킹과"
        strong="원하는 캐릭터로 얼굴 마스킹까지"
        description="문서와 이미지,영상을 쉽고 빠르게 마스킹합니다."
      >
        <a
          className="inline-block rounded-[8px] border border-transparent bg-[#2c7eff] px-7 py-3 text-xl text-white shadow-sm transition-colors hover:bg-blue-700"
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

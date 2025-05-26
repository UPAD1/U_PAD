import { Feature } from "../components/Feature";
import FileCategory from "../components/FileCategory";
import { Header } from "../components/Header";

function Homee({ featureRef, fileCategoryRef }) {
  const scrollToFeature = () => {
    if (featureRef.current) {
      featureRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToFileCategory = () => {
    if (fileCategoryRef.current) {
      fileCategoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Header
        title="개인정보 텍스트 마스킹과"
        strong="원하는 캐릭터로 얼굴 마스킹까지"
        description="문서와 이미지,영상을 쉽고 빠르게 마스킹합니다."
      >
        <button
          onClick={scrollToFileCategory} // 클릭 시 scrollToHero 호출
          className="inline-block rounded-[8px] border border-transparent bg-[#2c7eff] px-7 py-3 text-xl text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Get Started
        </button>
        <button
          onClick={scrollToFeature}
          className="inline-block rounded-[8px] border border-white px-7 py-3 text-xl shadow-sm transition-colors text-gray-200 hover:bg-white hover:text-black"
        >
          Learn More
        </button>
      </Header>
      <FileCategory ref={fileCategoryRef} /> {/* FileCategory에 ref 전달 */}
      <Feature ref={featureRef} />
    </>
  );
}

export default Homee;

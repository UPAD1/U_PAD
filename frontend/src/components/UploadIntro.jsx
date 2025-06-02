import React from "react";

const UploadIntro = ({
  imageSrc = "/preview.png",
  title,
  description,
  steps = [],
  features = [],
  exampleBefore,
  exampleAfter,
}) => {
  return (
    <>
      {/* ✅ 하단: 3단계 가이드 */}
      <section className="pt-12 lg:pt-20 pb-16 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {title || "How to mask your images in 3 easy steps"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-xl shadow-sm p-6 text-center"
            >
              <div className="w-full aspect-[16/10] bg-gray-300 rounded-lg overflow-hidden mb-4">
                <img
                  src={step.image}
                  alt={`Step ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {index + 1}. {step.title}
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ✅ 상단: 마스킹 소개 + 미리보기 */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 py-16 pb-10 max-w-7xl mx-auto gap-14">
        <div className="w-full lg:w-1/2 space-y-8">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            {description?.headline || (
              <>
                Mask your image in seconds with {" "}
                <span className="text-blue-500">U-PAD's</span> masking tool
              </>
            )}
          </h2>
          <p className="text-gray-600 whitespace-pre-line">
            {description?.subtext ||
              "이미지에 있는 얼굴과 텍스트를 쉽고 빠르게 마스킹할 수 있습니다.\n누구나 클릭 몇 번으로 개인정보 보호를 시작할 수 있어요."}
          </p>
          <div className="space-y-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="p-3 bg-gray-200 rounded-xl">
                  <img src={feature.icon} alt={`icon${i}`} className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-1/2 mb-10 lg:mb-0 flex justify-center">
          <div className="w-full max-w-[600px] aspect-[17/11] bg-gray-300 rounded-xl shadow-xl overflow-hidden">
            <img
              src={imageSrc}
              alt="Upload Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ✅ 비교 예시 */}
      <section className="bg-white py-20 pb-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Masking Example Preview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="mb-2 text-gray-500 font-medium">Before</p>
              <div className="w-full aspect-[17/11] bg-gray-300 rounded-xl shadow-lg overflow-hidden">
                <img
                  src={exampleBefore}
                  alt="Before Masking"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="mb-2 text-gray-500 font-medium">After</p>
              <div className="w-full aspect-[17/11] bg-gray-300 rounded-xl shadow-lg overflow-hidden">
                <img
                  src={exampleAfter}
                  alt="After Masking"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UploadIntro;

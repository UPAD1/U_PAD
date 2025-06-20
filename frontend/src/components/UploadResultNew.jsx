import React, { useState, useEffect } from "react";

const UploadResultNew = ({ onClose, imageUrl, text, findings, ocr_blocks }) => {
  const [image, setImage] = useState(null);

  // ✅ 디버깅용 로그 출력
  useEffect(() => {
    console.log("🔍 imageUrl:", imageUrl);
    console.log("🔍 text:", text);
    console.log("🔍 findings:", findings);
    console.log("🔍 ocr_blocks:", ocr_blocks);
  }, [imageUrl, text, findings, ocr_blocks]);

  useEffect(() => {
    if (imageUrl) {
      setImage(imageUrl);
    }
  }, [imageUrl]);

  return (
    <>
      <div className="min-w-5xl max-w-7xl mt-10 justify-center bg-gray-50 rounded-2xl fadeInUp animated faster p-6 mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          마스킹 결과
        </h2>

        {image && (
          <div className="mb-6">
            <img
              src={image}
              alt="마스킹 이미지"
              className="w-full rounded-xl border"
            />
          </div>
        )}

        {text && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">OCR 추출 텍스트</h3>
            <p className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm text-gray-800">
              {text}
            </p>
          </div>
        )}

        {findings && findings.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-red-600">
              감지된 민감정보
            </h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {findings.map((item, idx) => (
                <li key={idx}>
                  {item.quote}
                  {item.bbox && (
                    <span className="text-gray-400">
                      {" "}
                      (위치: {item.bbox.join(", ")})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {ocr_blocks && ocr_blocks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2 text-blue-600">
              OCR 블록 정보
            </h3>
            <ul className="text-sm space-y-1 text-gray-700">
              {ocr_blocks.map((block, idx) => (
                <li key={idx}>
                  <strong>[{idx + 1}]</strong> {block.text}{" "}
                  {block.bbox && (
                    <span className="text-gray-500">
                      (위치: {block.bbox.join(", ")})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 업로드하기
          </button>
        </div>
      </div>
    </>
  );
};

export default UploadResultNew;

import React, { useState, useEffect } from "react";

const ResultDocument = ({ onClose, text, findings, ocr_blocks, filename }) => {
  const [docFilename, setDocFilename] = useState("");

  useEffect(() => {
    if (filename) {
      setDocFilename(filename);
    }
    console.log("📄 text:", text);
    console.log("📄 findings:", findings);
    console.log("📄 ocr_blocks:", ocr_blocks);
  }, [filename, text, findings, ocr_blocks]);

  return (
    <div className="min-w-5xl max-w-7xl mt-10 justify-center bg-gray-50 rounded-2xl p-6 mx-auto fadeInUp animated faster">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        문서 비식별화 결과
      </h2>

      {docFilename && (
        <div className="mb-4 text-gray-500 text-sm">
          업로드된 파일: <span className="font-medium">{docFilename}</span>
        </div>
      )}

      {text && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">OCR 추출 텍스트</h3>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm text-gray-800 max-h-60 overflow-y-auto">
            {text}
          </pre>
        </div>
      )}

      {findings && findings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-red-600">민감 정보 탐지</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {findings.map((item, idx) => (
              <li key={idx} className="mb-1">
                <strong>{item.info_type || "Sensitive Data"}:</strong> {item.quote}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ocr_blocks && ocr_blocks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-blue-600">OCR 블록 정보</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {ocr_blocks.map((block, idx) => (
              <li key={idx} className="py-1">
                <strong>[{idx + 1}]</strong> {block.text}
                {block.bbox && (
                  <span className="text-gray-400 ml-2">(bbox: {block.bbox.join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          다시 업로드하기
        </button>
      </div>
    </div>
  );
};

export default ResultDocument;

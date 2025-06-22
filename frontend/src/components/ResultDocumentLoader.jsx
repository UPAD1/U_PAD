// ✅ ResultDocumentLoader.jsx
import React, { useEffect, useState } from "react";
import UploadResultDocument from "./UploadResultDocument";

const ResultDocumentLoader = ({ uuid, onClose }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/static/txt_output/${uuid}_doc.json`);
        if (!res.ok) {
          throw new Error("결과 파일을 불러오는 데 실패했습니다.");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchResult();
  }, [uuid]);

  if (error) {
    return <p className="text-red-600 text-center">❌ {error}</p>;
  }

  if (!data) {
    return <p className="text-gray-600 text-center">⏳ 결과를 불러오는 중...</p>;
  }

  return (
    <UploadResultDocument
      text={data.text}
      findings={data.findings}
      ocr_blocks={data.ocr_blocks || []}
      filename={data.filename}
      onClose={onClose}
    />
  );
};

export default ResultDocumentLoader;
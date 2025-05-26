import React, { useState } from "react";
import { FileUploader } from "./FileUploader";
import { FaceFilter } from "./FaceFilter";

const StepperUploader = ({
  fileUploadData1,
  fileUploadData2,
  onFileUpload,
}) => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    file1: null,
    file2: null,
  });

  const steps = [
    {
      id: 1,
      label: "1단계",
      summary: selectedFiles.file1?.name || "마스킹 파일",
    },
    {
      id: 2,
      label: "2단계",
      summary: selectedFiles.file2?.name || "오버레이 이미지",
    },
    { id: 3, label: "3단계", summary: "업로드 실행" },
  ];

  //  const handleFileChange = (setter) => (e) => {
  //    const file = e.target.files[0];
  //    setter(file);
  //  };

  const handleFileSelect = (key, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  /* 이거는 파일 두 개 보낼 때 쯤 쓸 듯..
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file1", selectedFiles.file1);
    formData.append("file2", selectedFiles.file2);

    try {
      const response = await fetch("http://localhost:8000/upload/image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      alert("업로드 완료!");
      if (onFileUpload) {
        onFileUpload(result); // 업로드 결과를 상위 컴포넌트로 전달 (선택 사항)
      }
    } catch (error) {
      console.error(error);
      alert("업로드 실패");
    }
  };
*/
  const handleUpload = async () => {
    if (!selectedFiles.file1) {
      if (onFileUpload) {
        onFileUpload("error", "업로드할 첫 번째 파일이 선택되지 않았습니다.");
      } else {
        alert("업로드할 첫 번째 파일이 선택되지 않았습니다.");
      }
      return;
    }

    // 업로드 시작 시 로딩 상태 true
    const formData = new FormData();
    formData.append("file", selectedFiles.file1);

    try {
      const response = await fetch("http://localhost:8000/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // 서버로부터의 텍스트 응답
        console.error("업로드 실패 (서버 응답):", errorText);
        const errorMessage = `업로드 실패: ${errorText || response.statusText}`;
        if (onFileUpload) {
          onFileUpload("error", errorMessage); // 부모에게 에러 메시지 전달
        }
        // alert(errorMessage); // 기존 alert 제거
        // 업로드 실패 시 로딩 상태 false
        return;
      }

      const result = await response.json();
      console.log("업로드 완료:", result);
      console.log("업로드 완료 (HTML 응답):", result); // HTML 내용 출력
      if (onFileUpload) {
        onFileUpload("success", result); // 부모에게 성공 메시지 및 결과 전달
      }
      // alert("업로드 완료!"); // 기존 alert 제거
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      const networkErrorMessage =
        "업로드 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.";
      if (onFileUpload) {
        onFileUpload("error", networkErrorMessage); // 부모에게 네트워크 오류 메시지 전달
      }
      // alert(networkErrorMessage); // 기존 alert 제거
    }
  };

  return (
    <div className="min-w-5xl max-w-7xl mt-10 p-6 justify-center">
      {/* 탭 스타일 단계 표시 */}
      <div className="flex border-b border-gray-300/50">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 cursor-pointer  ${
              step === s.id
                ? "border-blue-500 text-blue-600 bg-[#e0f2fe] hover:bg-[#d1eaff] scale-110 shadow-sm rounded-t"
                : "border-transparent text-gray-500 hover:text-gray-700 bg-[#f8fafc]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 단계별 카드 스타일 컨텐츠 */}
      <div className="flex transition-all duration-200 h-95">
        {steps.map((s) => {
          const isActive = step === s.id;
          return (
            <div
              key={s.id}
              className={`transition-all duration-300 animated slow rounded-xl shadow-sm ${
                isActive
                  ? "flex-[2] bg-white/50 p-6"
                  : "flex-[1] bg-blue-50/50 p-3 hover:bg-blue-100/50 cursor-pointer ease-in-out"
              } flex flex-col items-center justify-center`}
              onClick={() => setStep(s.id)}
            >
              <h2 className="font-bold text-lg my-3">{s.label}</h2>
              <div className="text-center text-lg w-full justify-center">
                {isActive ? (
                  <>
                    {s.id === 1 && (
                      <>
                        <FileUploader
                          className="min-h-[280px]"
                          filetype={fileUploadData1.filetype}
                          fileExtensions={fileUploadData1.fileExtensions}
                          fileExtensionsText={
                            fileUploadData1.fileExtensionsText
                          }
                          onFileSelect={(file) =>
                            handleFileSelect("file1", file)
                          }
                          selectedFile={selectedFiles.file1}
                        />
                      </>
                    )}
                    {s.id === 2 && (
                      <>
                        {step === 2 && (
                          <div className="flex flex-col space-y-4 w-[450px]">
                            {[1, 2].map((i) => (
                              <div
                                key={i}
                                className={`transition-all duration-400 animated slower rounded-xl shadow-sm ease-in-out ${
                                  subStep === i
                                    ? "bg-white/70 opacity-100 p-6"
                                    : "bg-blue-50/50 cursor-pointer p-3"
                                }`}
                                onClick={() => setSubStep(i)}
                              >
                                <h3 className="transition-opacity">
                                  {i === 1 ? "배경 이미지" : "마스코트 이미지"}
                                </h3>

                                {subStep === i && (
                                  <div className="mt-2 h-35">
                                    {i === 1 ? (
                                      <FileUploader
                                        className="h-full"
                                        filetype={fileUploadData2.filetype}
                                        fileExtensions={
                                          fileUploadData2.fileExtensions
                                        }
                                        fileExtensionsText={
                                          fileUploadData2.fileExtensionsText
                                        }
                                        onFileSelect={(file) =>
                                          handleFileSelect("file2", file)
                                        }
                                        selectedFile={selectedFiles.file2}
                                      />
                                    ) : (
                                      <FaceFilter
                                        onSelect={(file) =>
                                          handleFileSelect("file2", file)
                                        }
                                        selected={selectedFiles.file2}
                                      />
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    {s.id === 3 && (
                      <>
                        <button
                          onClick={handleUpload}
                          className="mt-2 px-10 py-5 bg-blue-500 text-2xl text-white rounded-2xl hover:bg-sky-700 ease-in-out transition delay-150 duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-blue-400"
                        >
                          업로드 실행
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 truncate">{s.summary}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepperUploader;

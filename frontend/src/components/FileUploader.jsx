import React from "react";
export const FileUploader = ({
  filetype,
  fileExtensionsText,
  fileExtensions,
  onFileSelect,
  selectedFile, // 부모에서 전달받는 선택된 파일
  className = "",
  ...props
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="relative mb-2">
      <input
        id={`id-dropzone-${filetype}`} // 고유 id 부여
        name={`file-upload-${filetype}`}
        type="file"
        className="hidden peer"
        accept={fileExtensions}
        onChange={handleFileChange}
      />
      <label
        htmlFor={`id-dropzone-${filetype}`}
        className={`flex flex-col items-center justify-center gap-6 p-5 peer-hover:border-blue-400 peer-focus:border-blue-500 text-center border border-dashed rounded cursor-pointer border-slate-300 ${className}`}
        {...props}
      >
        <div className="p-3 text-center">
          {!selectedFile && (
            <>
              <span className="text-[#2c7eff] text-m mb-1">
                {filetype}{" "}
                <span className="text-gray-900">
                  업로드 하거나 파일 끌어오기
                </span>
                <br />
              </span>
              <span className="text-gray-900 text-l">
                가능 파일 : {fileExtensionsText}
              </span>
            </>
          )}
          {selectedFile && (
            <span className="text-black text-l">{selectedFile.name}</span>
          )}
        </div>
      </label>
      <br />
    </div>
  );
};

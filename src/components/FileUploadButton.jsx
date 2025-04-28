import React, { useState } from "react";

export const FileUplodButton = ({
  filetype,
  fileExtensionsText,
  fileExtensions,
}) => {
  const [selectedFile, setSelectedFile] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  return (
    <>
      <div class="relative mb-2">
        <input
          id="id-dropzone02"
          name="file-upload"
          type="file"
          className="hidden peer"
          accept={fileExtensions}
          onChange={handleFileChange}
        />
        <label
          for="id-dropzone02"
          className="flex flex-col items-center gap-6 px-10 py-10 text-center border border-dashed rounded cursor-pointer border-slate-300 xl:px-30"
        >
          <div className="p-3">
            {!selectedFile && (
              <>
                <span className="text-blue-500 text-sm mb-1">
                  Upload {filetype}{" "}
                  <span className="text-white">or drag and drop</span>
                  <br />
                </span>
                <span className="text-white text-l">{fileExtensionsText}</span>
              </>
            )}
            {/* 파일이 선택되면 파일 이름만 표시 */}
            {selectedFile && (
              <span className="text-white text-l">{selectedFile.name}</span>
            )}
          </div>
        </label>
        <br></br>
        <button className="inline-flex items-center justify-center h-10 gap-2 px-5 py-3 text-sm font-medium tracking-wide transition duration-300 rounded focus-visible:outline-none justify-self-center whitespace-nowrap bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-600 focus:bg-blue-200 focus:text-blue-700 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-100 disabled:text-blue-400 disabled:shadow-none">
          <span>Upload</span>
        </button>
      </div>
    </>
  );
};

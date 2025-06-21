// Header.jsx
import React, { forwardRef } from "react";
import "../assets/animate.css";
import "@lottiefiles/lottie-player"; // 이 부분 추가

export const Header = forwardRef((props, ref) => {
  const { title, strong, description, children } = props;

  return (
    <>
      <div
        ref={ref}
        className="py-16 static px-8 h-screen w-screen items-center flex flex-row bg-gradient-to-b from-[#0e2a50] to-[#42637d] place-content-start dark:bg-gray-900 rounded-b-[150px] overflow-hidden"
      >
        <div className="flex-none max-w-none py-16 pl-[3vw]">
          <div className="mx-auto text-start px-4 fadeInDown animated slow">
            <h1 className="text-5xl font-bold text-gray-100">
              {title}
              <br />

              <strong className="text-transparent bg-clip-text text-[55px] bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
                {strong}
              </strong>
            </h1>
            <p className="mt-4 text-base text-pretty text-gray-200">
              {description}
            </p>
            <div className="flex gap-4 mt-6">{children}</div>
          </div>
        </div>

        <div className="flex ml-4 static fadeInDown animated slow items-center justify-center">
          <lottie-player
            src="../Lotty2.json" // 또는 직접 업로드한 JSON 파일 경로
            background="transparent"
            speed="1"
            style={{ width: "500px", height: "500px" }}
            className="ml-5 mt-5 z-10 "
            loop
            autoplay
          ></lottie-player>

          <svg
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute w-[650px] h-[650px] -z-0"
          >
            <path
              fill="#F2F4F8"
              d="M46.2,-72C60.8,-62.4,74.2,-51.2,81,-36.9C87.7,-22.5,87.7,-4.9,85.1,12.2C82.5,29.3,77.4,45.9,67.1,58.5C56.8,71.2,41.4,79.8,24.8,84.7C8.3,89.7,-9.4,91,-25,86C-40.5,81,-53.9,69.7,-63.9,56.4C-73.9,43,-80.4,27.8,-82.9,11.8C-85.4,-4.2,-83.7,-20.8,-77.1,-35.2C-70.6,-49.7,-59.1,-61.8,-45.4,-71.8C-31.7,-81.9,-15.9,-89.8,0,-89.7C15.8,-89.6,31.6,-81.6,46.2,-72Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </div>
    </>
  );
});
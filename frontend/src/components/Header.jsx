// Header.jsx
import React, { forwardRef } from "react";
import "../assets/animate.css";

export const Header = forwardRef((props, ref) => {
  const { title, strong, description, children } = props;

  return (
    <div
      ref={ref}
      className="lg:grid py-8 px-8 shado h-screen bg-gradient-to-b from-[#0b2240] to-[#273c4c] place-content-center dark:bg-gray-900 rounded-b-[70px]"
    >
      <div className="mx-auto max-w-none px-16 py-16 sm:px-[5vw] sm:py-24 lg:px-[3vw] lg:py-32">
        <div className="mx-auto text-center px-4 fadeInDown animated slow">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-100">
            {title}
            <br />

            <strong className="text-transparent bg-clip-text lg:text-[65px] sm:text-5xl bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500">
              {strong}
            </strong>
          </h1>
          <p className="mt-4 text-base text-pretty sm:text-lg/relaxed text-gray-200">
            {description}
          </p>
          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

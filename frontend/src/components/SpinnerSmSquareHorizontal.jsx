import React from "react";

export default function SpinnerSmSquareHorizontal() {
  return (
    <>
      {/*<!-- Component: Square horizontal sm sized spinner  --> */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-live="polite"
        aria-busy="true"
      >
        <path
          d="M7 10H3V14H7V10Z"
          className="animate animate-bounce fill-white"
        />
        <path
          d="M14 10H10V14H14V10Z"
          className="animate animate-bounce fill-white [animation-delay:.2s]"
        />
        <path
          d="M21 10H17V14H21V10Z"
          className="animate animate-bounce fill-white [animation-delay:.4s]"
        />
      </svg>
      {/*<!-- End Square horizontal sm sized spinner  --> */}
    </>
  );
}
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Navbar({ onFeatureClick, onFileCategoryClick }) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  const location = useLocation();

  // 페이지가 마스킹 페이지인지 확인해서 home, feature, masking 버튼을 보여줄지 결정
  const isMaskingPage =
    location.pathname === "/pages/Document" ||
    location.pathname === "/pages/Image" ||
    location.pathname === "/pages/Video";
  const isDocumentPage = location.pathname === "/pages/Document";
  const isImagePage = location.pathname === "/pages/Image";
  const isVideoPage = location.pathname === "/pages/Video";

  return (
    <header className="fixed z-20 w-full border-b border-slate-200 bg-white/90 shadow-lg shadow-slate-700/5">
      <div className="relative mx-auto max-w-full px-6 lg:max-w-5xl xl:max-w-7xl 2xl:max-w-[96rem]">
        <nav
          aria-label="main navigation"
          className="flex h-[3.7rem] items-stretch justify-between font-medium text-slate-700"
          role="navigation"
        >
          <Link
            to="/"
            id="WindUI"
            aria-label="WindUI logo"
            aria-current="page"
            className="flex items-center gap-2 whitespace-nowrap py-3 text-lg focus:outline-none lg:flex-1"
          >
            <img
              src="/logo.png" // 또는 public/logo.png 등 경로
              alt="Masky Logo"
              className="h-18 w-auto ml-[-300px]"
            />
          </Link>

          <button
            className={`relative order-10 block h-10 w-10 self-center lg:hidden ${
              isToggleOpen
                ? "visible opacity-100 [&_span:nth-child(1)]:w-6 [&_span:nth-child(1)]:translate-y-0 [&_span:nth-child(1)]:rotate-45 [&_span:nth-child(2)]:-rotate-45 [&_span:nth-child(3)]:w-0 "
                : ""
            }`}
            onClick={() => setIsToggleOpen(!isToggleOpen)}
            aria-expanded={isToggleOpen ? "true" : "false"}
            aria-label="Toggle navigation"
          >
            <div className="absolute left-1/2 top-1/2 w-6 -translate-x-1/2 -translate-y-1/2 transform">
              <span
                aria-hidden="true"
                className="absolute block h-0.5 w-9/12 -translate-y-2 transform rounded-full bg-slate-900 transition-all duration-300"
              ></span>
              <span
                aria-hidden="true"
                className="absolute block h-0.5 w-6 transform rounded-full bg-slate-900 transition duration-300"
              ></span>
              <span
                aria-hidden="true"
                className="absolute block h-0.5 w-1/2 origin-top-left translate-y-2 transform rounded-full bg-slate-900 transition-all duration-300"
              ></span>
            </div>
          </button>
          <ul
            role="menubar"
            aria-label="Select page"
            className={`absolute left-0 top-0 z-[-1] h-[28.5rem] w-full justify-center overflow-hidden bg-white/90 px-8 pb-12 pt-24 font-medium transition-[opacity,visibility] duration-300 lg:visible lg:relative lg:top-0 lg:z-0 lg:flex lg:h-full lg:w-auto lg:items-stretch lg:overflow-visible lg:bg-white/0 lg:px-0 lg:py-0 lg:pt-0 lg:opacity-100 ${
              isToggleOpen ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            {isMaskingPage && (
              <>
                <li role="none" className="flex items-stretch">
                  <Link
                    to="/"
                    role="menuitem"
                    aria-haspopup="false"
                    className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
                  >
                    <span>home</span>
                  </Link>
                </li>

                <li role="none" className="flex items-stretch">
                  <div className="group w-full">
                    <span className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8 cursor-pointer">
                      Masking
                    </span>
                    <ul
                      className={`
              w-full text-left lg:border lg:rounded-sm
              ${isToggleOpen ? "block" : "hidden"} 
              lg:left-0 lg:mt-1 lg:rounded lg:bg-white/90 lg:shadow-lg lg:group-hover:block lg:shadow-slate-700/5
              lg:border-b lg:border-slate-200 lg:text-center lg:ease-in-out
              `}
                    >
                      {isDocumentPage ? (
                        <li className="text-gray-500 cursor-not-allowed p-2 border-b border-gray-200">
                          문서 마스킹
                        </li>
                      ) : (
                        <li className="transition-colors duration-300 hover:bg-blue-500/85 p-2 hover:text-white border-b border-gray-200 rounded-t-sm delay-75 ease-in-out">
                          <Link to="/pages/Document">문서 마스킹</Link>
                        </li>
                      )}
                      {isImagePage ? (
                        <li className="text-gray-500 cursor-not-allowed p-2">
                          이미지 마스킹
                        </li>
                      ) : (
                        <li className="transition-colors duration-400 hover:bg-blue-500/80 hover:text-white p-2 delay-75 ease-in-out">
                          <Link to="/pages/Image">이미지 마스킹</Link>
                        </li>
                      )}
                      {isVideoPage ? (
                        <li className="text-gray-500 cursor-not-allowed p-2 border-t border-gray-200">
                          동영상 마스킹
                        </li>
                      ) : (
                        <li className="transition-colors duration-300 hover:bg-blue-500/85 hover:text-white p-2 border-t border-gray-200 rounded-b-sm ease-in-out delay-75">
                          <Link to="/pages/Video">동영상 마스킹</Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </li>
              </>
            )}

            {!isMaskingPage && (
              <>
                <li role="none" className="flex items-stretch">
                  <Link
                    to="/"
                    role="menuitem"
                    aria-haspopup="false"
                    className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
                  >
                    <span>home</span>
                  </Link>
                </li>
                <li role="none" className="flex items-stretch">
                  <button
                    onClick={onFeatureClick}
                    className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-600 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
                  >
                    <span>Features</span>
                  </button>
                </li>
                <li role="none" className="flex items-stretch">
                  <button
                    onClick={onFileCategoryClick}
                    className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
                  >
                    <span>Masking</span>
                  </button>
                </li>
              </>
            )}
            <li role="none" className="flex items-stretch">
              <Link
                to="/pages/About"
                role="menuitem"
                aria-haspopup="false"
                className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
              >
                <span>About</span>
              </Link>
            </li>
            <li role="none" className="flex items-stretch">
              <Link
                to="/"
                role="menuitem"
                aria-haspopup="false"
                className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
              >
                <span>Sign In</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

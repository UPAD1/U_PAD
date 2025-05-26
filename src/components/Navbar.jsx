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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100"
              height="35"
              viewBox="0 0 165 35"
              fill="none"
            >
              <path
                d="M16.7223 34.768C11.5703 34.768 7.55425 33.376 4.67425 30.592C1.79425 27.808 0.35425 23.904 0.35425 18.88V0.399998H11.6823V18.544C11.6823 21.104 12.1463 22.928 13.0743 24.016C14.0023 25.072 15.2503 25.6 16.8183 25.6C18.4183 25.6 19.6663 25.072 20.5623 24.016C21.4903 22.928 21.9543 21.104 21.9543 18.544V0.399998H33.0903V18.88C33.0903 23.904 31.6503 27.808 28.7703 30.592C25.8903 33.376 21.8743 34.768 16.7223 34.768ZM37.7069 24.208V16.048H52.1069V24.208H37.7069ZM56.986 34V0.399998H73.162C76.298 0.399998 79.002 0.911998 81.274 1.936C83.578 2.96 85.354 4.432 86.602 6.352C87.85 8.24 88.474 10.48 88.474 13.072C88.474 15.664 87.85 17.904 86.602 19.792C85.354 21.68 83.578 23.152 81.274 24.208C79.002 25.232 76.298 25.744 73.162 25.744H63.274L68.314 20.896V34H56.986ZM68.314 22.144L63.274 17.008H72.442C74.01 17.008 75.162 16.656 75.898 15.952C76.666 15.248 77.05 14.288 77.05 13.072C77.05 11.856 76.666 10.896 75.898 10.192C75.162 9.488 74.01 9.136 72.442 9.136H63.274L68.314 4V22.144ZM86.8536 34L101.542 0.399998H112.678L127.366 34H115.654L104.806 5.776H109.222L98.3736 34H86.8536ZM95.5896 28.144L98.4696 19.984H113.926L116.806 28.144H95.5896ZM129.174 34V0.399998H145.734C149.478 0.399998 152.774 1.088 155.622 2.464C158.47 3.808 160.694 5.728 162.294 8.224C163.894 10.72 164.694 13.696 164.694 17.152C164.694 20.64 163.894 23.648 162.294 26.176C160.694 28.672 158.47 30.608 155.622 31.984C152.774 33.328 149.478 34 145.734 34H129.174ZM140.502 25.168H145.254C146.854 25.168 148.246 24.864 149.43 24.256C150.646 23.648 151.59 22.752 152.262 21.568C152.934 20.352 153.27 18.88 153.27 17.152C153.27 15.456 152.934 14.016 152.262 12.832C151.59 11.648 150.646 10.752 149.43 10.144C148.246 9.536 146.854 9.232 145.254 9.232H140.502V25.168Z"
                fill="#2c7eff"
              />
            </svg>
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
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    role="menuitem"
                    aria-haspopup="false"
                    className="flex items-center gap-2 py-4 transition-colors duration-300 hover:text-blue-500 focus:text-blue-600 focus:outline-none focus-visible:outline-none lg:px-8"
                  >
                    <span>Home</span>
                  </button>
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

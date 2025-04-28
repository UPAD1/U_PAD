export const Footer = () => {
  return (
    <footer className="bg-gray-900">
      <div className="relative mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="absolute end-4 top-4 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
          <a
            className="inline-block rounded-full p-2 shadow-sm transition sm:p-3 lg:p-4 bg-gray-700 text-blue-400 hover:bg-gray-500"
            href="#Header"
          >
            <span className="sr-only">Back to top</span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>

        <div className="lg:flex lg:items-end lg:justify-between">
          <div>
            <div className="flex justify-center lg:justify-start text-teal-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="165"
                height="35"
                viewBox="0 0 165 35"
                fill="none"
              >
                <path
                  d="M16.7223 34.768C11.5703 34.768 7.55425 33.376 4.67425 30.592C1.79425 27.808 0.35425 23.904 0.35425 18.88V0.399998H11.6823V18.544C11.6823 21.104 12.1463 22.928 13.0743 24.016C14.0023 25.072 15.2503 25.6 16.8183 25.6C18.4183 25.6 19.6663 25.072 20.5623 24.016C21.4903 22.928 21.9543 21.104 21.9543 18.544V0.399998H33.0903V18.88C33.0903 23.904 31.6503 27.808 28.7703 30.592C25.8903 33.376 21.8743 34.768 16.7223 34.768ZM37.7069 24.208V16.048H52.1069V24.208H37.7069ZM56.986 34V0.399998H73.162C76.298 0.399998 79.002 0.911998 81.274 1.936C83.578 2.96 85.354 4.432 86.602 6.352C87.85 8.24 88.474 10.48 88.474 13.072C88.474 15.664 87.85 17.904 86.602 19.792C85.354 21.68 83.578 23.152 81.274 24.208C79.002 25.232 76.298 25.744 73.162 25.744H63.274L68.314 20.896V34H56.986ZM68.314 22.144L63.274 17.008H72.442C74.01 17.008 75.162 16.656 75.898 15.952C76.666 15.248 77.05 14.288 77.05 13.072C77.05 11.856 76.666 10.896 75.898 10.192C75.162 9.488 74.01 9.136 72.442 9.136H63.274L68.314 4V22.144ZM86.8536 34L101.542 0.399998H112.678L127.366 34H115.654L104.806 5.776H109.222L98.3736 34H86.8536ZM95.5896 28.144L98.4696 19.984H113.926L116.806 28.144H95.5896ZM129.174 34V0.399998H145.734C149.478 0.399998 152.774 1.088 155.622 2.464C158.47 3.808 160.694 5.728 162.294 8.224C163.894 10.72 164.694 13.696 164.694 17.152C164.694 20.64 163.894 23.648 162.294 26.176C160.694 28.672 158.47 30.608 155.622 31.984C152.774 33.328 149.478 34 145.734 34H129.174ZM140.502 25.168H145.254C146.854 25.168 148.246 24.864 149.43 24.256C150.646 23.648 151.59 22.752 152.262 21.568C152.934 20.352 153.27 18.88 153.27 17.152C153.27 15.456 152.934 14.016 152.262 12.832C151.59 11.648 150.646 10.752 149.43 10.144C148.246 9.536 146.854 9.232 145.254 9.232H140.502V25.168Z"
                  fill="#2c7eff"
                />
              </svg>
            </div>

            <p className="mx-auto mt-6 max-w-md text-center leading-relaxed lg:text-left text-gray-400">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Incidunt
              consequuntur amet culpa cum itaque neque.
            </p>
          </div>

          <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:mt-0 lg:justify-end lg:gap-12">
            <li>
              <a className="transition text-white hover:text-white/75" href="#">
                About
              </a>
            </li>

            <li>
              <a className="transition text-white hover:text-white/75" href="#">
                Services
              </a>
            </li>

            <li>
              <a className="transition text-white hover:text-white/75" href="#">
                Projects
              </a>
            </li>

            <li>
              <a className="transition text-white hover:text-white/75" href="#">
                Blog
              </a>
            </li>
          </ul>
        </div>

        <p className="mt-12 text-center text-sm text-gray-500 lg:text-right dark:text-gray-400">
          Copyright &copy; 2022. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

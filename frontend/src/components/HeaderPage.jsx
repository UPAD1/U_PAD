import "../assets/animate.css";
export const HeaderPage = ({ title, strong, description, children }) => {
  return (
    <div className="lg:grid py-8 px-8 h-screen shado bg-gradient-to-b from-[#fcfcfc] from-50% to-[#a2cbeb] place-content-center dark:bg-gray-900 rounded-b-[70px]">
      <div className="mx-auto max-w-5xl w-full pt-3 px-5 sm:px-[5vw] lg:px-[3vw]">
        <div className="mx-auto text-center fadeInUp animated slow">
          <h1 className="text-4xl font-bold sm:text-5xl text-gray-900 xs:text-xl whitespace-nowrap items-center">
            {title}
            <br />
            <strong className="text-[#2c7eff]">{strong}</strong>
          </h1>
          <p className="mt-4 text-base text-pretty sm:text-lg/relaxed text-gray-900">
            {description}
          </p>
          {/* 원래 이 안에만 있었는데 */}
          {/* 버튼 같은 작은 거는 이 아래 flex 유지 */}
          <div className="flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
};
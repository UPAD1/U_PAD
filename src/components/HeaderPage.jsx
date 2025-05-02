// Header.jsx
export const HeaderPage = ({ title, strong, description, children }) => {
  return (
    <div className="lg:grid py-8 px-8 shado h-screen bg-gradient-to-b from-white from-50% to-[#d3ecff] place-content-center dark:bg-gray-900 rounded-b-[70px]">
      <div className="mx-auto max-w-none px-16 py-16 sm:px-[5vw] sm:py-24 lg:px-[3vw] lg:py-32">
        <div className="mx-auto max-w-prose text-center px-4">
          <h1 className="text-4xl font-bold sm:text-5xl text-gray-900">
            {title}
            <br />
            <strong className="text-[#2c7eff]">{strong}</strong>
          </h1>
          <p className="mt-4 text-base text-pretty sm:text-lg/relaxed text-gray-900">
            {description}
          </p>
          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

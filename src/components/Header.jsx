// Header.jsx
export const Header = ({ title, strong, description, children }) => {
  return (
    <div className="lg:grid py-4 px-8 shadow lg:place-content-center bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-[7vw] py-16 sm:px-[5vw] sm:py-24 lg:px-[3vw] lg:py-32">
        <div className="mx-auto max-w-prose text-center px-4">
          <h1 className="text-4xl font-bold sm:text-5xl text-white">
            {title}
            <br />
            <strong className="text-blue-500">{strong}</strong>
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
};

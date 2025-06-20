export const MaskSelectButton = ({ onClick, selected, children }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 hover:translate-x-[1px] hover:translate-y-[1px]  ${
        selected
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-800 hover:bg-blue-100"
      }`}
    >
      {children}
    </button>
  );
};

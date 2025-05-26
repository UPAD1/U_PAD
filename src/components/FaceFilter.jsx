// 간단한 예시
export const FaceFilter = ({ onSelect, selected }) => {
  const sampleImages = [
    { name: "기본 토끼", url: "../bunny.png" },
    { name: "기본 곰1", url: "../bear1.png" },
    { name: "기본 곰2", url: "../bear2.png" },
    { name: "기본 고양이", url: "../cat.png" },
  ];

  return (
    <div className="flex flex-row row-span-6 space-x-2 overflow-y-scroll snap-x w-full custom-scrollbar">
      {sampleImages.map((img) => (
        <div
          key={img.url}
          className={`p-2 border rounded cursor-pointer hover:bg-blue-200/20 ease-in-out snap-start min-w-[120px] max-w-[120px] ${
            selected?.name === img.name ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => onSelect(img)}
        >
          <p>{img.name}</p>
          <img src={img.url} alt={img.name} className="w-full h-auto" />
        </div>
      ))}
    </div>
  );
};

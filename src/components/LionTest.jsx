import { Stage, Layer, Image } from "react-konva";
import { useState, useEffect } from "react";
import useImage from "use-image";
import Konva from "konva";

export const LionTest = () => {
  const [images, setImages] = useState([
    { id: "img-1", x: 50, y: 50, filter: "none" },
    { id: "img-2", x: 150, y: 50, filter: "blur" },
  ]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [lionImage] = useImage(
    "https://konvajs.org/assets/lion.png",
    "anonymous"
  );

  useEffect(() => {
    if (lionImage) {
      setHistory([JSON.stringify(images)]);
    }
  }, [lionImage, images]);

  const handleDragEnd = (index, e) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setImages(newImages);
    saveHistory(newImages);
  };

  const handleClick = (index) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      filter: newImages[index].filter === "none" ? "blur" : "none",
    };
    setImages(newImages);
    saveHistory(newImages);
  };

  const saveHistory = (newImages) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.stringify(newImages));
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleAdd = () => {
    const newImages = [
      ...images,
      {
        id: `img-${Date.now()}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        filter: "none",
      },
    ];
    setImages(newImages);
    saveHistory(newImages);
  };

  const handleUndo = () => {
    if (historyStep === 0) return;
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    setImages(JSON.parse(history[newStep]));
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    setImages(JSON.parse(history[newStep]));
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
        }}
      >
        <button style={{ margin: "0 5px" }} onClick={handleAdd}>
          Add Image
        </button>
        <button style={{ margin: "0 5px" }} onClick={handleUndo}>
          Undo
        </button>
        <button style={{ margin: "0 5px" }} onClick={handleRedo}>
          Redo
        </button>
      </div>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {lionImage &&
            images.map((img) => (
              <Image
                key={img.id}
                image={lionImage}
                x={img.x}
                y={img.y}
                width={100}
                height={100}
                draggable
                filters={img.filter === "blur" ? [Konva.Filters.Blur] : []}
                blurRadius={img.filter === "blur" ? 10 : 0}
                onDragEnd={(e) => handleDragEnd(img.id, e)}
                onClick={() => handleClick(img.id)}
              />
            ))}
        </Layer>
      </Stage>
    </div>
  );
};

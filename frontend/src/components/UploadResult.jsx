import React, { useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Group } from "react-konva";
import "../assets/animate.css"; // 이 파일이 프로젝트에 존재하고 필요하다고 가정합니다.

export const UploadResult = ({ onClose, imageUrl }) => {
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [undoStack, setUndoStack] = useState([]);
  const [selectedRectId, setSelectedRectId] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const maxWidth = 750;
      const maxHeight = 500;
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const scale = Math.min(scaleX, scaleY);

      setImage(img);
      setImagePosition({
        x: (maxWidth - img.width * scale) / 2,
        y: (maxHeight - img.height * scale) / 2,
      });
      setImageScale(scale);
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Stage 자체를 클릭했는지, 아니면 Shape를 클릭했는지 확인
    const clickedOnShape = e.target !== stage;

    if (!drawingMode) {
      if (!clickedOnShape) {
        // Stage의 빈 공간을 클릭했을 때
        setSelectedRectId(null);
      }
      // drawingMode가 false일 때는 이미지 패닝이나 개별 Rect 조작이므로 Stage의 onMouseDown은 추가 동작 안 함
      return;
    }

    // 그리기 모드일 때만 새 사각형 그리기 시작
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const adjustedX = (pointerPos.x - imagePosition.x) / imageScale;
    const adjustedY = (pointerPos.y - imagePosition.y) / imageScale;

    setStartPos({ x: adjustedX, y: adjustedY });
    setNewRect({
      x: adjustedX,
      y: adjustedY,
      width: 0,
      height: 0,
      id: `temp-rect-${Date.now()}`,
    });
    setIsDrawing(true);
    setSelectedRectId(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos || !newRect) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const adjustedX = (pointerPos.x - imagePosition.x) / imageScale;
    const adjustedY = (pointerPos.y - imagePosition.y) / imageScale;

    setNewRect((prev) => ({
      ...prev,
      x: Math.min(startPos.x, adjustedX),
      y: Math.min(startPos.y, adjustedY),
      width: Math.abs(adjustedX - startPos.x),
      height: Math.abs(adjustedY - startPos.y),
    }));
  };

  const handleMouseUp = () => {
    if (isDrawing && newRect && newRect.width > 0 && newRect.height > 0) {
      const finalRect = {
        ...newRect,
        fill: "skyblue",
        draggable: true,
        id: `rect-${rectangles.length}-${Date.now()}`,
      };
      setRectangles([...rectangles, finalRect]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setNewRect(null);
  };

  const handleRectDragStart = (e, index) => {
    if (drawingMode) return;
    setSelectedRectId(index);
    e.target.stopEvent(); // 이벤트 전파 중단!
  };

  const handleRectDragEnd = (e, draggedRectIndex) => {
    if (drawingMode) return;
    const newX = e.target.x();
    const newY = e.target.y();
    const updatedRects = rectangles.map((rect, index) =>
      index === draggedRectIndex ? { ...rect, x: newX, y: newY } : rect
    );
    setRectangles(updatedRects);
    // e.target.stopEvent(); // 드래그 종료 시에는 보통 필요 없지만, 상황에 따라 추가
  };

  const handleRectClick = (e, index) => {
    if (drawingMode) return;
    setSelectedRectId(index);
    e.target.stopEvent(); // 이벤트 전파 중단! Stage의 onClick 등으로 번지는 것 방지
  };

  const handleUndo = () => {
    if (rectangles.length > 0) {
      const lastRect = rectangles[rectangles.length - 1];
      setUndoStack([...undoStack, lastRect]);
      setRectangles(rectangles.slice(0, -1));
      setSelectedRectId(null);
    }
  };

  const handleDelete = () => {
    if (selectedRectId !== null && rectangles[selectedRectId]) {
      setRectangles(rectangles.filter((_, i) => i !== selectedRectId));
      setSelectedRectId(null);
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) setSelectedRectId(null);
      return newMode;
    });
  };

  return (
    <>
      <div>
        <div className="min-w-5xl max-w-7xl mt-10 justify-center bg-gray-50 rounded-2xl fadeInUp animated faster">
          <div className="flex transition-all duration-200 h-[500px]">
            <div className="transition-all duration-300 animated slow rounded-xl flex-[2] bg-blue-100/50 shadow-[0px_-1px_33px_-27px_rgba(102,_102,_102,_1)] p-20 flex flex-col items-center justify-center aspect-[3/2] overflow-hidden">
              <Stage
                width={750}
                height={500}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <Layer>
                  {image && (
                    <Group
                      x={imagePosition.x}
                      y={imagePosition.y}
                      scaleX={imageScale}
                      scaleY={imageScale}
                      draggable={!drawingMode} // 그리기 모드가 아닐 때만 이미지 그룹 드래그 가능
                      onDragStart={(e) => {
                        // 이미지 그룹 드래그 시작
                        if (drawingMode) return;
                        // console.log("Image Group Drag START");
                      }}
                      onDragEnd={(e) => {
                        // 이미지 그룹 드래그 종료
                        if (drawingMode) return;
                        // console.log("Image Group Drag END");
                        setImagePosition({ x: e.target.x(), y: e.target.y() });
                      }}
                      dragBoundFunc={(pos) => {
                        if (drawingMode) return imagePosition;
                        const stageWidth = 750;
                        const stageHeight = 500;
                        const groupWidth = image.width * imageScale;
                        const groupHeight = image.height * imageScale;
                        const newX = Math.max(
                          stageWidth - groupWidth,
                          Math.min(pos.x, 0)
                        );
                        const newY = Math.max(
                          stageHeight - groupHeight,
                          Math.min(pos.y, 0)
                        );
                        return { x: newX, y: newY };
                      }}
                    >
                      <KonvaImage image={image} />
                      {rectangles.map((rect, i) => (
                        <Rect
                          key={rect.id || i}
                          {...rect}
                          draggable={!drawingMode && rect.draggable}
                          stroke={selectedRectId === i ? "red" : "black"}
                          strokeWidth={
                            selectedRectId === i
                              ? 2 / imageScale
                              : 1 / imageScale
                          }
                          onClick={(e) => handleRectClick(e, i)} // 수정된 핸들러
                          onTap={(e) => handleRectClick(e, i)} // 수정된 핸들러 (터치용)
                          onDragStart={(e) => handleRectDragStart(e, i)} // 수정된 핸들러
                          onDragEnd={(e) => handleRectDragEnd(e, i)}
                        />
                      ))}
                      {isDrawing && newRect && (
                        <Rect
                          x={newRect.x}
                          y={newRect.y}
                          width={newRect.width}
                          height={newRect.height}
                          fill="rgba(135, 206, 250, 0.5)"
                          stroke="rgb(135, 206, 250)"
                          strokeWidth={1 / imageScale}
                          dash={[4 / imageScale, 4 / imageScale]}
                          listening={false}
                        />
                      )}
                    </Group>
                  )}
                </Layer>
              </Stage>
            </div>
            {/* tool bar */}
            <div className="transition-all duration-300 animated slow rounded-xl shadow-sm flex-grow-0 bg-blue-50/50 p-3 flex flex-col">
              <div className="flex flex-col justify-start items-start flex-1 gap-3">
                <div className="flex p-2 w-full">
                  <div
                    className={`flex items-center justify-between gap-3 bg-white bg-opacity-80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg max-w-md mx-auto transition-all duration-300 hover:shadow-xl hover:bg-opacity-90 ${
                      drawingMode ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleDelete}
                        disabled={selectedRectId === null || drawingMode}
                        className="focus:outline-none mx-2 transition-transform duration-200 ease-in-out hover:scale-110 rounded-full focus:text-blue-500 focus:ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6 transform transition-transform duration-300 hover:scale-120 hover:text-blue-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-12.5 left-1/2 transform text-nowrap -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        삭제
                      </span>
                    </div>
                    <div className="group relative justify-center flex">
                      <button
                        onClick={toggleDrawingMode}
                        className={`focus:outline-none mx-2 transition-transform duration-200 ease-in-out hover:scale-110 rounded-full ${
                          drawingMode ? "text-blue-500" : "focus:text-blue-500"
                        }`}
                      >
                        <svg
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="size-7 transform transition-transform duration-300 hover:scale-120 hover:text-blue-500"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          ></path>
                        </svg>
                      </button>
                      <span className="absolute -top-12 left-1/2 transform text-nowrap -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        {drawingMode ? "선택 모드" : "추가"}
                      </span>
                    </div>
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleUndo}
                        disabled={rectangles.length === 0 || drawingMode}
                        className="focus:outline-none mx-2 transition-transform duration-200 ease-in-out hover:scale-110 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="size-5 transform transition-transform duration-300 hover:scale-120 hover:text-blue-500"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-13 left-1/2 text-nowrap transform -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        이전
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="bg-red-400 ml-auto hover:bg-red-500 text-white rounded-full p-2 shadow-[0px_-1px_33px_-27px_rgba(102,_102,_102,_1)] hover:shadow-sm transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-row text-xs gap-2 col-span-1 mt-1 px-2">
                  <button
                    title="삭제 (선택된 항목)"
                    onClick={handleDelete}
                    disabled={selectedRectId === null || drawingMode}
                    className="flex p-3 bg-white text-black rounded-sm shadow-xl inset-shadow-2xs hover:bg-blue-400 hover:text-white ease-in-out transition delay-50 duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                  <button
                    title="이전 작업으로"
                    onClick={handleUndo}
                    disabled={rectangles.length === 0 || drawingMode}
                    className="flex p-3 bg-white text-black rounded-sm shadow-xl inset-shadow-2xs hover:bg-blue-400 hover:text-white ease-in-out transition delay-50 duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                      />
                    </svg>
                  </button>
                  <button
                    title={
                      drawingMode ? "선택 모드로 전환" : "새 영역 추가 모드"
                    }
                    onClick={toggleDrawingMode}
                    className={`flex p-3 rounded-sm shadow-xl inset-shadow-2xs ease-in-out transition delay-50 duration-300 hover:-translate-y-1 ${
                      drawingMode
                        ? "bg-blue-500 text-white"
                        : "bg-white text-black hover:bg-blue-400 hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2 m-2 h-32 flex-1 min-w-60">
                  <div className="flex flex-col gap-3 h-full w-full">
                    <button className="rounded-2xl bg-blue-200 flex-1 flex items-center justify-center hover:bg-blue-500 hover:text-white ease-in-out transition delay-50 duration-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 focus:bg-blue-500 focus:text-white">
                      마스코트로 가리기
                    </button>
                    <button className="rounded-2xl bg-gray-200/50 flex-1 flex items-center justify-center hover:bg-blue-500 hover:text-white ease-in-out transition delay-50 duration-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500">
                      블러로 가리기
                    </button>
                    <button className="rounded-2xl bg-gray-200/50 flex-1 flex items-center justify-center hover:bg-blue-500 hover:text-white ease-in-out transition delay-50 duration-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500">
                      모자이크로 가리기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

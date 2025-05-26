import React, { useEffect, useState, useRef } from "react"; // useRef 추가
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
} from "react-konva"; // Transformer 추가
import "../assets/animate.css";
import { FaceFilter } from "./FaceFilter";

export const UploadResult = ({ onClose, imageUrl }) => {
  const [image, setImage] = useState(null); // 원본 배경 이미지
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [rectangles, setRectangles] = useState([]); // 그리기 모드로 추가된 사각형들
  const [drawingMode, setDrawingMode] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [selectedRectId, setSelectedRectId] = useState(null);
  const [selectedFillColor, setSelectedFillColor] = useState("skyblue");
  const [mascotImages, setMascotImages] = useState([]); // 마스코트 이미지들
  const [selectedMascotImageId, setSelectedMascotImageId] = useState(null); // 추가: 선택된 마스코트 ID
  const transformerRef = useRef(null); // 추가: Transformer 컴포넌트 참조
  const [elementsHistory, setElementsHistory] = useState([
    { rectangles: [], mascotImages: [] },
  ]);
  const [currentElementsHistoryIndex, setCurrentElementsHistoryIndex] =
    useState(0);

  const [faceVisible, setFaceVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  // 마스코트 이미지 URL (실제 사용할 마스코트 이미지 URL로 변경해주세요!)
  const MASCOT_IMAGE_URL = "../public/수룡이.png"; // 예시 이미지

  const availableColors = [
    "skyblue",
    "rgba(255, 99, 132, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(255, 205, 86, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
    "black",
  ];

  const updateHistory = (newRects, newMascots) => {
    const newHistoryEntry = {
      rectangles: newRects,
      mascotImages: newMascots,
    };
    const newHistory = elementsHistory.slice(
      0,
      currentElementsHistoryIndex + 1
    );
    setElementsHistory([...newHistory, newHistoryEntry]);
    setCurrentElementsHistoryIndex(newHistory.length);
    setRectangles(newRects); // 실제 상태도 업데이트
    setMascotImages(newMascots); // 실제 상태도 업데이트
  };

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
    setElementsHistory([{ rectangles: [], mascotImages: [] }]);
    setCurrentElementsHistoryIndex(0);
  }, [imageUrl]);

  // Transformer 컴포넌트가 선택된 노드를 바라보도록 설정
  useEffect(() => {
    if (transformerRef.current) {
      const selectedMascot = mascotImages.find(
        (m) => m.id === selectedMascotImageId
      );
      if (selectedMascot) {
        transformerRef.current.nodes([selectedMascot.nodeRef.current]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]); // ✨ 선택 해제 시 Transformer 노드 비우기
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedMascotImageId, selectedRectId, mascotImages, rectangles]);

  const cancelCurrentDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
    setNewRect(null);
  };

  // 플러스 모드일 때 다른 곳 클릭하면 끄게 해주는 useEffect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawingMode && !isDrawing) {
        const canvasElement = document.getElementById("plusButton");
        if (canvasElement && !canvasElement.contains(event.target)) {
          setDrawingMode(false); // 허공 클릭 시 드로잉 모드 해제 (단, 그리고 있지 않을 때만)
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawingMode, isDrawing]);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const clickedOnShape = e.target !== stage;

    // 그리기 모드가 아닐 때 (선택/이동 모드)
    if (!drawingMode) {
      // 마스코트 이미지 클릭 시
      if (e.target.name && e.target.name.startsWith("mascot-")) {
        setSelectedMascotImageId(e.target.id());
        setSelectedRectId(null); // 사각형 선택 해제
      }
      // 사각형 클릭 시
      else if (e.target.name && e.target.name.startsWith("rect-")) {
        const index = rectangles.findIndex((r) => r.id === e.target.id());
        setSelectedRectId(index);
        setSelectedMascotImageId(null); // 마스코트 선택 해제
      }
      // 아무것도 클릭하지 않았을 때 (배경 클릭)
      else if (!clickedOnShape) {
        setSelectedRectId(null);
        setSelectedMascotImageId(null);
      }
      return;
    }

    // 그리기 모드일 때 (사각형 그리기)
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
    setSelectedRectId(null); // 새 그림을 시작할 때 선택 해제
    setSelectedMascotImageId(null); // 마스코트 선택 해제
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
        fill: selectedFillColor,
        draggable: true,
        id: `rect-${rectangles.length}-${Date.now()}`,
        nodeRef: React.createRef(),
      };
      updateHistory([...rectangles, finalRect], mascotImages); // ✨ 수정updateHistory([...rectangles, finalRect], mascotImages); // ✨ 수정
    }
    cancelCurrentDrawing();
    // ref 추가
  };

  const handleRectDragStart = (e, index) => {
    if (drawingMode) return;
    setSelectedRectId(index);
    setSelectedMascotImageId(null); // 사각형 드래그 시작 시 마스코트 선택 해제
    e.target.stopEvent();
  };

  const handleRectDragEnd = (e, draggedRectIndex) => {
    if (drawingMode) return;
    const newX = e.target.x();
    const newY = e.target.y();
    const updatedRects = rectangles.map((rect, index) =>
      index === draggedRectIndex ? { ...rect, x: newX, y: newY } : rect
    );
    updateHistory(updatedRects, mascotImages); // ✨ updateHistory 호출 (마스코트는 그대로)
  };

  const handleRectClick = (e, index) => {
    if (drawingMode) return;
    setSelectedRectId(index);
    setSelectedMascotImageId(null); // 사각형 클릭 시 마스코트 선택 해제
    e.target.stopEvent();
  };

  const handleUndo = () => {
    if (isDrawing) {
      cancelCurrentDrawing();
      return;
    }
    if (currentElementsHistoryIndex > 0) {
      const newIndex = currentElementsHistoryIndex - 1;
      setCurrentElementsHistoryIndex(newIndex);
      setRectangles(elementsHistory[newIndex].rectangles);
      setMascotImages(elementsHistory[newIndex].mascotImages);
      setSelectedRectId(null);
      setSelectedMascotImageId(null);
    }
  };
  const handleRedo = () => {
    if (currentElementsHistoryIndex < elementsHistory.length - 1) {
      const newIndex = currentElementsHistoryIndex + 1;
      setCurrentElementsHistoryIndex(newIndex);
      setRectangles(elementsHistory[newIndex].rectangles);
      setMascotImages(elementsHistory[newIndex].mascotImages);
      setSelectedRectId(null);
      setSelectedMascotImageId(null);
    }
  };

  const handleDelete = () => {
    if (isDrawing) {
      cancelCurrentDrawing();
      return;
    }

    let updatedRects = rectangles;
    let updatedMascots = mascotImages;
    let changed = false;

    if (selectedRectId !== null && rectangles[selectedRectId]) {
      updatedRects = rectangles.filter((_, i) => i !== selectedRectId);
      setSelectedRectId(null);
      changed = true;
    } else if (selectedMascotImageId !== null) {
      updatedMascots = mascotImages.filter(
        (img) => img.id !== selectedMascotImageId
      );
      setSelectedMascotImageId(null);
      changed = true;
    }

    if (changed) {
      updateHistory(updatedRects, updatedMascots); // ✨ updateHistory 호출
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        setSelectedRectId(null);
        setSelectedMascotImageId(null); // 그리기 모드 진입 시 모든 선택 해제
        if (isDrawing) cancelCurrentDrawing();
      }
      return newMode;
    });
  };

  // --- 마스코트 추가 함수 ---
  const handleAddMascot = () => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = MASCOT_IMAGE_URL;

    img.onload = () => {
      const initialMascotSize = Math.min(img.width, img.height) * 0.5; // 원본 이미지의 50% 크기로 시작
      const aspectRatio = img.width / img.height;

      const newMascot = {
        id: `mascot-${Date.now()}`,
        nodeRef: React.createRef(), // 추가: Konva 노드를 참조하기 위한 ref
        konvaImage: img,
        x:
          (750 / 2 - (initialMascotSize * aspectRatio) / 2) / imageScale +
          imagePosition.x / imageScale,
        y:
          (500 / 2 - initialMascotSize / 2) / imageScale +
          imagePosition.y / imageScale,
        width: initialMascotSize * aspectRatio, // 초기 너비
        height: initialMascotSize, // 초기 높이
        draggable: true,
      };
      const updatedMascots = [...mascotImages, newMascot]; // ✨ 변경된 마스코트 배열
      updateHistory(rectangles, updatedMascots); // ✨ updateHistory 호출 (사각형은 그대로)
      setDrawingMode(false);
      setSelectedRectId(null);
      // 새로 추가된 마스코트가 바로 선택되도록 ID 설정
      setSelectedMascotImageId(newMascot.id);
    };

    img.onerror = (err) => {
      console.error("마스코트 이미지 로드 실패:", MASCOT_IMAGE_URL, err);
    };
  };

  // 마스코트 드래그 및 변환 종료 시 호출
  const handleMascotTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const x = node.x();
    const y = node.y();
    // 변환 후 실제 너비와 높이 계산
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    // Konva 노드의 스케일을 1로 리셋하고, 계산된 크기를 직접 설정
    node.scaleX(1);
    node.scaleY(1);
    // node.width(newWidth); // KonvaImage의 width/height는 이미지 원본 크기이므로 직접 변경하지 않음
    // node.height(newHeight); // 대신 상태 객체에 newWidth, newHeight를 저장

    const updatedMascots = mascotImages.map((mascot) =>
      mascot.id === id
        ? { ...mascot, x, y, width: newWidth, height: newHeight }
        : mascot
    );
    updateHistory(rectangles, updatedMascots); // ✨ updateHistory 호출 (사각형은 그대로)
  };

  return (
    <>
      <div>
        <div className="min-w-5xl max-w-7xl mt-10 justify-center bg-gray-50 rounded-2xl fadeInUp animated faster">
          <div className="h-10 rounded-t-xl justify-between flex text-2xl items-center px-3 py-3 bg-blue-50 shadow-[inset_0px_-2px_14px_-4px_rgba(0,_0,_0,_0.1)]">
            <span className="font-semibold text-blue-500">이미지 마스킹</span>

            <button
              onClick={onClose}
              className="group flex items-center justify-start w-10 h-8 my-1 bg-[#ff7c7c] text-white rounded-full cursor-pointer relative overflow-hidden transition-all duration-200 shadow-lg hover:w-26 hover:rounded-full active:translate-x-1 active:translate-y-1"
            >
              <div className="flex items-center justify-center w-full transition-all duration-300 group-hover:justify-start group-hover:px-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className=" size-7 p-1 transform transition-transform duration-300 hover:text-white group-active:stroke-blue-200 group-active:duration-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="absolute right-3 transform translate-x-full opacity-0 text-white text-lg font-semibold transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                <span className="hidden group-hover:block">창닫기</span>
              </div>
            </button>
          </div>

          <div className="flex transition-all duration-200 h-[650px]">
            <div className="transition-all duration-300 animated slow rounded-xl flex-[2] bg-white/50 shadow-[0px_-1px_33px_-27px_rgba(102,_102,_102,_1)] p-20 flex flex-col items-center justify-center aspect-[3/2] overflow-hidden">
              <Stage
                width={750}
                height={600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDrawing) {
                    cancelCurrentDrawing();
                  }
                }}
              >
                <Layer>
                  {image && (
                    <Group
                      x={imagePosition.x}
                      y={imagePosition.y}
                      scaleX={imageScale}
                      scaleY={imageScale}
                      draggable={
                        !drawingMode &&
                        selectedMascotImageId === null &&
                        selectedRectId === null
                      } // ✨ 수정
                      onDragEnd={(e) => {
                        if (
                          drawingMode ||
                          selectedMascotImageId !== null ||
                          selectedRectId !== null
                        )
                          return; // ✨ 수정
                        setImagePosition({ x: e.target.x(), y: e.target.y() });
                      }}
                      dragBoundFunc={(pos) => {
                        if (
                          drawingMode ||
                          selectedMascotImageId !== null ||
                          selectedRectId !== null
                        )
                          return imagePosition;
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
                          name={`rect-${i}`} // 노드 이름 부여 (선택 로직용)
                          {...rect}
                          draggable={
                            !drawingMode &&
                            selectedMascotImageId === null &&
                            selectedRectId === i
                          }
                          stroke={selectedRectId === i ? "red" : "black"}
                          strokeWidth={
                            selectedRectId === i
                              ? 2 / imageScale
                              : 1 / imageScale
                          }
                          onClick={(e) => handleRectClick(e, i)}
                          onTap={(e) => handleRectClick(e, i)}
                          onDragStart={(e) => handleRectDragStart(e, i)}
                          onDragEnd={(e) => handleRectDragEnd(e, i)}
                        />
                      ))}
                      {/* 마스코트 이미지 렌더링 */}
                      {mascotImages.map((mascot) => (
                        <KonvaImage
                          key={mascot.id}
                          name={`mascot-${mascot.id}`} // 노드 이름 부여
                          image={mascot.konvaImage}
                          ref={mascot.nodeRef} // ref 연결
                          x={mascot.x}
                          y={mascot.y}
                          width={mascot.width}
                          height={mascot.height}
                          draggable={!drawingMode} // 드로잉 모드 아닐 때만 드래그 가능
                          stroke={
                            selectedMascotImageId === mascot.id ? "blue" : ""
                          }
                          strokeWidth={
                            selectedMascotImageId === mascot.id
                              ? 2 / imageScale
                              : 0
                          }
                          onClick={(e) => {
                            if (!drawingMode) {
                              setSelectedMascotImageId(mascot.id);
                              setSelectedRectId(null); // 마스코트 선택 시 사각형 선택 해제
                            }
                          }}
                          onTap={(e) => {
                            if (!drawingMode) {
                              setSelectedMascotImageId(mascot.id);
                              setSelectedRectId(null);
                            }
                          }}
                          onDragEnd={(e) =>
                            handleMascotTransformEnd(e, mascot.id)
                          } // 드래그 종료 시 변환 종료와 동일하게 처리
                          onTransformEnd={(e) =>
                            handleMascotTransformEnd(e, mascot.id)
                          }
                        />
                      ))}

                      {/* Transformer 렌더링 */}
                      {!drawingMode && selectedMascotImageId && (
                        <Transformer
                          ref={transformerRef}
                          boundBoxFunc={(oldBox, newBox) => {
                            // 크기 조절 시 비율 유지 (선택 사항)
                            newBox.width = Math.max(5, newBox.width);
                            return newBox;
                          }}
                          keepRatio={true} // 비율 유지
                        />
                      )}

                      {isDrawing && newRect && (
                        <Rect
                          x={newRect.x}
                          y={newRect.y}
                          width={newRect.width}
                          height={newRect.height}
                          fill={
                            selectedFillColor.includes("rgba")
                              ? selectedFillColor.replace(
                                  /,\s*\d?\.?\d+\)$/,
                                  ", 0.5)"
                                )
                              : `${selectedFillColor}80`
                          }
                          stroke={
                            selectedFillColor.includes("rgba")
                              ? selectedFillColor.replace(
                                  /,\s*\d?\.?\d+\)$/,
                                  ", 1)"
                                )
                              : selectedFillColor
                          }
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
            <div className="transition-all duration-300 animated slow rounded-xl flex-grow-0 bg-white shadow-[-5px_2px_5px_0px_rgba(149,_157,_165,_0.2)] p-3 flex flex-col">
              <div className="flex flex-col justify-start items-start flex-1 gap-3">
                <div className="flex p-2 w-full">
                  <div
                    className={`flex items-center justify-between gap-3 bg-white bg-opacity-80 backdrop-blur-md rounded-full px-6 py-3 shadow-lg max-w-md mx-auto transition-all duration-300 hover:shadow-xl hover:bg-opacity-90 ${
                      drawingMode ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    {/* tool bar 삭제 버튼 */}
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleDelete}
                        disabled={
                          (selectedRectId === null &&
                            selectedMascotImageId === null) ||
                          drawingMode
                        }
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-120 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-[#FF8383] border-[#fa9090] text-white hover:bg-[#FF8383]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-7 p-1 transform transition-transform duration-300 hover:text-white group-active:stroke-blue-200 group-active:duration-0"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-12.5 left-1/2 transform text-nowrap -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        {(selectedRectId === null &&
                          selectedMascotImageId === null) ||
                        drawingMode
                          ? "객체를 선택하세요"
                          : "삭제"}
                      </span>
                    </div>
                    {/* tool bar 추가 버튼 */}
                    <div className="group relative justify-center flex">
                      <button
                        id="plusButton"
                        onClick={toggleDrawingMode}
                        className={`focus:outline-none mx-2 transition-transform duration-200 ease-in-out scale-115 group-hover:scale-120 rounded-full group cursor-pointer outline-none hover:rotate-90 border bg-blue-300 border-blue-200 text-white hover:bg-blue-400  ${
                          drawingMode
                            ? "bg-blue-400 border-2 border-blue-400"
                            : "bg-blue-200"
                        }`}
                      >
                        <svg
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="size-7 transform transition-transform duration-300 hover:scale-115 hover:text-white"
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
                    {/* tool bar 이전 버튼 */}
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleUndo}
                        disabled={
                          (rectangles.length === 0 &&
                            mascotImages.length === 0) ||
                          drawingMode
                        } // 모든 요소 없으면 비활성화
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-120 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-amber-400 border-amber-200 text-white hover:bg-amber-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="size-7 p-1 transform transition-transform duration-300 hover:text-white group-active:stroke-blue-200 group-active:duration-0"
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
                    {/* tool bar 앞으로 (Redo 버튼) */}
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleRedo}
                        disabled={
                          currentElementsHistoryIndex >=
                            elementsHistory.length - 1 || drawingMode
                        }
                        className="focus:outline-none mx-2 transition-transform duration-200 ease-in-out scale-115 group-hover:scale-120 rounded-full group cursor-pointer outline-none border bg-red-300 border-red-200 text-white hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* SVG 아이콘 */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5" // 오타 수정: stroke-width -> strokeWidth
                          stroke="currentColor"
                          className="size-7 p-1 transform transition-transform duration-300 hover:text-white group-active:stroke-blue-200 group-active:duration-0" // 오타 수정: class -> className
                        >
                          <path
                            strokeLinecap="round" // 오타 수정: stroke-linecap -> strokeLinecap
                            strokeLinejoin="round" // 오타 수정: stroke-linejoin -> strokeLinejoin
                            d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-13 left-1/2 text-nowrap transform -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        앞으로
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✨ 추가: 구분선 */}
                <hr className="w-full border-gray-300 my-3" />

                {/* ✨ 추가: 새로운 버튼 4개 (row 정렬) */}
                <div className="flex flex-row justify-around items-center w-full gap-2 px-2">
                  <button
                    onClick={() => {
                      setFaceVisible(!faceVisible);
                      if (textVisible) setTextVisible(!textVisible);
                    }}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex-1 text-sm"
                  >
                    버튼 1
                  </button>
                  <button
                    onClick={() => {
                      setTextVisible(!textVisible);
                      if (faceVisible) setFaceVisible(!faceVisible);
                    }}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex-1 text-sm"
                  >
                    버튼 2
                  </button>
                  <button className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex-1 text-sm">
                    버튼 3
                  </button>
                  <button className="p-2 bg-gray-200 rounded hover:bg-gray-300 flex-1 text-sm">
                    버튼 4
                  </button>
                </div>

                {textVisible && (
                  <div className="px-2 w-full">
                    <p className="text-xs text-gray-600 mb-1 ml-1">
                      채우기 색상:
                    </p>
                    <div className="flex flex-wrap gap-2 p-2 bg-white/30 rounded-lg shadow">
                      {availableColors.map((color) => (
                        <button
                          key={color}
                          title={`색상: ${color}`}
                          onClick={() => setSelectedFillColor(color)}
                          className={`w-7 h-7 rounded-md border-2 hover:opacity-80 transition-all ${
                            selectedFillColor === color
                              ? "ring-2 ring-offset-1 ring-blue-500"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                          disabled={!drawingMode}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {faceVisible && (
                  <div className="flex gap-2 m-2 h-32 flex-1 min-w-60">
                    <div className="flex flex-col gap-3 h-full w-full">
                      {/* 마스코트 추가 버튼 */}
                      <button
                        onClick={handleAddMascot}
                        className="rounded-2xl bg-blue-200 flex-1 flex items-center justify-center hover:bg-blue-500 hover:text-white ease-in-out transition delay-50 duration-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 focus:bg-blue-500 focus:text-white"
                      >
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

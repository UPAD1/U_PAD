import React, { useEffect, useState, useRef } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
  Circle,
  Text,
} from "react-konva";
import "../assets/animate.css";

import MascotLayer from "./MascotLayer";
import RectangleLayer from "./RectangleLayer";
import { FileUploader } from "./FileUploader";
import Konva from "konva";

export const UploadResult22 = ({ onClose, imageUrl }) => {
  const [image, setImage] = useState(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [rectangles, setRectangles] = useState([]);
  const [drawingMode, setDrawingMode] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [selectedRectId, setSelectedRectId] = useState(null);
  const [selectedFillColor, setSelectedFillColor] = useState(
    "rgba(255, 255, 255, 0.7)"
  );
  const [mascotImages, setMascotImages] = useState([]);
  const [selectedMascotImageId, setSelectedMascotImageId] = useState(null);
  const [elementsHistory, setElementsHistory] = useState([
    { rectangles: [], mascotImages: [] },
  ]);
  const [currentElementsHistoryIndex, setCurrentElementsHistoryIndex] =
    useState(0);
  const [faceVisible, setFaceVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");
  const [originalFileExtension, setOriginalFileExtension] = useState("png");

  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeRef = useRef({}); // 선택된 사각형 참조를 저장할 객체

  // 마스코트 이미지 URL (실제 사용할 마스코트 이미지 URL로 변경해주세요!)
  const MASCOT_IMAGE_URL = "../public/수룡이.png"; // 예시 이미지

  const availableColors = [
    { color: "rgba(254, 67, 67, 0.7)", name: "빨간색" },
    { color: "rgba(254,138,67, 0.7)", name: "주황색" },
    { color: "rgba(241,241,136, 0.7)", name: "노란색" },
    { color: "rgba(167,236,151, 0.7)", name: "연두색" },
    { color: "rgba(118,206,93, 0.7)", name: "초록색" },
    { color: "rgba(144,241,242, 0.7)", name: "하늘색" },
    { color: "rgba(12,200,252, 0.7)", name: "파란색" },
    { color: "rgba(2,111,207, 0.7)", name: "남색" },
    { color: "rgba(130,93,217, 0.7)", name: "보라색" },
    { color: "rgba(0,0,0, 0.7)", name: "검정색" },
    { color: "rgba(255, 255, 255, 0.7)", name: "흰색" },
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

    // 상태 업데이트
    setRectangles(newRects);
    setMascotImages(newMascots);
  };

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    const extension = imageUrl.split(".").pop().toLowerCase();
    const supportedExtensions = ["png", "jpg", "jpeg", "gif"];
    if (supportedExtensions.includes(extension)) {
      setOriginalFileExtension(extension);
    }

    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 500;
      const scaleX = maxWidth / img.width;
      const scaleY = maxHeight / img.height;
      const scale = Math.min(scaleX, scaleY);

      setImage(img);
      // 이미지를 스테이지 중앙에 위치시키되, 스테이지 경계를 벗어나지 않도록 조정
      const stageWidth = 900; // Stage 컴포넌트의 width
      const stageHeight = 600; // Stage 컴포넌트의 height
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;

      const x = Math.min(
        0,
        Math.max(stageWidth - scaledWidth, (stageWidth - scaledWidth) / 2)
      );
      const y = Math.min(
        0,
        Math.max(stageHeight - scaledHeight, (stageHeight - scaledHeight) / 2)
      );

      setImagePosition({ x, y });
      setImageScale(scale);
    };
    setElementsHistory([
      {
        rectangles: [],
        mascotImages: [],
      },
    ]);
    setCurrentElementsHistoryIndex(0);
  }, [imageUrl]);

  const cancelCurrentDrawing = () => {
    setIsDrawing(false);
    setStartPos(null);
    setNewRect(null);
  };

  // 플러스 모드일 때 다른 곳 클릭하면 끄게 해주는 useEffect 수정
  useEffect(() => {
    const handleClickOutside = (event) => {
      // 스테이지 참조 가져오기
      const stage = stageRef.current;
      if (!stage) return;

      // 스테이지의 DOM 컨테이너 요소 가져오기
      const stageContainer = stage.attrs.container;

      // 툴바 영역과 관련 UI 요소 가져오기
      const plusButton = document.getElementById("plusButton");
      const colorPalette = document.getElementById("colorPalette");
      const customColorArea = document.getElementById("customColorArea");
      const toolbarArea = document.querySelector(
        ".animated.slow.rounded-xl.flex-grow-0.bg-white"
      );

      // 클릭된 요소가 스테이지의 자식인지 확인
      const clickedOnStage =
        stageContainer && stageContainer.contains(event.target);

      // 클릭된 요소가 툴바 영역의 자식인지 확인
      const clickedOnToolbar =
        toolbarArea && toolbarArea.contains(event.target);

      // 그리기 모드 처리 (기존 코드 유지)
      if (drawingMode && !isDrawing) {
        if (
          plusButton &&
          !plusButton.contains(event.target) &&
          (!colorPalette || !colorPalette.contains(event.target)) &&
          (!customColorArea || !customColorArea.contains(event.target))
        ) {
          setDrawingMode(false);
        }
      }

      // 스테이지나 툴바 영역이 아닌 곳을 클릭했을 때 선택 해제
      if (!clickedOnStage && !clickedOnToolbar) {
        if (selectedRectId !== null || selectedMascotImageId !== null) {
          setSelectedRectId(null);
          setSelectedMascotImageId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [drawingMode, isDrawing, selectedRectId, selectedMascotImageId]);

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // 드로잉 모드가 아닐 때는 선택 로직만 실행
    if (!drawingMode) {
      if (e.target === stage) {
        setSelectedRectId(null);
        setSelectedMascotImageId(null);
      }
      return;
    }

    // 드로잉 모드일 때는 새로운 사각형 그리기 시작
    const adjustedX = (pointerPos.x - imagePosition.x) / imageScale;
    const adjustedY = (pointerPos.y - imagePosition.y) / imageScale;

    setStartPos({ x: adjustedX, y: adjustedY });
    setNewRect({
      x: adjustedX,
      y: adjustedY,
      width: 0,
      height: 0,
      id: `rect-${Date.now()}`,
    });
    setIsDrawing(true);
    console.log("Drawing started", { adjustedX, adjustedY });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPos || !newRect || !drawingMode) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const adjustedX = (pointerPos.x - imagePosition.x) / imageScale;
    const adjustedY = (pointerPos.y - imagePosition.y) / imageScale;

    setNewRect((prev) => {
      const updated = {
        ...prev,
        x: Math.min(startPos.x, adjustedX),
        y: Math.min(startPos.y, adjustedY),
        width: Math.abs(adjustedX - startPos.x),
        height: Math.abs(adjustedY - startPos.y),
      };
      console.log("Drawing in progress", updated);
      return updated;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !newRect || !drawingMode) return;

    if (newRect.width > 0 && newRect.height > 0) {
      const finalRect = {
        ...newRect,
        fill: selectedFillColor,
        draggable: true,
        id: `rect-${rectangles.length}-${Date.now()}`,
      };
      console.log("Drawing finished", finalRect);
      const updatedRects = [...rectangles, finalRect];
      setRectangles(updatedRects);
      updateHistory(updatedRects, mascotImages);
    }

    setIsDrawing(false);
    setStartPos(null);
    setNewRect(null);
  };

  const handleRectDragStart = (e, rectId) => {
    if (drawingMode) return;
    setSelectedRectId(rectId);
    setSelectedMascotImageId(null);
    e.cancelBubble = true;
  };

  const handleRectDragEnd = (e, rectId) => {
    if (drawingMode) return;

    // 현재 드래그된 위치를 Group 내부 좌표로 변환
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = e.target.position();
    if (!pos) return;

    // 유효한 숫자인지 확인
    const newX = Number(pos.x) || 0;
    const newY = Number(pos.y) || 0;

    console.log("Drag End Position:", { newX, newY }); // 디버깅용

    const updatedRects = rectangles.map((rect) =>
      rect.id === rectId ? { ...rect, x: newX, y: newY } : rect
    );
    updateHistory(updatedRects, mascotImages);
  };

  const handleUndo = () => {
    if (isDrawing) {
      cancelCurrentDrawing();
      return;
    }
    if (currentElementsHistoryIndex > 0) {
      const newIndex = currentElementsHistoryIndex - 1;
      const prevState = elementsHistory[newIndex];

      // 모든 상태 복원
      setCurrentElementsHistoryIndex(newIndex);
      setRectangles(prevState.rectangles);
      setMascotImages(prevState.mascotImages);

      // 선택 상태 초기화
      setSelectedRectId(null);
      setSelectedMascotImageId(null);
    }
  };

  const handleRedo = () => {
    if (currentElementsHistoryIndex < elementsHistory.length - 1) {
      const newIndex = currentElementsHistoryIndex + 1;
      const nextState = elementsHistory[newIndex];

      // 모든 상태 복원
      setCurrentElementsHistoryIndex(newIndex);
      setRectangles(nextState.rectangles);
      setMascotImages(nextState.mascotImages);

      // 선택 상태 초기화
      setSelectedRectId(null);
      setSelectedMascotImageId(null);
    }
  };

  const handleDelete = () => {
    let updatedRects = rectangles;
    let updatedMascots = mascotImages;
    let changed = false;

    // ✨ 여기를 수정합니다.
    // selectedRectId가 인덱스라면 numbers.filter((_, i) => i !== selectedRectId);
    // selectedRectId가 ID라면 numbers.filter(item => item.id !== selectedRectId);
    if (selectedRectId !== null) {
      // selectedRectId는 이제 선택된 사각형의 'ID' 입니다.
      // ✨ 사각형 삭제 로직: ID를 기반으로 필터링
      updatedRects = rectangles.filter((rect) => rect.id !== selectedRectId);
      setSelectedRectId(null);
      changed = true;
    }
    // 마스코트 삭제 로직 (이 부분은 이미 ID 기반이었습니다.)
    else if (selectedMascotImageId !== null) {
      updatedMascots = mascotImages.filter(
        (img) => img.id !== selectedMascotImageId
      );
      setSelectedMascotImageId(null);
      changed = true;
    }

    if (changed) {
      // 변경 사항이 있을 때만 히스토리 업데이트
      updateHistory(updatedRects, updatedMascots);
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode((prevMode) => !prevMode);
    setSelectedRectId(null);
    setSelectedMascotImageId(null);
    if (isDrawing) {
      setIsDrawing(false);
      setStartPos(null);
      setNewRect(null);
    }
  };

  // --- 마스코트 추가 함수 ---
  // --- 마스코트 추가 함수 ---
  // 이 함수는 MascotLayer가 아닌 UploadResult에 유지되어야 합니다.
  // 왜냐하면 새로운 마스코트 객체를 생성하고 상태(mascotImages)를 업데이트하기 때문입니다.
  const handleAddMascot = () => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = MASCOT_IMAGE_URL;

    img.onload = () => {
      const initialMascotSize = Math.min(img.width, img.height) * 0.5;
      const aspectRatio = img.width / img.height;

      const newMascot = {
        id: `mascot-${Date.now()}`,
        nodeRef: React.createRef(),
        konvaImage: img,
        x:
          (900 / 2 - (initialMascotSize * aspectRatio) / 2) / imageScale +
          imagePosition.x / imageScale,
        y:
          (600 / 2 - initialMascotSize / 2) / imageScale +
          imagePosition.y / imageScale,
        width: initialMascotSize * aspectRatio,
        height: initialMascotSize,
        draggable: true,
      };
      const updatedMascots = [...mascotImages, newMascot];
      updateHistory(rectangles, updatedMascots);
      setDrawingMode(false);
      setSelectedRectId(null);
      setSelectedMascotImageId(newMascot.id); // 새로 추가된 마스코트가 바로 선택되도록 ID 설정
    };

    img.onerror = (err) => {
      console.error("마스코트 이미지 로드 실패:", MASCOT_IMAGE_URL, err);
    };
  };

  const handleCustomColorChange = (color) => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb = hexToRgb(color);
    if (rgb) {
      const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      setCustomColor(color);
      setSelectedFillColor(rgba);

      // 선택된 사각형이 있다면 색상 업데이트
      if (selectedRectId !== null) {
        const updatedRects = rectangles.map((rect) =>
          rect.id === selectedRectId ? { ...rect, fill: rgba } : rect
        );
        updateHistory(updatedRects, mascotImages);
      }
    }
  };

  const handleDownload = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const mimeTypes = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
    };

    const quality =
      originalFileExtension === "jpg" || originalFileExtension === "jpeg"
        ? 0.9
        : 1;

    const dataURL = stage.toDataURL({
      pixelRatio: 2,
      mimeType: mimeTypes[originalFileExtension] || "image/png",
      quality: quality,
    });

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
      now.getSeconds()
    ).padStart(2, "0")}`;

    const link = document.createElement("a");
    link.download = `마스킹결과_${timestamp}.${originalFileExtension}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (transformerRef.current && selectedRectId) {
      const node = nodeRef.current[selectedRectId];
      if (node) {
        // 기존: transformerRef.current.node(node);
        transformerRef.current.nodes([node]); // 변경된 방식
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedRectId]);

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
            <div className="transition-all duration-300 animated slow rounded-xl flex-[2] bg-red-200 shadow-[0px_-1px_33px_-27px_rgba(102,_102,_102,_1)] p-20 flex flex-col items-center justify-center aspect-[3/2] overflow-hidden">
              <Stage
                ref={stageRef}
                className="bg-red-300"
                width={900}
                height={600}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                  if (isDrawing) {
                    setIsDrawing(false);
                    setStartPos(null);
                    setNewRect(null);
                  }
                }}
              >
                <Layer>
                  {image && (
                    <>
                      {/* 배경 이미지 */}
                      <KonvaImage
                        image={image}
                        x={imagePosition.x}
                        y={imagePosition.y}
                        scaleX={imageScale}
                        scaleY={imageScale}
                        draggable={!drawingMode}
                        onClick={(e) => {
                          if (!drawingMode) {
                            setSelectedRectId(null);
                            setSelectedMascotImageId(null);
                          }
                        }}
                        onDragMove={(e) => {
                          const pos = e.target.position();

                          const stageWidth = 900;
                          const stageHeight = 600;

                          const imgWidth = image.width * imageScale;
                          const imgHeight = image.height * imageScale;

                          const minX = Math.min(0, stageWidth - imgWidth);
                          const maxX = Math.max(0, stageWidth - imgWidth);

                          const minY = Math.min(0, stageHeight - imgHeight);
                          const maxY = Math.max(0, stageHeight - imgHeight);

                          const newX = Math.min(Math.max(pos.x, minX), maxX);
                          const newY = Math.min(Math.max(pos.y, minY), maxY);

                          e.target.position({ x: newX, y: newY });
                          setImagePosition({ x: newX, y: newY });

                          console.log("min/max Drag Position:", {
                            x: newX,
                            y: newY,
                          });
                        }}
                        onDragEnd={(e) => {
                          const pos = e.target.position();
                          console.log("Final Drag Position:", pos);
                          setImagePosition(pos);
                        }}
                      />

                      {/* 사각형과 마스코트를 위한 Group */}
                      <Group
                        x={imagePosition.x}
                        y={imagePosition.y}
                        scaleX={imageScale}
                        scaleY={imageScale}
                      >
                        {rectangles.map((rect) => (
                          <Rect
                            key={rect.id}
                            {...rect}
                            draggable={
                              !drawingMode && selectedRectId === rect.id
                            }
                            stroke={
                              selectedRectId === rect.id ? "red" : "black"
                            }
                            strokeWidth={
                              selectedRectId === rect.id
                                ? 2 / imageScale
                                : 1 / imageScale
                            }
                            onClick={(e) => {
                              if (drawingMode) return;
                              setSelectedRectId(rect.id);
                              setSelectedMascotImageId(null);
                              e.cancelBubble = true;
                            }}
                            onDragStart={(e) => handleRectDragStart(e, rect.id)}
                            onDragEnd={(e) => handleRectDragEnd(e, rect.id)}
                            ref={(node) => {
                              // 모든 사각형의 참조를 저장
                              nodeRef.current[rect.id] = node;
                            }}
                          />
                        ))}

                        {selectedRectId !== null && (
                          <Transformer
                            ref={transformerRef}
                            rotateEnabled={false}
                            boundBoxFunc={(oldBox, newBox) => {
                              // 너무 작아지지 않게 제한
                              if (newBox.width < 5 || newBox.height < 5) {
                                return oldBox;
                              }
                              return newBox;
                            }}
                            onTransformEnd={() => {
                              const node = nodeRef.current[selectedRectId];
                              if (!node) return;

                              // 현재 스케일 값 가져오기
                              const scaleX = node.scaleX();
                              const scaleY = node.scaleY();

                              // 스케일 초기화
                              node.scaleX(1);
                              node.scaleY(1);

                              const updatedRects = rectangles.map((rect) => {
                                if (rect.id === selectedRectId) {
                                  return {
                                    ...rect,
                                    x: node.x(),
                                    y: node.y(),
                                    width: Math.max(5, node.width() * scaleX),
                                    height: Math.max(5, node.height() * scaleY),
                                  };
                                }
                                return rect;
                              });

                              // 히스토리 업데이트
                              updateHistory(updatedRects, mascotImages);
                            }}
                            nodes={
                              nodeRef.current[selectedRectId]
                                ? [nodeRef.current[selectedRectId]]
                                : []
                            }
                          />
                        )}
                        {isDrawing && newRect && (
                          <Rect
                            x={newRect.x}
                            y={newRect.y}
                            width={newRect.width}
                            height={newRect.height}
                            fill={selectedFillColor}
                            stroke="black"
                            strokeWidth={1 / imageScale}
                            dash={[4 / imageScale, 4 / imageScale]}
                          />
                        )}
                        <MascotLayer
                          mascotImages={mascotImages}
                          selectedMascotImageId={selectedMascotImageId}
                          setSelectedMascotImageId={setSelectedMascotImageId}
                          imageScale={imageScale}
                          drawingMode={drawingMode}
                          updateHistory={updateHistory}
                          rectangles={rectangles}
                          imagePosition={imagePosition}
                          setSelectedRectId={setSelectedRectId}
                        />
                      </Group>
                    </>
                  )}
                </Layer>
              </Stage>
            </div>

            {/* tool bar */}
            <div className="transition-all duration-300 animated slow rounded-xl flex-grow-0 bg-white shadow-[-5px_2px_5px_0px_rgba(149,_157,_165,_0.2)] p-3 flex flex-col">
              <div className="flex flex-col justify-start items-start flex-1 gap-3">
                <div className="flex p-2 w-full">
                  <div
                    className={`flex items-center flex-shrink-0 justify-between gap-3 bg-white bg-opacity-80 rounded-full px-6 py-3 shadow-lg max-w-md transition-colors duration-300 hover:shadow-xl backdrop-blur-md hover:bg-opacity-90 ${
                      drawingMode
                        ? "border-2 border-blue-500"
                        : "border-3 border-transparent"
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
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-110 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-[#F87171] border-[#EF4444] text-white hover:bg-[#EF4444]"
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
                        className={`focus:outline-none mx-2 transition-transform duration-200 ease-in-out scale-110 group-hover:scale-130 rounded-full group cursor-pointer outline-none hover:rotate-90 border bg-[#93C5FD] border-[#60A5FA] text-white hover:bg-[#60A5FA] ${
                          drawingMode
                            ? "bg-[#60A5FA] border-2 border-[#60A5FA]"
                            : "bg-[#93C5FD]"
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
                          currentElementsHistoryIndex === 0 || drawingMode
                        }
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-110 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-[#FBBF24] border-[#F59E0B] text-white hover:bg-[#F59E0B]"
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
                          currentElementsHistoryIndex >
                            elementsHistory.length - 1 || drawingMode
                        }
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-110 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-[#83d0ab] border-[#78c7b6] text-white hover:bg-[#78c7b6]"
                      >
                        {/* SVG 아이콘 */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2" // 오타 수정: stroke-width -> strokeWidth
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
                    {/* tool bar 다운로드 버튼 */}
                    <div className="group relative justify-center flex">
                      <button
                        onClick={handleDownload}
                        className="focus:outline-none mx-2 transition-transform disabled:opacity-50 disabled:cursor-not-allowed scale-110 group-hover:scale-130 duration-200 ease-in-out rounded-full group cursor-pointer outline-none border bg-[#C4B5FD] border-[#A78BFA] text-white hover:bg-[#A78BFA]"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-7 p-1"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                      </button>
                      <span className="absolute -top-12.5 left-1/2 transform text-nowrap -translate-x-1/2 z-20 px-4 py-2 text-sm text-white bg-blue-600/50 rounded-lg shadow-lg transition-transform duration-300 ease-in-out scale-0 group-hover:scale-100">
                        다운로드
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✨ 추가: 구분선 */}
                <hr className="w-full border-gray-300 my-2" />

                {/* ✨ 추가: 새로운 버튼 4개 (row 정렬) */}
                <div className="flex flex-row justify-around items-center w-full gap-2 px-2">
                  {/* 얼굴 마스킹 선택 버튼 */}
                  <button
                    onClick={() => {
                      setFaceVisible(!faceVisible);
                      if (textVisible) setTextVisible(!textVisible);
                    }}
                    className="px-1 py-2 shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] rounded hover:ring-blue-300 hover:ring-2 focus:ring-blue-300 focus:ring-2 flex-1 flex items-center justify-center hover:ease-in-out transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                      />
                    </svg>
                  </button>
                  {/* 텍스트 마스킹 선택 버튼 */}
                  <button
                    onClick={() => {
                      setTextVisible(!textVisible);
                      if (faceVisible) setFaceVisible(!faceVisible);
                    }}
                    className="px-1 py-2 shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] rounded hover:ring-blue-300 hover:ring-2 focus:ring-blue-300 focus:ring-2 flex-1 flex items-center justify-center hover:ease-in-out transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
                      />
                    </svg>
                  </button>
                  <button className="px-1 py-2 shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] rounded hover:ring-blue-300 hover:ring-2 focus:ring-blue-300 focus:ring-2 flex-1 flex items-center justify-center hover:ease-in-out transition">
                    AI
                  </button>
                  <button className="px-1 py-2 shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] rounded hover:ring-blue-300 hover:ring-2 focus:ring-blue-300 focus:ring-2 flex-1 flex items-center justify-center hover:ease-in-out transition">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z"
                      />
                    </svg>
                  </button>
                </div>

                {/* ✨ 추가: 구분선 */}
                <hr className="w-full border-gray-300 my-3" />

                {textVisible && (
                  <>
                    <div className="px-2 w-full">
                      {/* 현재 선택된 색상 정보 표시 영역 */}
                      <div className="mb-2 flex justify-between items-center p-2 bg-white rounded-lg shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)]">
                        {/* 선택된 색상의 이름 표시 
                              - availableColors에서 현재 selectedFillColor와 일치하는 색상을 찾아 이름 표시
                              - 일치하는 색상이 없으면 '없음' 표시 */}
                        <p className="text-sm font-semibold text-gray-600">
                          선택된 색상 :{" "}
                          <span className="font-medium">
                            {availableColors.find(
                              (c) => c.color === selectedFillColor
                            )?.name || customColor}
                          </span>
                        </p>
                        {/* 선택된 색상 미리보기 */}
                        <div
                          className="w-7 h-7 rounded border border-gray-300"
                          style={{ backgroundColor: selectedFillColor }}
                        />
                      </div>
                      <div className="p-1 shadow-[0px_0px_1px_0px_rgba(0,_0,_0,_0.1)] rounded-lg">
                        <p className="text-sm text-black mt-2 mx-1">
                          채우기 색상
                        </p>
                        <div className="w-79 my-3">
                          <div
                            id="colorPalette"
                            className="flex flex-row overflow-auto gap-3 p-2 bg-white/30 rounded-lg shadow w-full"
                          >
                            {availableColors.map(({ color, name }) => (
                              <button
                                key={color}
                                title={name}
                                onClick={() => {
                                  if (drawingMode || selectedRectId == null) {
                                    setSelectedFillColor(color);
                                  }
                                  if (selectedRectId !== null) {
                                    const updatedRects = rectangles.map(
                                      (rect) =>
                                        rect.id === selectedRectId
                                          ? { ...rect, fill: color }
                                          : rect
                                    );
                                    updateHistory(updatedRects, mascotImages);
                                  }
                                }}
                                className={`group relative w-10 h-10 aspect-square rounded-md border-2 hover:opacity-80 hover:w-13 transition-all ${
                                  selectedFillColor === color
                                    ? "ring-3 ring-blue-500 scale-105 border-none"
                                    : "border-gray-300"
                                }`}
                                style={{ backgroundColor: color }}
                              ></button>
                            ))}
                          </div>
                          <div className="w-full mt-4">
                            {/* 사용자 정의 색상 선택 컨테이너 */}
                            <div className="p-2 bg-white/30 rounded-lg shadow">
                              <p className="text-sm text-black mb-1 ml-1">
                                사용자 정의 색상
                              </p>
                              {/* 색상 선택기 영역 */}
                              <div className="flex-1">
                                {/* HTML5 컬러 피커 
                                  - value: 현재 선택된 HEX 색상 값
                                  - onChange: 색상 변경 시 handleCustomColorChange 호출
                                    (현재 선택된 색상과 투명도 값 전달) */}
                                <div className="flex-1" id="customColorArea">
                                  <input
                                    type="color"
                                    id="customColorPicker"
                                    value={customColor}
                                    onChange={(e) =>
                                      handleCustomColorChange(e.target.value)
                                    }
                                    className="absolute opacity-0 w-0 h-0"
                                  />
                                  <label
                                    htmlFor="customColorPicker"
                                    className={`flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100  ${
                                      !availableColors.find(
                                        (c) => c.color === selectedFillColor
                                      )
                                        ? "border-blue-500 border-2"
                                        : "bg-white border border-gray-300 "
                                    }`}
                                  >
                                    <div
                                      className="w-7 h-7 rounded-full border border-gray-200"
                                      style={{ backgroundColor: customColor }}
                                    />
                                    <span className="text-sm">
                                      원하는 색상 선택
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {faceVisible && (
                  <div className="px-2 w-full">
                    <div className="mb-2 flex flex-col gap-3 p-2 bg-white rounded-lg shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)]">
                      <p className="text-sm text-black mt-2 mx-1">
                        얼굴 가리기
                      </p>
                      <div className="flex-1 bg-white rounded-xl shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] p-2">
                        <FileUploader />
                        <button
                          onClick={handleAddMascot}
                          className="w-full bg-blue-500 text-white p-2 rounded-lg"
                        >
                          마스코트로 가리기
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-[0px_1px_5px_1px_rgba(0,_0,_0,_0.1)] p-2">
                        <div className="flex gap-2">
                          <button>블러로 가리기</button>
                          <button>모자이크로 가리기</button>
                        </div>
                      </div>
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

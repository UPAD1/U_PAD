import React from "react";
import { Rect } from "react-konva";

const RectangleLayer = ({
  rectangles,
  newRect,
  isDrawing,
  drawingMode,
  selectedRectId,
  selectedMascotImageId,
  imageScale,
  selectedFillColor,
  handleRectClick,
  handleRectDragStart,
  handleRectDragEnd,
}) => {
  return (
    <>
      {/* 이미 그려진 사각형들 */}
      {rectangles.map((rect) => (
        <Rect
          key={rect.id}
          {...rect}
          name={`rect-${rect.id}`}
          draggable={
            !drawingMode &&
            selectedMascotImageId === null &&
            selectedRectId === rect.id
          }
          stroke={selectedRectId === rect.id ? "red" : "black"}
          strokeWidth={
            selectedRectId === rect.id ? 2 / imageScale : 1 / imageScale
          }
          onClick={(e) => handleRectClick(e, rect.id)}
          onDragStart={(e) => handleRectDragStart(e, rect.id)}
          onDragEnd={(e) => handleRectDragEnd(e, rect.id)}
        />
      ))}

      {/* 그리는 중인 사각형 미리보기 */}
      {isDrawing && newRect && (
        <Rect
          x={newRect.x}
          y={newRect.y}
          width={newRect.width}
          height={newRect.height}
          fill={
            selectedFillColor.includes("rgba")
              ? selectedFillColor.replace(/,\s*\d?\.?\d+\)$/, ", 0.5)")
              : `${selectedFillColor}80`
          }
          stroke={
            selectedFillColor.includes("rgba")
              ? selectedFillColor.replace(/,\s*\d?\.?\d+\)$/, ", 1)")
              : selectedFillColor
          }
          strokeWidth={1 / imageScale}
          dash={[4 / imageScale, 4 / imageScale]}
          listening={false}
        />
      )}
    </>
  );
};

export default RectangleLayer;

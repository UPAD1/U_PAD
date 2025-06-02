// MascotLayer.js

import React, { useRef, useEffect } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";

const MascotLayer = ({
  mascotImages,
  selectedMascotImageId,
  setSelectedMascotImageId,

  drawingMode,
  updateHistory,
  rectangles,

  setSelectedRectId,
}) => {
  const transformerRef = useRef(null);

  useEffect(() => {
    if (transformerRef.current) {
      const selectedMascot = mascotImages.find(
        (m) => m.id === selectedMascotImageId
      );
      if (selectedMascot) {
        transformerRef.current.nodes([selectedMascot.nodeRef.current]);
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedMascotImageId, mascotImages]);

  const handleMascotTransformEnd = (e, id) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const x = node.x();
    const y = node.y();

    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;

    node.scaleX(1);
    node.scaleY(1);

    const updatedMascots = mascotImages.map((mascot) =>
      mascot.id === id
        ? { ...mascot, x, y, width: newWidth, height: newHeight }
        : mascot
    );
    updateHistory(rectangles, updatedMascots);
  };

  const handleMascotDragStart = (e, mascotId) => {
    if (drawingMode) return;
    setSelectedMascotImageId(mascotId);
    setSelectedRectId(null);
    e.cancelBubble = true;
  };

  const handleMascotDragEnd = (e, mascotId) => {
    if (drawingMode) return;
    const newX = e.target.x();
    const newY = e.target.y();

    // 좌표가 유효한지 확인
    if (isNaN(newX) || isNaN(newY)) return;

    const updatedMascots = mascotImages.map((mascot) =>
      mascot.id === mascotId ? { ...mascot, x: newX, y: newY } : mascot
    );
    updateHistory(rectangles, updatedMascots);
  };

  return (
    <>
      {mascotImages.map((mascot) => (
        <React.Fragment key={mascot.id}>
          <KonvaImage
            ref={mascot.nodeRef}
            image={mascot.konvaImage}
            x={mascot.x}
            y={mascot.y}
            width={mascot.width}
            height={mascot.height}
            draggable={!drawingMode && selectedMascotImageId === mascot.id}
            onClick={(e) => {
              if (drawingMode) return;
              setSelectedMascotImageId(mascot.id);
              setSelectedRectId(null);
              e.cancelBubble = true;
            }}
            onDragStart={(e) => handleMascotDragStart(e, mascot.id)}
            onDragEnd={(e) => handleMascotDragEnd(e, mascot.id)}
            onTransformEnd={(e) => handleMascotTransformEnd(e, mascot.id)}
          />
          {selectedMascotImageId === mascot.id && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 최소 크기 제한
                newBox.width = Math.max(5, newBox.width);
                newBox.height = Math.max(5, newBox.height);
                return newBox;
              }}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default MascotLayer;

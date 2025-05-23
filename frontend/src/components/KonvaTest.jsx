import React, { useEffect, useState } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

export const KonvaTest = ({ imageUrl }) => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  return (
    <Stage width={600} height={400}>
      <Layer>
        {image && (
          <KonvaImage
            image={image}
            x={50}
            y={50}
            width={300}
            height={300}
            draggable
          />
        )}
      </Layer>
    </Stage>
  );
};

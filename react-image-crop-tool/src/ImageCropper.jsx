import React, { useRef, useState } from "react";

export default function ImageCropper() {
  const [imageURL, setImageURL] = useState(null);
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setSelection(null);
    }
  };

  const handleImageLoad = () => {
    const img = imageRef.current;
    setImageSize({ width: img.width, height: img.height });
  };

  const handleMouseDown = (e) => {
    const rect = e.target.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    x = Math.max(0, Math.min(x, imageSize.width));
    y = Math.max(0, Math.min(y, imageSize.height));
    setStartPoint({ x, y });
    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !startPoint) return;

    const rect = e.target.getBoundingClientRect();
    let endX = e.clientX - rect.left;
    let endY = e.clientY - rect.top;

    endX = Math.max(0, Math.min(endX, imageSize.width));
    endY = Math.max(0, Math.min(endY, imageSize.height));

    const width = Math.abs(endX - startPoint.x);
    const height = Math.abs(endY - startPoint.y);
    const x = Math.min(endX, startPoint.x);
    const y = Math.min(endY, startPoint.y);

    setSelection({ x, y, width, height });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleCrop = () => {
    if (!selection || !imageRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = selection.width;
    canvas.height = selection.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      imageRef.current,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    );

    const croppedImageURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "cropped.png";
    link.href = croppedImageURL;
    link.click();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Image Crop Tool (React + Canvas)</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {imageURL && (
        <div
          style={{ position: "relative", display: "inline-block", marginTop: "20px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <img
            src={imageURL}
            ref={imageRef}
            alt="To Crop"
            onLoad={handleImageLoad}
            style={{ maxWidth: "100%" }}
          />

          {selection && (
            <div
              style={{
                position: "absolute",
                top: selection.y,
                left: selection.x,
                width: selection.width,
                height: selection.height,
                border: "2px dashed red",
                backgroundColor: "rgba(255,0,0,0.1)",
              }}
            ></div>
          )}
        </div>
      )}

      {selection && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleCrop}>Crop</button>
          <p>
            Crop Area - X: {selection.x}, Y: {selection.y}, Width: {selection.width}, Height: {selection.height}
          </p>
        </div>
      )}

      <canvas ref={previewCanvasRef} style={{ marginTop: "20px", border: "1px solid #ccc" }} />
    </div>
  );
}
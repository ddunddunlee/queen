"use client";

import { useEffect, useRef } from "react";
import { loadImageFromFile } from "@/lib/image/resizeImage";

interface CropCanvasProps {
  file: File | null;
  cropScale: number;
}

export function CropCanvas({ cropScale, file }: CropCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas || !file) return;
      const image = await loadImageFromFile(file);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 420;
      canvas.height = 420;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      const ratio = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const drawWidth = image.naturalWidth * ratio;
      const drawHeight = image.naturalHeight * ratio;
      const dx = (canvas.width - drawWidth) / 2;
      const dy = (canvas.height - drawHeight) / 2;
      ctx.drawImage(image, dx, dy, drawWidth, drawHeight);

      const cropSize = Math.min(drawWidth, drawHeight) * cropScale;
      ctx.strokeStyle = "#4fb9ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect((canvas.width - cropSize) / 2, (canvas.height - cropSize) / 2, cropSize, cropSize);
    }

    draw();
  }, [cropScale, file]);

  return (
    <canvas
      aria-label="Crop preview canvas"
      className="pixelated h-auto w-full rounded-lg border border-line bg-ink"
      ref={canvasRef}
    />
  );
}

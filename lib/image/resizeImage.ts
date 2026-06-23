import type { SpriteSize } from "@/types/sprite";

function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export PNG from canvas."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeImageToSprite(file: File, size: SpriteSize): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sx = Math.floor((image.naturalWidth - sourceSize) / 2);
  const sy = Math.floor((image.naturalHeight - sourceSize) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, sx, sy, sourceSize, sourceSize, 0, 0, size, size);
  return blobFromCanvas(canvas);
}

export async function cropAndResizeImageToSprite(
  file: File,
  size: SpriteSize,
  crop: { x: number; y: number; size: number }
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, crop.x, crop.y, crop.size, crop.size, 0, 0, size, size);
  return blobFromCanvas(canvas);
}

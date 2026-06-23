import type { SpriteFrameMetadata, SpriteSize } from "@/types/sprite";
import { loadImageFromFile } from "./resizeImage";

export interface SpriteSheetOptions {
  frameSize: SpriteSize;
  columns: number;
  spacing: number;
  frameNames?: string[];
  name?: string;
}

export interface SpriteSheetMetadata {
  name: string;
  frameSize: {
    width: SpriteSize;
    height: SpriteSize;
  };
  columns: number;
  spacing: number;
  frames: SpriteFrameMetadata[];
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export sprite sheet PNG."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function createSpriteSheet(
  frames: File[],
  options: SpriteSheetOptions
): Promise<{
  imageBlob: Blob;
  metadata: SpriteSheetMetadata;
}> {
  if (frames.length === 0) {
    throw new Error("Upload at least one frame before creating a sprite sheet.");
  }

  const rows = Math.ceil(frames.length / options.columns);
  const width = options.columns * options.frameSize + Math.max(0, options.columns - 1) * options.spacing;
  const height = rows * options.frameSize + Math.max(0, rows - 1) * options.spacing;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;

  const metadataFrames: SpriteFrameMetadata[] = [];

  for (let index = 0; index < frames.length; index += 1) {
    const image = await loadImageFromFile(frames[index]);
    const col = index % options.columns;
    const row = Math.floor(index / options.columns);
    const x = col * (options.frameSize + options.spacing);
    const y = row * (options.frameSize + options.spacing);
    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sx = Math.floor((image.naturalWidth - sourceSize) / 2);
    const sy = Math.floor((image.naturalHeight - sourceSize) / 2);

    ctx.drawImage(image, sx, sy, sourceSize, sourceSize, x, y, options.frameSize, options.frameSize);
    metadataFrames.push({
      name: options.frameNames?.[index] || frames[index].name.replace(/\.[^.]+$/, "") || `frame_${index + 1}`,
      x,
      y,
      w: options.frameSize,
      h: options.frameSize
    });
  }

  const metadata: SpriteSheetMetadata = {
    name: options.name || "sprite_sheet",
    frameSize: {
      width: options.frameSize,
      height: options.frameSize
    },
    columns: options.columns,
    spacing: options.spacing,
    frames: metadataFrames
  };

  return {
    imageBlob: await canvasToBlob(canvas),
    metadata
  };
}

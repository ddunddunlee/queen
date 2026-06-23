"use client";

import { ImagePlus } from "lucide-react";

interface ImageUploaderProps {
  onFile: (file: File) => void;
}

export function ImageUploader({ onFile }: ImageUploaderProps) {
  return (
    <label className="block cursor-pointer rounded-lg border border-dashed border-slate-500 bg-panelSoft/60 p-8 text-center transition hover:border-sky hover:bg-panelSoft">
      <ImagePlus aria-hidden className="mx-auto h-8 w-8 text-sky" />
      <span className="mt-3 block font-semibold">Upload source image</span>
      <span className="mt-1 block text-sm text-slate-400">PNG keeps alpha channel during export.</span>
      <input
        accept="image/png,image/webp,image/jpeg"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
        type="file"
      />
    </label>
  );
}

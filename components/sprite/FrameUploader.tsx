"use client";

import { Upload } from "lucide-react";

interface FrameUploaderProps {
  onFiles: (files: File[]) => void;
}

export function FrameUploader({ onFiles }: FrameUploaderProps) {
  return (
    <label className="focus-within:ring-sky block cursor-pointer rounded-lg border border-dashed border-slate-500 bg-panelSoft/60 p-8 text-center transition hover:border-sky hover:bg-panelSoft">
      <Upload aria-hidden className="mx-auto h-8 w-8 text-sky" />
      <span className="mt-3 block font-semibold">Upload PNG frames</span>
      <span className="mt-1 block text-sm text-slate-400">Select multiple images to build a sprite sheet.</span>
      <input
        accept="image/png,image/webp,image/jpeg"
        className="sr-only"
        multiple
        onChange={(event) => onFiles(Array.from(event.target.files || []))}
        type="file"
      />
    </label>
  );
}

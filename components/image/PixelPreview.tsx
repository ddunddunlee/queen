"use client";

/* eslint-disable @next/next/no-img-element */

interface PixelPreviewProps {
  url: string | null;
}

export function PixelPreview({ url }: PixelPreviewProps) {
  return (
    <div className="tool-grid grid min-h-[280px] place-items-center rounded-lg border border-line bg-ink p-5">
      {url ? (
        <img alt="Normalized pixel preview" className="pixelated h-64 w-64 object-contain" src={url} />
      ) : (
        <div className="text-center text-sm text-slate-400">
          <p className="font-semibold text-slate-200">Pixelated preview</p>
          <p className="mt-1">Resize an uploaded image to see the PNG output.</p>
        </div>
      )}
    </div>
  );
}

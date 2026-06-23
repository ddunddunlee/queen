"use client";

/* eslint-disable @next/next/no-img-element */

interface SpriteSheetPreviewProps {
  url: string | null;
}

export function SpriteSheetPreview({ url }: SpriteSheetPreviewProps) {
  return (
    <div className="tool-grid grid min-h-[280px] place-items-center rounded-lg border border-line bg-ink p-5">
      {url ? (
        <img alt="Sprite sheet preview" className="pixelated max-h-[420px] max-w-full object-contain" src={url} />
      ) : (
        <div className="text-center text-sm text-slate-400">
          <p className="font-semibold text-slate-200">Sprite sheet preview</p>
          <p className="mt-1">Upload frames and generate a sheet.</p>
        </div>
      )}
    </div>
  );
}

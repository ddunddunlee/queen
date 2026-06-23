"use client";

import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { downloadBlob } from "@/lib/image/downloadBlob";
import { cropAndResizeImageToSprite, loadImageFromFile } from "@/lib/image/resizeImage";
import type { SpriteSize } from "@/types/sprite";
import { CropCanvas } from "./CropCanvas";
import { ImageUploader } from "./ImageUploader";
import { PixelPreview } from "./PixelPreview";

export function ImageNormalizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [size, setSize] = useState<SpriteSize>(32);
  const [cropScale, setCropScale] = useState(1);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const resultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    resultUrlRef.current = resultUrl;
  }, [resultUrl]);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  async function normalize() {
    if (!file) return;
    try {
      setError("");
      const image = await loadImageFromFile(file);
      const baseSize = Math.min(image.naturalWidth, image.naturalHeight);
      const cropSize = Math.max(1, Math.floor(baseSize * cropScale));
      const crop = {
        x: Math.floor((image.naturalWidth - cropSize) / 2),
        y: Math.floor((image.naturalHeight - cropSize) / 2),
        size: cropSize
      };
      const blob = await cropAndResizeImageToSprite(file, size, crop);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not normalize image.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="space-y-5">
        <div>
          <p className="font-mono text-xs uppercase text-sky">Pixel Export</p>
          <h1 className="mt-1 text-2xl font-bold">Image Normalizer</h1>
        </div>
        <ImageUploader
          onFile={(nextFile) => {
            setFile(nextFile);
            setResultBlob(null);
            if (resultUrl) URL.revokeObjectURL(resultUrl);
            setResultUrl(null);
          }}
        />
        {file ? <CropCanvas cropScale={cropScale} file={file} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Output size</span>
            <Select value={size} onChange={(event) => setSize(Number(event.target.value) as SpriteSize)}>
              <option value={32}>32x32</option>
              <option value={64}>64x64</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Center crop</span>
            <input
              className="w-full accent-sky"
              max={1}
              min={0.35}
              onChange={(event) => setCropScale(Number(event.target.value))}
              step={0.05}
              type="range"
              value={cropScale}
            />
          </label>
        </div>
        {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        <Button disabled={!file} onClick={normalize}>
          Normalize PNG
        </Button>
      </Card>
      <Card className="space-y-5">
        <PixelPreview url={resultUrl} />
        <Button disabled={!resultBlob} onClick={() => resultBlob && downloadBlob(resultBlob, `normalized_${size}x${size}.png`)}>
          <Download aria-hidden className="h-4 w-4" />
          Download PNG
        </Button>
      </Card>
    </div>
  );
}

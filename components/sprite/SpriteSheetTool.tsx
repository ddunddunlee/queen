"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { createSpriteSheet, type SpriteSheetMetadata } from "@/lib/image/createSpriteSheet";
import type { SpriteSize } from "@/types/sprite";
import { ExportPanel } from "./ExportPanel";
import { FrameList, type SpriteFrameItem } from "./FrameList";
import { FrameUploader } from "./FrameUploader";
import { SpriteSheetPreview } from "./SpriteSheetPreview";

export function SpriteSheetTool() {
  const [frames, setFrames] = useState<SpriteFrameItem[]>([]);
  const [frameSize, setFrameSize] = useState<SpriteSize>(32);
  const [columns, setColumns] = useState(8);
  const [spacing, setSpacing] = useState(0);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [metadata, setMetadata] = useState<SpriteSheetMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const framesRef = useRef<SpriteFrameItem[]>([]);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      framesRef.current.forEach((frame) => URL.revokeObjectURL(frame.previewUrl));
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function addFiles(files: File[]) {
    const nextFrames = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
      file,
      name: file.name.replace(/\.[^.]+$/, ""),
      previewUrl: URL.createObjectURL(file)
    }));
    setFrames((current) => [...current, ...nextFrames]);
  }

  function renameFrame(id: string, name: string) {
    setFrames((current) => current.map((frame) => (frame.id === id ? { ...frame, name } : frame)));
  }

  function removeFrame(id: string) {
    setFrames((current) => {
      const frame = current.find((item) => item.id === id);
      if (frame) URL.revokeObjectURL(frame.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function moveFrame(id: string, direction: -1 | 1) {
    setFrames((current) => {
      const index = current.findIndex((frame) => frame.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  async function generate() {
    try {
      setError("");
      const result = await createSpriteSheet(
        frames.map((frame) => frame.file),
        {
          frameSize,
          columns,
          spacing,
          frameNames: frames.map((frame) => frame.name),
          name: "pixel_sprite_sheet"
        }
      );
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setImageBlob(result.imageBlob);
      setMetadata(result.metadata);
      setPreviewUrl(URL.createObjectURL(result.imageBlob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate sprite sheet.");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <Card className="space-y-5">
        <div>
          <p className="font-mono text-xs uppercase text-sky">Export Asset</p>
          <h1 className="mt-1 text-2xl font-bold">Sprite Sheet Generator</h1>
        </div>
        <FrameUploader onFiles={addFiles} />
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Cell size</span>
            <Select value={frameSize} onChange={(event) => setFrameSize(Number(event.target.value) as SpriteSize)}>
              <option value={32}>32x32</option>
              <option value={64}>64x64</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Columns</span>
            <Select value={columns} onChange={(event) => setColumns(Number(event.target.value))}>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Spacing</span>
            <Select value={spacing} onChange={(event) => setSpacing(Number(event.target.value))}>
              <option value={0}>0px</option>
              <option value={1}>1px</option>
              <option value={2}>2px</option>
            </Select>
          </label>
        </div>
        <FrameList frames={frames} onMove={moveFrame} onRemove={removeFrame} onRename={renameFrame} />
        {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        <Button disabled={frames.length === 0} onClick={generate}>
          Generate Sprite Sheet
        </Button>
      </Card>
      <Card className="space-y-5">
        <SpriteSheetPreview url={previewUrl} />
        <ExportPanel imageBlob={imageBlob} metadata={metadata} />
        {metadata ? (
          <pre className="max-h-80 overflow-auto rounded-lg border border-line bg-ink p-3 text-xs text-slate-300">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        ) : null}
      </Card>
    </div>
  );
}

"use client";

/* eslint-disable @next/next/no-img-element */

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface SpriteFrameItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
}

interface FrameListProps {
  frames: SpriteFrameItem[];
  onRename: (id: string, name: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

export function FrameList({ frames, onMove, onRemove, onRename }: FrameListProps) {
  if (frames.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-ink/50 p-6 text-center text-sm text-slate-400">
        No frames uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {frames.map((frame, index) => (
        <article className="grid gap-3 rounded-lg border border-line bg-panelSoft/70 p-3 sm:grid-cols-[64px_1fr_auto]" key={frame.id}>
          <img
            alt={frame.name}
            className="pixelated h-16 w-16 rounded-md border border-line bg-ink object-contain p-1"
            src={frame.previewUrl}
          />
          <label className="space-y-1">
            <span className="font-mono text-xs text-slate-500">Frame {index + 1}</span>
            <Input value={frame.name} onChange={(event) => onRename(frame.id, event.target.value)} />
          </label>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Move frame up"
              className="h-10 w-10 p-0"
              disabled={index === 0}
              onClick={() => onMove(frame.id, -1)}
              variant="secondary"
            >
              <ArrowUp aria-hidden className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Move frame down"
              className="h-10 w-10 p-0"
              disabled={index === frames.length - 1}
              onClick={() => onMove(frame.id, 1)}
              variant="secondary"
            >
              <ArrowDown aria-hidden className="h-4 w-4" />
            </Button>
            <Button aria-label="Remove frame" className="h-10 w-10 p-0" onClick={() => onRemove(frame.id)} variant="danger">
              <Trash2 aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

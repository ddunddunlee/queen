"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { FramePreset } from "@/types/sprite";

interface FramePromptListProps {
  prompts: Array<{ frame: FramePreset; prompt: string }>;
}

export function FramePromptList({ prompts }: FramePromptListProps) {
  const [copiedFrame, setCopiedFrame] = useState<string | null>(null);

  async function copy(prompt: string, frameName: string) {
    await navigator.clipboard.writeText(prompt);
    setCopiedFrame(frameName);
    window.setTimeout(() => setCopiedFrame(null), 1500);
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Frame Prompts</h2>
      <div className="grid gap-3">
        {prompts.map(({ frame, prompt }, index) => (
          <article className="rounded-lg border border-line bg-panelSoft/70 p-4" key={frame.name}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-sky">#{String(index + 1).padStart(2, "0")}</p>
                <h3 className="font-semibold">{frame.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{frame.description}</p>
              </div>
              <Button onClick={() => copy(prompt, frame.name)} variant="secondary">
                <Copy aria-hidden className="h-4 w-4" />
                {copiedFrame === frame.name ? "Copied" : "Copy"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

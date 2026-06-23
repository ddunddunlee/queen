"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

interface PromptPreviewProps {
  prompt: string;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Generated Prompt</h2>
        <Button onClick={copyPrompt}>
          <Copy aria-hidden className="h-4 w-4" />
          {copied ? "Copied" : "Copy Prompt"}
        </Button>
      </div>
      <Textarea className="min-h-[360px] font-mono text-xs" readOnly value={prompt} />
    </div>
  );
}

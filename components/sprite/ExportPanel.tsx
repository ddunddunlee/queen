"use client";

import JSZip from "jszip";
import { Download, FileJson, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadBlob, downloadJson } from "@/lib/image/downloadBlob";
import type { SpriteSheetMetadata } from "@/lib/image/createSpriteSheet";
import {
  createAsepriteMetadata,
  createEngineReadme,
  createGodotImportConfig,
  createUnityMetadata
} from "@/lib/image/exportMetadata";

interface ExportPanelProps {
  imageBlob: Blob | null;
  metadata: SpriteSheetMetadata | null;
}

export function ExportPanel({ imageBlob, metadata }: ExportPanelProps) {
  async function downloadZip() {
    if (!imageBlob || !metadata) return;
    const zip = new JSZip();
    zip.file(`${metadata.name}.png`, imageBlob);
    zip.file("metadata.json", JSON.stringify(metadata, null, 2));
    zip.file("aseprite.json", JSON.stringify(createAsepriteMetadata(metadata), null, 2));
    zip.file("unity.sprite.json", JSON.stringify(createUnityMetadata(metadata), null, 2));
    zip.file("godot.import", createGodotImportConfig(metadata));
    zip.file("ENGINE_IMPORT.md", createEngineReadme(metadata));
    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, `${metadata.name}.zip`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Button disabled={!imageBlob} onClick={() => imageBlob && downloadBlob(imageBlob, `${metadata?.name || "sprite_sheet"}.png`)}>
        <Download aria-hidden className="h-4 w-4" />
        PNG
      </Button>
      <Button disabled={!metadata} onClick={() => metadata && downloadJson(metadata, "metadata.json")} variant="secondary">
        <FileJson aria-hidden className="h-4 w-4" />
        JSON
      </Button>
      <Button disabled={!imageBlob || !metadata} onClick={downloadZip} variant="secondary">
        <Package aria-hidden className="h-4 w-4" />
        ZIP
      </Button>
    </div>
  );
}

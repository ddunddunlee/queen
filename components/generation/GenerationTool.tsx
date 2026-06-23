"use client";

import JSZip from "jszip";
import { Download, Loader2, Package, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { base64ToBlob } from "@/lib/image/base64ToBlob";
import { downloadBlob } from "@/lib/image/downloadBlob";
import type { GeneratedSprite, GenerateSpritesResponse } from "@/types/generation";
import type { PreviewSpriteSize } from "@/types/sprite";
import { SubscriptionPanel } from "./SubscriptionPanel";

/* eslint-disable @next/next/no-img-element */

const defaultPrompt = `Create a game-ready pixel art sprite of SD Knight with Spear.

Character concept:
A cute SD/chibi medieval knight wearing silver plate armor, a closed helmet with visor slits, a red plume, gold armor accents, and holding a brown spear with a silver spearhead.

Style requirements:
- retro pixel art
- SD/chibi proportions
- limited palette
- transparent background
- centered composition
- readable silhouette at 32x32

Animation frame:
- Frame name: attack_thrust
- Motion description: lunging forward and extending the spear horizontally in a clear stabbing motion`;

export function GenerationTool() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [count, setCount] = useState(4);
  const [spriteSize, setSpriteSize] = useState<PreviewSpriteSize>(32);
  const [subscriptionToken, setSubscriptionToken] = useState("");
  const [sprites, setSprites] = useState<GeneratedSprite[]>([]);
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("sprite-generator-subscription-token");
    if (savedToken) {
      setSubscriptionToken(savedToken);
    } else if (process.env.NEXT_PUBLIC_ENABLE_DEV_SUBSCRIPTION === "true") {
      setSubscriptionToken("dev-subscriber");
    }
  }, []);

  useEffect(() => {
    if (subscriptionToken) {
      window.localStorage.setItem("sprite-generator-subscription-token", subscriptionToken);
    }
  }, [subscriptionToken]);

  const previews = useMemo(
    () =>
      sprites.map((sprite) => ({
        ...sprite,
        src: `data:${sprite.mimeType};base64,${sprite.b64Json}`
      })),
    [sprites]
  );

  async function generate() {
    try {
      setIsGenerating(true);
      setError("");
      setStatus("Generating sprites...");
      setSprites([]);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subscription-token": subscriptionToken
        },
        body: JSON.stringify({ prompt, count, spriteSize })
      });
      const payload = (await response.json()) as Partial<GenerateSpritesResponse> & { error?: string };

      if (!response.ok || !payload.sprites) {
        throw new Error(payload.error || "Could not generate sprites.");
      }

      setSprites(payload.sprites);
      setModel(payload.model || "");
      setStatus(`Completed ${payload.sprites.length} sprite${payload.sprites.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate sprites.");
      setStatus("");
    } finally {
      setIsGenerating(false);
    }
  }

  async function downloadAll() {
    const zip = new JSZip();
    sprites.forEach((sprite, index) => {
      zip.file(`generated_sprite_${String(index + 1).padStart(2, "0")}.png`, base64ToBlob(sprite.b64Json, sprite.mimeType));
    });
    zip.file(
      "generation_metadata.json",
      JSON.stringify(
        {
          model,
          count: sprites.length,
          spriteSize,
          prompt,
          files: sprites.map((sprite, index) => ({
            id: sprite.id,
            file: `generated_sprite_${String(index + 1).padStart(2, "0")}.png`
          }))
        },
        null,
        2
      )
    );
    zip.file(
      "ENGINE_IMPORT.md",
      `# Generated Sprites Game Engine Import

## Included files

- Individual transparent PNG files
- generation_metadata.json with prompt, model, count, and target size

## Recommended import settings

Unity:
- Texture Type: Sprite (2D and UI)
- Sprite Mode: Single
- Pixels Per Unit: ${spriteSize}
- Filter Mode: Point
- Compression: None
- Alpha Is Transparency: enabled

Godot:
- Filter: disabled / nearest
- Mipmaps: disabled
- Repeat: disabled

Aseprite:
- Open the PNG files as individual frames or import them into a new animation.
`
    );
    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, "generated_sprites.zip");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_460px]">
      <Card className="space-y-5">
        <div>
          <p className="font-mono text-xs uppercase text-sky">Subscribed generation</p>
          <h1 className="mt-1 text-2xl font-bold">Auto Sprite Generation</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Enter one prompt, choose a count, and let the server generate every PNG through the configured image API.
          </p>
        </div>
        <SubscriptionPanel token={subscriptionToken} onTokenChange={setSubscriptionToken} />
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Prompt</span>
          <Textarea className="min-h-[320px] font-mono text-xs" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Generation count</span>
            <Select value={count} onChange={(event) => setCount(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Target sprite size</span>
            <Select value={spriteSize} onChange={(event) => setSpriteSize(Number(event.target.value) as PreviewSpriteSize)}>
              <option value={32}>32x32</option>
              <option value={64}>64x64</option>
              <option value={128}>128x128 preview only</option>
            </Select>
          </label>
        </div>
        {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
        {status ? <p className="rounded-md border border-sky/30 bg-sky/10 p-3 text-sm text-sky">{status}</p> : null}
        <Button disabled={isGenerating || !prompt.trim() || !subscriptionToken.trim()} onClick={generate}>
          {isGenerating ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <WandSparkles aria-hidden className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate Until Complete"}
        </Button>
      </Card>
      <Card className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Generated Assets</h2>
            <p className="mt-1 text-sm text-slate-400">{model ? `Model: ${model}` : "PNG results will appear here."}</p>
          </div>
          <Button disabled={sprites.length === 0} onClick={downloadAll} variant="secondary">
            <Package aria-hidden className="h-4 w-4" />
            ZIP
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {previews.length === 0 ? (
            <div className="tool-grid col-span-full grid min-h-[320px] place-items-center rounded-lg border border-line bg-ink p-5 text-center text-sm text-slate-400">
              <div>
                <p className="font-semibold text-slate-200">No generated sprites yet</p>
                <p className="mt-1">Generation runs server-side and returns PNG assets.</p>
              </div>
            </div>
          ) : (
            previews.map((sprite, index) => (
              <article className="rounded-lg border border-line bg-panelSoft/70 p-3" key={sprite.id}>
                <img alt={`Generated sprite ${index + 1}`} className="pixelated aspect-square w-full rounded-md bg-ink object-contain p-2" src={sprite.src} />
                <Button
                  className="mt-3 w-full"
                  onClick={() => downloadBlob(base64ToBlob(sprite.b64Json, sprite.mimeType), `generated_sprite_${index + 1}.png`)}
                  variant="secondary"
                >
                  <Download aria-hidden className="h-4 w-4" />
                  PNG {index + 1}
                </Button>
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

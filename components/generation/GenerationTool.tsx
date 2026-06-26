"use client";

/* eslint-disable @next/next/no-img-element */

import JSZip from "jszip";
import { Copy, Download, Loader2, Package, Plus, Shuffle, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { base64ToBlob } from "@/lib/image/base64ToBlob";
import { downloadBlob } from "@/lib/image/downloadBlob";
import type { GeneratedSprite, GenerateSpritesResponse } from "@/types/generation";
import type { PreviewSpriteSize } from "@/types/sprite";
import { SubscriptionPanel } from "./SubscriptionPanel";

const defaultBasePrompt = `Core concept lock:
- Create game-ready pixel art assets only.
- Keep one consistent character design, proportions, color palette, outline thickness, and camera scale across every output.
- Transparent background.
- Centered full-body sprite.
- Crisp hard-edged pixels.
- No anti-aliasing, no blur, no gradients, no soft painterly shading.
- Use a visible pixel grid mindset: every shape must read clearly at the final sprite size.

Character:
SD/chibi medieval knight wearing silver plate armor, closed helmet with visor slits, red plume, gold armor accents, and holding a brown spear with a silver spearhead.

Global style:
retro game sprite, limited palette, thick 1px-style black outline, readable silhouette, engine-ready PNG`;

const defaultExtraPrompt = `Make the pose strong and readable.
Keep weapon direction clear.
Avoid cropped body parts.
Leave enough transparent padding for animation alignment.`;

const baseTasks = [
  "front view idle",
  "back view idle",
  "left side idle",
  "right side idle",
  "walk cycle key pose",
  "attack windup",
  "attack strike",
  "critical attack impact",
  "hit reaction",
  "death pose"
];

const keywordBank = [
  "silver armor",
  "red plume",
  "gold trim",
  "hero pose",
  "tiny boots",
  "clear spear silhouette",
  "high contrast",
  "compact chibi body",
  "arcade RPG",
  "16-bit feel",
  "clean outline",
  "sharp shadow"
];

function pickKeywords(count: number) {
  return [...keywordBank].sort(() => Math.random() - 0.5).slice(0, count);
}

function buildFinalPrompt(basePrompt: string, extraPrompt: string, spriteSize: PreviewSpriteSize) {
  return `${basePrompt}

Additional prompt:
${extraPrompt || "- no extra notes"}

Output contract:
- Final target size: ${spriteSize}x${spriteSize}
- Build as a pixel asset for immediate game development use.
- Keep alignment consistent so multiple outputs can be used as animation frames.
- Transparent PNG, single sprite only, not a sprite sheet.`;
}

export function GenerationTool() {
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const [basePrompt, setBasePrompt] = useState(defaultBasePrompt);
  const [extraPrompt, setExtraPrompt] = useState(defaultExtraPrompt);
  const [count, setCount] = useState(8);
  const [spriteSize, setSpriteSize] = useState<PreviewSpriteSize>(32);
  const [randomKeywordCount, setRandomKeywordCount] = useState(3);
  const [customKeywordText, setCustomKeywordText] = useState("blue cape, elite guard, darker armor");
  const [selectedTasks, setSelectedTasks] = useState<string[]>(baseTasks.slice(0, 8));
  const [customTask, setCustomTask] = useState("");
  const [subscriptionToken, setSubscriptionToken] = useState("");
  const [sprites, setSprites] = useState<GeneratedSprite[]>([]);
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
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

  const customKeywords = useMemo(
    () =>
      customKeywordText
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    [customKeywordText]
  );

  const finalPrompt = useMemo(() => buildFinalPrompt(basePrompt, extraPrompt, spriteSize), [basePrompt, extraPrompt, spriteSize]);

  const plannedJobs = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => selectedTasks[index % Math.max(1, selectedTasks.length)] || "single idle sprite"),
    [count, selectedTasks]
  );

  const keywordBatches = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const random = pickKeywords(randomKeywordCount);
        return [...random, ...customKeywords];
      }),
    [count, customKeywords, randomKeywordCount]
  );

  const previews = useMemo(
    () =>
      sprites.map((sprite) => ({
        ...sprite,
        src: `data:${sprite.mimeType};base64,${sprite.b64Json}`
      })),
    [sprites]
  );

  function toggleTask(task: string) {
    setSelectedTasks((current) => (current.includes(task) ? current.filter((item) => item !== task) : [...current, task]));
  }

  function addCustomTask() {
    const task = customTask.trim();
    if (!task) return;
    if (!selectedTasks.includes(task)) {
      setSelectedTasks((current) => [...current, task]);
    }
    setCustomTask("");
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function generate() {
    if (isStaticExport) {
      setError("GitHub Pages is static hosting. Automatic OpenAI generation needs Vercel or another server runtime.");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      setStatus("Generating pixel assets...");
      setSprites([]);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-subscription-token": subscriptionToken
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          count,
          spriteSize,
          assetJobs: plannedJobs,
          keywordBatches
        })
      });
      const payload = (await response.json()) as Partial<GenerateSpritesResponse> & { error?: string };

      if (!response.ok || !payload.sprites) {
        throw new Error(payload.error || "Could not generate sprites.");
      }

      setSprites(payload.sprites);
      setModel(payload.model || "");
      setStatus(`Completed ${payload.sprites.length} game-ready pixel asset${payload.sprites.length === 1 ? "" : "s"}.`);
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
      zip.file(`asset_${String(index + 1).padStart(2, "0")}_${plannedJobs[index]?.replace(/[^a-z0-9]+/gi, "_") || "sprite"}.png`, base64ToBlob(sprite.b64Json, sprite.mimeType));
    });
    zip.file(
      "generation_metadata.json",
      JSON.stringify(
        {
          model,
          count: sprites.length,
          spriteSize,
          basePrompt,
          extraPrompt,
          jobs: plannedJobs,
          keywordBatches
        },
        null,
        2
      )
    );
    zip.file(
      "ENGINE_IMPORT.md",
      `# Pixel Asset Import

Unity:
- Texture Type: Sprite (2D and UI)
- Sprite Mode: Single
- Pixels Per Unit: ${spriteSize}
- Filter Mode: Point
- Compression: None
- Alpha Is Transparency: enabled

Godot:
- Filter: nearest / disabled
- Mipmaps: disabled
- Repeat: disabled

Grid:
- Authoring target: ${spriteSize}x${spriteSize}
- Keep sprites aligned on the same virtual cell for animation.
`
    );
    const archive = await zip.generateAsync({ type: "blob" });
    downloadBlob(archive, "pixel_game_assets.zip");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
      <section className="grid gap-4">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-sky">one-page pixel asset console</p>
              <h1 className="mt-1 text-2xl font-bold">Pixel Asset Generator</h1>
            </div>
            <div className="rounded-md border border-sky/30 bg-sky/10 px-3 py-2 font-mono text-xs text-sky">
              grid-first / transparent PNG / game-ready
            </div>
          </div>
          {isStaticExport ? (
            <p className="rounded-md border border-amber/30 bg-amber/10 p-3 text-sm leading-6 text-amber">
              GitHub Pages에서는 프롬프트 구성 화면만 동작합니다. 자동 생성은 Vercel 서버 배포에서 켜집니다.
            </p>
          ) : null}
          <SubscriptionPanel token={subscriptionToken} onTokenChange={setSubscriptionToken} />
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">Base Prompt Lock</h2>
              <span className="font-mono text-xs text-slate-500">applies to all jobs</span>
            </div>
            <Textarea className="min-h-[280px] font-mono text-xs" value={basePrompt} onChange={(event) => setBasePrompt(event.target.value)} />
          </Card>

          <Card className="space-y-3">
            <h2 className="font-semibold">Additional Prompt</h2>
            <Textarea className="min-h-[120px] font-mono text-xs" value={extraPrompt} onChange={(event) => setExtraPrompt(event.target.value)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Asset size</span>
                <Select value={spriteSize} onChange={(event) => setSpriteSize(Number(event.target.value) as PreviewSpriteSize)}>
                  <option value={32}>32x32</option>
                  <option value={64}>64x64</option>
                  <option value={128}>128x128 preview</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Work amount</span>
                <Select value={count} onChange={(event) => setCount(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Random keywords</span>
                <Select value={randomKeywordCount} onChange={(event) => setRandomKeywordCount(Number(event.target.value))}>
                  {[0, 1, 2, 3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Fixed keywords</span>
              <Input value={customKeywordText} onChange={(event) => setCustomKeywordText(event.target.value)} />
            </label>
          </Card>
        </div>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Asset Work Types</h2>
            <div className="flex gap-2">
              <Input className="w-52" placeholder="custom pose / state" value={customTask} onChange={(event) => setCustomTask(event.target.value)} />
              <Button className="h-10 w-10 p-0" onClick={addCustomTask} variant="secondary">
                <Plus aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {baseTasks.map((task) => (
              <button
                className={`focus-ring min-h-11 rounded-md border px-3 py-2 text-left text-sm transition ${
                  selectedTasks.includes(task)
                    ? "border-sky bg-sky/15 text-white"
                    : "border-line bg-ink/60 text-slate-400 hover:border-slate-500"
                }`}
                key={task}
                onClick={() => toggleTask(task)}
                type="button"
              >
                {task}
              </button>
            ))}
          </div>
          {selectedTasks.some((task) => !baseTasks.includes(task)) ? (
            <div className="flex flex-wrap gap-2">
              {selectedTasks
                .filter((task) => !baseTasks.includes(task))
                .map((task) => (
                  <button
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-violet/40 bg-violet/15 px-3 py-2 text-sm text-white"
                    key={task}
                    onClick={() => toggleTask(task)}
                    type="button"
                  >
                    {task}
                    <X aria-hidden className="h-3 w-3" />
                  </button>
                ))}
            </div>
          ) : null}
        </Card>
      </section>

      <aside className="grid gap-4">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Final Prompt</h2>
            <Button onClick={copyPrompt} variant="secondary">
              <Copy aria-hidden className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea className="min-h-[220px] font-mono text-xs" readOnly value={finalPrompt} />
          <div className="grid gap-2">
            {plannedJobs.map((job, index) => (
              <div className="rounded-md border border-line bg-ink/60 px-3 py-2 text-xs" key={`${job}-${index}`}>
                <span className="font-mono text-sky">#{index + 1}</span> {job}
                <span className="block truncate text-slate-500">
                  <Shuffle aria-hidden className="mr-1 inline h-3 w-3" />
                  {keywordBatches[index]?.join(", ") || "no random keywords"}
                </span>
              </div>
            ))}
          </div>
          {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
          {status ? <p className="rounded-md border border-sky/30 bg-sky/10 p-3 text-sm text-sky">{status}</p> : null}
          <Button disabled={isStaticExport || isGenerating || !basePrompt.trim() || !subscriptionToken.trim()} onClick={generate}>
            {isGenerating ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <WandSparkles aria-hidden className="h-4 w-4" />}
            {isGenerating ? "Generating..." : "Generate Assets"}
          </Button>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Pixel Grid Output</h2>
              <p className="mt-1 text-xs text-slate-500">{model || `${spriteSize}x${spriteSize} virtual cells`}</p>
            </div>
            <Button disabled={sprites.length === 0} onClick={downloadAll} variant="secondary">
              <Package aria-hidden className="h-4 w-4" />
              ZIP
            </Button>
          </div>
          <div className="tool-grid grid min-h-[360px] gap-3 rounded-lg border border-line bg-ink p-3 sm:grid-cols-2">
            {previews.length === 0
              ? plannedJobs.slice(0, Math.min(count, 8)).map((job, index) => (
                  <div
                    className="grid aspect-square place-items-center rounded-md border border-sky/20 bg-ink/75 p-3 text-center"
                    key={`${job}-placeholder-${index}`}
                  >
                    <div>
                      <span className="font-mono text-xs text-sky">{spriteSize}x{spriteSize}</span>
                      <p className="mt-2 text-sm font-semibold text-slate-300">{job}</p>
                    </div>
                  </div>
                ))
              : previews.map((sprite, index) => (
                  <article className="rounded-md border border-line bg-panelSoft/70 p-2" key={sprite.id}>
                    <img alt={`Generated asset ${index + 1}`} className="pixelated aspect-square w-full rounded bg-ink object-contain p-2" src={sprite.src} />
                    <Button
                      className="mt-2 w-full"
                      onClick={() => downloadBlob(base64ToBlob(sprite.b64Json, sprite.mimeType), `asset_${index + 1}.png`)}
                      variant="secondary"
                    >
                      <Download aria-hidden className="h-4 w-4" />
                      PNG
                    </Button>
                  </article>
                ))}
          </div>
        </Card>
      </aside>
    </div>
  );
}

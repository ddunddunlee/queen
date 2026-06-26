"use client";

/* eslint-disable @next/next/no-img-element */

import JSZip from "jszip";
import {
  Copy,
  Download,
  Layers3,
  Loader2,
  Package,
  Plus,
  Save,
  Shuffle,
  Sparkles,
  Trash2,
  WandSparkles,
  X
} from "lucide-react";
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
  { label: "앞 idle", prompt: "front view idle" },
  { label: "뒤 idle", prompt: "back view idle" },
  { label: "왼쪽 idle", prompt: "left side idle" },
  { label: "오른쪽 idle", prompt: "right side idle" },
  { label: "걷기", prompt: "walk cycle key pose" },
  { label: "공격 준비", prompt: "attack windup" },
  { label: "공격", prompt: "attack strike" },
  { label: "크리티컬", prompt: "critical attack impact" },
  { label: "피격", prompt: "hit reaction" },
  { label: "사망", prompt: "death pose" }
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

const promptPresetStorageKey = "pixel-asset-prompt-presets";

interface PromptPreset {
  id: string;
  name: string;
  basePrompt: string;
  extraPrompt: string;
  customKeywordText: string;
}

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

function buildOptimizedPrompt(rawPrompt: string, existingExtraPrompt: string) {
  const concept = rawPrompt.trim() || "A game-ready pixel art character asset.";
  const extra = existingExtraPrompt.trim();

  return `Core concept lock:
- Create game-ready pixel art assets only.
- Maintain one consistent design language across every generated output.
- Use consistent character proportions, silhouette, color palette, outline thickness, camera scale, and lighting.
- Transparent background.
- Centered full-body sprite.
- Crisp hard-edged pixels.
- No anti-aliasing, no blur, no gradients, no soft painterly shading.
- Every shape must read clearly on a visible pixel grid at the final sprite size.

Character / asset concept:
${concept}

Required visual constraints:
- limited palette
- thick 1px-style black outline
- readable silhouette
- compact game-engine-friendly sprite
- clean separation between body, weapon, clothing, and accessories
- enough transparent padding for animation alignment

Global style:
retro pixel game asset, sprite-sheet compatible, engine-ready transparent PNG${extra ? `\n\nAdditional locked notes:\n${extra}` : ""}`;
}

export function GenerationTool() {
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const [basePrompt, setBasePrompt] = useState(defaultBasePrompt);
  const [extraPrompt, setExtraPrompt] = useState(defaultExtraPrompt);
  const [count, setCount] = useState(8);
  const [spriteSize, setSpriteSize] = useState<PreviewSpriteSize>(32);
  const [randomKeywordCount, setRandomKeywordCount] = useState(3);
  const [customKeywordText, setCustomKeywordText] = useState("blue cape, elite guard, darker armor");
  const [selectedTasks, setSelectedTasks] = useState<string[]>(baseTasks.slice(0, 8).map((task) => task.prompt));
  const [customTask, setCustomTask] = useState("");
  const [presetName, setPresetName] = useState("기본 기사 프리셋");
  const [promptPresets, setPromptPresets] = useState<PromptPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [converterInput, setConverterInput] = useState("");
  const [converterOutput, setConverterOutput] = useState("");
  const [subscriptionToken, setSubscriptionToken] = useState("");
  const [sprites, setSprites] = useState<GeneratedSprite[]>([]);
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedToken = window.localStorage.getItem("sprite-generator-subscription-token");
    const savedPresets = window.localStorage.getItem(promptPresetStorageKey);

    if (savedPresets) {
      try {
        const parsedPresets = JSON.parse(savedPresets) as PromptPreset[];
        if (Array.isArray(parsedPresets)) {
          setPromptPresets(parsedPresets);
        }
      } catch {
        window.localStorage.removeItem(promptPresetStorageKey);
      }
    }

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

  useEffect(() => {
    window.localStorage.setItem(promptPresetStorageKey, JSON.stringify(promptPresets));
  }, [promptPresets]);

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

  function savePromptPreset() {
    const name = presetName.trim();
    if (!name) {
      setError("저장 이름을 입력해 주세요.");
      return;
    }

    const preset: PromptPreset = {
      id: selectedPresetId || crypto.randomUUID(),
      name,
      basePrompt,
      extraPrompt,
      customKeywordText
    };

    setPromptPresets((current) => {
      const exists = current.some((item) => item.id === preset.id);
      return exists ? current.map((item) => (item.id === preset.id ? preset : item)) : [...current, preset];
    });
    setSelectedPresetId(preset.id);
    setStatus(`"${name}" 프리셋 저장 완료.`);
    setError("");
  }

  function loadPromptPreset(id: string) {
    const preset = promptPresets.find((item) => item.id === id);
    setSelectedPresetId(id);
    if (!preset) return;
    setPresetName(preset.name);
    setBasePrompt(preset.basePrompt);
    setExtraPrompt(preset.extraPrompt);
    setCustomKeywordText(preset.customKeywordText);
    setStatus(`"${preset.name}" 프리셋 불러오기 완료.`);
  }

  function deletePromptPreset() {
    if (!selectedPresetId) return;
    const preset = promptPresets.find((item) => item.id === selectedPresetId);
    setPromptPresets((current) => current.filter((item) => item.id !== selectedPresetId));
    setSelectedPresetId("");
    setStatus(preset ? `"${preset.name}" 프리셋 삭제 완료.` : "프리셋 삭제 완료.");
  }

  function openPromptConverter() {
    setConverterInput(basePrompt);
    setConverterOutput("");
    setIsConverterOpen(true);
  }

  function convertPrompt() {
    setConverterOutput(buildOptimizedPrompt(converterInput, extraPrompt));
  }

  function applyConvertedPrompt() {
    if (!converterOutput.trim()) return;
    setBasePrompt(converterOutput);
    setIsConverterOpen(false);
    setStatus("변환된 프롬프트를 기본 프롬프트에 적용했습니다.");
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function generate() {
    if (isStaticExport) {
      setError("GitHub Pages는 정적 호스팅이라 자동 생성 API를 실행할 수 없습니다. Vercel 배포에서 사용할 수 있습니다.");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      setStatus("픽셀 에셋 생성 중...");
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
      setStatus(`${payload.sprites.length}개 에셋 생성 완료.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "에셋 생성에 실패했습니다.");
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
    <div className="grid gap-4 xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
      <section className="grid content-start gap-4">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-sky">PixIan / pixel asset console</p>
              <h1 className="mt-1 text-2xl font-bold">PixIan (픽시안)</h1>
            </div>
            <div className="rounded-md border border-sky/30 bg-sky/10 px-3 py-2 font-mono text-xs text-sky">
              grid-first / transparent PNG
            </div>
          </div>
          {isStaticExport ? (
            <p className="rounded-md border border-amber/30 bg-amber/10 p-3 text-sm leading-6 text-amber">
              GitHub Pages에서는 프롬프트 구성 화면만 동작합니다. 자동 생성은 Vercel 서버 배포에서 켜집니다.
            </p>
          ) : null}
          <SubscriptionPanel token={subscriptionToken} onTokenChange={setSubscriptionToken} />
        </Card>

        <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">기본 프롬프트</h2>
              <Button onClick={openPromptConverter} variant="secondary">
                <Sparkles aria-hidden className="h-4 w-4" />
                프롬프트 변환기
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <Input
                placeholder="저장 이름"
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
              />
              <Button onClick={savePromptPreset} variant="secondary">
                <Save aria-hidden className="h-4 w-4" />
                저장
              </Button>
              <Button disabled={!selectedPresetId} onClick={deletePromptPreset} variant="danger">
                <Trash2 aria-hidden className="h-4 w-4" />
              </Button>
            </div>
            <Select value={selectedPresetId} onChange={(event) => loadPromptPreset(event.target.value)}>
              <option value="">저장된 프리셋 선택</option>
              {promptPresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </Select>
            <Textarea className="min-h-[300px] font-mono text-xs" value={basePrompt} onChange={(event) => setBasePrompt(event.target.value)} />
        </Card>

        <Card className="space-y-3">
            <h2 className="font-semibold">추가 프롬프트</h2>
            <Textarea className="min-h-[120px] font-mono text-xs" value={extraPrompt} onChange={(event) => setExtraPrompt(event.target.value)} />
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">에셋 사이즈</span>
                <Select value={spriteSize} onChange={(event) => setSpriteSize(Number(event.target.value) as PreviewSpriteSize)}>
                  <option value={32}>32x32</option>
                  <option value={64}>64x64</option>
                  <option value={128}>128x128 preview</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">작업량</span>
                <Select value={count} onChange={(event) => setCount(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">랜덤 키워드</span>
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
              <span className="text-sm font-medium text-slate-700">고정 키워드</span>
              <Input value={customKeywordText} onChange={(event) => setCustomKeywordText(event.target.value)} />
            </label>
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">에셋 작업 방식</h2>
            <div className="flex gap-2">
              <Input className="w-52" placeholder="추가 작업명" value={customTask} onChange={(event) => setCustomTask(event.target.value)} />
              <Button className="h-10 w-10 p-0" onClick={addCustomTask} variant="secondary">
                <Plus aria-hidden className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {baseTasks.map((task) => (
              <button
                className={`focus-ring min-h-11 rounded-md border px-3 py-2 text-left text-sm transition ${
                  selectedTasks.includes(task.prompt)
                    ? "border-sky bg-sky/10 text-slate-950"
                    : "border-line bg-white/80 text-slate-600 hover:border-sky/40 hover:bg-panelSoft"
                }`}
                key={task.prompt}
                onClick={() => toggleTask(task.prompt)}
                type="button"
              >
                <span className="block font-semibold">{task.label}</span>
                <span className="mt-1 block truncate font-mono text-[11px] text-slate-500">{task.prompt}</span>
              </button>
            ))}
          </div>
          {selectedTasks.some((task) => !baseTasks.some((baseTask) => baseTask.prompt === task)) ? (
            <div className="flex flex-wrap gap-2">
              {selectedTasks
                .filter((task) => !baseTasks.some((baseTask) => baseTask.prompt === task))
                .map((task) => (
                  <button
                    className="focus-ring inline-flex items-center gap-2 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm text-slate-900"
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

      <aside className="grid content-start gap-4">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">작업 대기열</h2>
              <p className="mt-1 text-xs text-slate-500">기본 프롬프트 + 추가 프롬프트가 모든 작업에 적용됩니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyPrompt} variant="secondary">
                <Copy aria-hidden className="h-4 w-4" />
                {copied ? "복사됨" : "프롬프트 복사"}
              </Button>
              <Button disabled={isStaticExport || isGenerating || !basePrompt.trim() || !subscriptionToken.trim()} onClick={generate}>
                {isGenerating ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <WandSparkles aria-hidden className="h-4 w-4" />}
                {isGenerating ? "생성 중" : "에셋 생성"}
              </Button>
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {plannedJobs.map((job, index) => (
              <div className="rounded-md border border-line bg-white/80 px-3 py-2 text-xs text-slate-800" key={`${job}-${index}`}>
                <span className="font-mono text-sky">#{index + 1}</span> {job}
                <span className="block truncate text-slate-500">
                  <Shuffle aria-hidden className="mr-1 inline h-3 w-3" />
                  {keywordBatches[index]?.join(", ") || "랜덤 키워드 없음"}
                </span>
              </div>
            ))}
          </div>
          {error ? <p className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p> : null}
          {status ? <p className="rounded-md border border-sky/30 bg-sky/10 p-3 text-sm text-sky">{status}</p> : null}
        </Card>

        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">결과값</h2>
              <p className="mt-1 text-xs text-slate-500">{model || `${spriteSize}x${spriteSize} 픽셀 그리드`}</p>
            </div>
            <Button disabled={sprites.length === 0} onClick={downloadAll} variant="secondary">
              <Package aria-hidden className="h-4 w-4" />
              ZIP 다운로드
            </Button>
          </div>
          <div className="tool-grid grid min-h-[560px] gap-3 rounded-lg border border-line bg-white/70 p-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.length === 0
              ? plannedJobs.slice(0, Math.min(count, 8)).map((job, index) => (
                  <div
                    className="grid aspect-square place-items-center rounded-md border border-sky/20 bg-white/82 p-3 text-center"
                    key={`${job}-placeholder-${index}`}
                  >
                    <div>
                      <span className="font-mono text-xs text-sky">{spriteSize}x{spriteSize}</span>
                      <p className="mt-2 text-sm font-semibold text-slate-700">{job}</p>
                      <Layers3 aria-hidden className="mx-auto mt-3 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))
              : previews.map((sprite, index) => (
                  <article className="rounded-md border border-line bg-white/90 p-2" key={sprite.id}>
                    <img alt={`Generated asset ${index + 1}`} className="pixelated aspect-square w-full rounded bg-panelSoft object-contain p-2" src={sprite.src} />
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
      {isConverterOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-5xl rounded-lg border border-line bg-panel p-5 shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase text-sky">prompt optimizer</p>
                <h2 className="mt-1 text-xl font-bold">프롬프트 변환기</h2>
                <p className="mt-1 text-sm text-slate-600">
                  대략적인 설명을 픽셀 에셋 생성에 유리한 영어 기본 프롬프트 구조로 정리합니다.
                </p>
              </div>
              <Button className="h-10 w-10 p-0" onClick={() => setIsConverterOpen(false)} variant="secondary">
                <X aria-hidden className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">원본 설명</span>
                <Textarea
                  className="min-h-[360px] font-mono text-xs"
                  value={converterInput}
                  onChange={(event) => setConverterInput(event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">변환 결과</span>
                <Textarea
                  className="min-h-[360px] font-mono text-xs"
                  readOnly
                  value={converterOutput}
                  placeholder="변환 버튼을 누르면 여기에 정리된 영어 프롬프트가 표시됩니다."
                />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button onClick={convertPrompt} variant="secondary">
                <WandSparkles aria-hidden className="h-4 w-4" />
                변환
              </Button>
              <Button disabled={!converterOutput.trim()} onClick={applyConvertedPrompt}>
                적용
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

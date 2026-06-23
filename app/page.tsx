import Link from "next/link";
import { BoxSelect, Download, ImagePlus, Sparkles, WandSparkles } from "lucide-react";
import { PixelKnight } from "@/components/PixelKnight";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Prompt Builder",
    text: "Lock character, palette, view, size, and motion into repeatable image-model prompts.",
    icon: Sparkles
  },
  {
    title: "Auto Generation",
    text: "Use a subscribed token and server-side OpenAI API key to generate PNG assets from prompt and count.",
    icon: WandSparkles
  },
  {
    title: "Frame Presets",
    text: "Generate idle, walk, attack, hit, death, or the full 8-frame set from one character concept.",
    icon: BoxSelect
  },
  {
    title: "Pixel Export",
    text: "Normalize uploaded art to 32x32 or 64x64 with nearest-neighbor canvas scaling.",
    icon: ImagePlus
  },
  {
    title: "Sprite Sheet Generator",
    text: "Arrange frames into transparent PNG sheets with game-engine-friendly JSON metadata.",
    icon: Download
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <section className="grid min-h-[calc(100vh-150px)] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase text-sky">Game-ready pixel workflow</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">
              Pixel Sprite Asset Generator
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Build consistent sprite prompts, normalize generated frames, and export transparent sprite sheets with metadata.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-sky px-5 py-2 text-sm font-semibold text-ink transition hover:bg-[#7dcbff]"
              href="/generate"
            >
              <WandSparkles aria-hidden className="h-4 w-4" />
              Generate Sprites
            </Link>
            <Link
              className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-panelSoft px-5 py-2 text-sm font-semibold text-white ring-1 ring-line transition hover:bg-[#1b2538]"
              href="/prompt-builder"
            >
              <Sparkles aria-hidden className="h-4 w-4" />
              Create Sprite Prompt
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Define Character", "Generate Prompt", "Export Asset"].map((step, index) => (
              <div className="rounded-lg border border-line bg-panel/70 p-4" key={step}>
                <span className="font-mono text-xs text-sky">0{index + 1}</span>
                <p className="mt-1 font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="space-y-5">
          <PixelKnight />
          <div>
            <p className="font-mono text-xs uppercase text-amber">Example Preview</p>
            <h2 className="mt-1 text-xl font-bold">SD Knight with Spear</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Side-view 32x32-ready knight preset with locked armor palette, spear silhouette, and full 8-frame motion prompts.
            </p>
          </div>
        </Card>
      </section>
      <section className="grid gap-4 py-8 md:grid-cols-5">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card className="min-h-48" key={feature.title}>
              <Icon aria-hidden className="h-6 w-6 text-sky" />
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.text}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

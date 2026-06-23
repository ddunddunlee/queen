import Link from "next/link";
import { BoxSelect, ImagePlus, Sparkles, WandSparkles } from "lucide-react";

const navItems = [
  { href: "/generate", label: "Generate", icon: WandSparkles },
  { href: "/prompt-builder", label: "Prompt Builder", icon: Sparkles },
  { href: "/sprite-sheet", label: "Sprite Sheet", icon: BoxSelect },
  { href: "/normalizer", label: "Normalizer", icon: ImagePlus }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-sky/40 bg-sky/15 font-mono text-sm font-bold text-sky">
            PX
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide text-white">Pixel Sprite Asset Generator</span>
            <span className="block text-xs text-slate-400">Prompt, normalize, export</span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

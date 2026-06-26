import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-line bg-ink/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-sky/40 bg-sky/15 font-mono text-sm font-bold text-sky">
            PX
          </span>
          <span>
            <span className="block text-sm font-bold text-white">Pixel Sprite Asset Generator</span>
            <span className="block text-xs text-slate-400">One-page pixel asset console</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

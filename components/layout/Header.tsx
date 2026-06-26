import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-line bg-white/88 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-sky/30 bg-sky/10 font-mono text-sm font-bold text-sky">
            PI
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-950">PixIan</span>
            <span className="block text-xs text-slate-500">픽시안 · 픽셀 에셋 제작 콘솔</span>
          </span>
        </Link>
      </div>
    </header>
  );
}

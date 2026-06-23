export function PixelKnight() {
  const cells = [
    "000000000000",
    "0000RR000000",
    "000RYYR00000",
    "000SSSS00000",
    "00SWWWSS0000",
    "00SGGGWSLLL0",
    "00SWWWSS0L00",
    "000SBBSS0L00",
    "000SBBSS0000",
    "0000B0B00000",
    "000BB0BB0000",
    "000000000000"
  ];
  const colors: Record<string, string> = {
    R: "#ef4444",
    Y: "#facc15",
    S: "#d1d5db",
    W: "#f8fafc",
    G: "#fbbf24",
    B: "#64748b",
    L: "#9ca3af"
  };

  return (
    <div className="tool-grid grid aspect-square w-full max-w-[320px] grid-cols-12 rounded-lg border border-line bg-ink p-4">
      {cells.join("").split("").map((cell, index) => (
        <span
          className="aspect-square"
          key={`${cell}-${index}`}
          style={{
            backgroundColor: colors[cell] || "transparent",
            boxShadow: colors[cell] ? "inset 0 0 0 1px rgba(0,0,0,.45)" : undefined
          }}
        />
      ))}
    </div>
  );
}

"use client";

import { characterPresets } from "@/lib/prompts/characterPresets";
import type { CharacterPreset } from "@/types/sprite";

interface PresetSelectorProps {
  value: string;
  onChange: (preset: CharacterPreset) => void;
}

export function PresetSelector({ value, onChange }: PresetSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {characterPresets.map((preset) => (
        <button
          className={`focus-ring rounded-lg border p-4 text-left transition ${
            value === preset.id
              ? "border-sky bg-sky/12 text-white"
              : "border-line bg-panelSoft/70 text-slate-300 hover:border-slate-500"
          }`}
          key={preset.id}
          onClick={() => onChange(preset)}
          type="button"
        >
          <span className="block text-sm font-semibold">{preset.name}</span>
          <span className="mt-1 block text-xs text-slate-400">{preset.characterType} / {preset.weapon}</span>
        </button>
      ))}
    </div>
  );
}

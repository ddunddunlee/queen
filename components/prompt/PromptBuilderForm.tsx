"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { buildFramePrompts, buildPrompt } from "@/lib/prompts/buildPrompt";
import { knightPreset } from "@/lib/prompts/characterPresets";
import { motionPresetFrames } from "@/lib/prompts/framePresets";
import type { CharacterPreset, MotionType, PreviewSpriteSize, ViewMode } from "@/types/sprite";
import { PresetSelector } from "./PresetSelector";
import { PromptPreview } from "./PromptPreview";
import { FramePromptList } from "./FramePromptList";

const characterTypes = ["Knight", "Mage", "Archer", "Monster", "Custom"];
const weapons = ["Spear", "Sword", "Bow", "Staff", "None", "Custom"];

export function PromptBuilderForm() {
  const [character, setCharacter] = useState<CharacterPreset>(knightPreset);
  const [viewMode, setViewMode] = useState<ViewMode>("side-right");
  const [motionType, setMotionType] = useState<MotionType>("full-8-frame");
  const [spriteSize, setSpriteSize] = useState<PreviewSpriteSize>(32);

  const frames = motionPresetFrames[motionType];
  const prompt = useMemo(
    () => buildPrompt({ character, spriteSize, viewMode, frame: frames[0] }),
    [character, frames, spriteSize, viewMode]
  );
  const framePrompts = useMemo(
    () => buildFramePrompts({ character, spriteSize, viewMode, frames }),
    [character, frames, spriteSize, viewMode]
  );

  function updateCharacter<K extends keyof CharacterPreset>(key: K, value: CharacterPreset[K]) {
    setCharacter((current) => ({ ...current, id: "custom", [key]: value }));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
      <Card className="space-y-6">
        <div>
          <p className="font-mono text-xs uppercase text-sky">Define Character</p>
          <h1 className="mt-1 text-2xl font-bold">Prompt Builder</h1>
        </div>
        <PresetSelector value={character.id} onChange={setCharacter} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Character name</span>
            <Input value={character.name} onChange={(event) => updateCharacter("name", event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Class / type</span>
            <Select
              value={character.characterType}
              onChange={(event) => updateCharacter("characterType", event.target.value)}
            >
              {characterTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Weapon</span>
            <Select value={character.weapon} onChange={(event) => updateCharacter("weapon", event.target.value)}>
              {weapons.map((weapon) => (
                <option key={weapon}>{weapon}</option>
              ))}
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">View</span>
            <Select value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)}>
              <option value="front">Front</option>
              <option value="side-right">Side Right</option>
              <option value="side-left">Side Left</option>
              <option value="back">Back</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Motion preset</span>
            <Select value={motionType} onChange={(event) => setMotionType(event.target.value as MotionType)}>
              <option value="idle">Idle</option>
              <option value="walk">Walk</option>
              <option value="attack">Attack</option>
              <option value="hit">Hit</option>
              <option value="death">Death</option>
              <option value="full-8-frame">Full 8-frame Set</option>
            </Select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Output size</span>
            <Select
              value={spriteSize}
              onChange={(event) => setSpriteSize(Number(event.target.value) as PreviewSpriteSize)}
            >
              <option value={32}>32x32</option>
              <option value={64}>64x64</option>
              <option value={128}>128x128 preview only</option>
            </Select>
          </label>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Character description</span>
          <Textarea
            className="min-h-28"
            value={character.description}
            onChange={(event) => updateCharacter("description", event.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-200">Palette lock</span>
          <Textarea
            className="min-h-20"
            value={character.paletteNotes}
            onChange={(event) => updateCharacter("paletteNotes", event.target.value)}
          />
        </label>
      </Card>
      <div className="space-y-5">
        <Card>
          <PromptPreview prompt={prompt} />
        </Card>
        <Card>
          <FramePromptList prompts={framePrompts} />
        </Card>
      </div>
    </div>
  );
}

import type { CharacterPreset, FramePreset, PreviewSpriteSize, ViewMode } from "@/types/sprite";

const viewLabels: Record<ViewMode, string> = {
  front: "front view",
  "side-right": "side view facing right",
  "side-left": "side view facing left",
  back: "back view"
};

export interface PromptInput {
  character: CharacterPreset;
  spriteSize: PreviewSpriteSize;
  viewMode: ViewMode;
  frame: FramePreset;
}

export function buildPrompt({ character, spriteSize, viewMode, frame }: PromptInput) {
  return `Create a game-ready pixel art sprite of ${character.name}.

Character concept:
${character.description}

Style requirements:
- retro pixel art
- SD/chibi proportions
- ${character.paletteNotes}
- thick 1px-style black outline
- crisp hard-edged pixels
- no anti-aliasing
- no blur
- no gradients
- no soft shading
- transparent background
- centered composition
- readable silhouette at ${spriteSize}x${spriteSize}
- suitable for game engine use

Camera/view:
- ${viewLabels[viewMode]}
- full body visible
- consistent scale across frames

Animation frame:
- Frame name: ${frame.name}
- Motion description: ${frame.description}

Output:
- single sprite only
- not a sprite sheet
- transparent PNG
- designed for ${spriteSize}x${spriteSize} game asset usage`;
}

export function buildFramePrompts(input: Omit<PromptInput, "frame"> & { frames: FramePreset[] }) {
  return input.frames.map((frame) => ({
    frame,
    prompt: buildPrompt({ ...input, frame })
  }));
}

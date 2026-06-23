export type SpriteSize = 32 | 64;

export type PreviewSpriteSize = SpriteSize | 128;

export type ViewMode = "front" | "side-right" | "side-left" | "back";

export type MotionType =
  | "idle"
  | "walk"
  | "attack"
  | "hit"
  | "death"
  | "full-8-frame";

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  characterType: string;
  weapon: string;
  paletteNotes: string;
}

export interface FramePreset {
  name: string;
  description: string;
}

export interface SpriteProject {
  id: string;
  name: string;
  character: CharacterPreset;
  spriteSize: SpriteSize;
  viewMode: ViewMode;
  frames: FramePreset[];
}

export interface SpriteFrameMetadata {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

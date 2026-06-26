import type { PreviewSpriteSize } from "./sprite";

export interface GenerateSpritesRequest {
  prompt: string;
  count: number;
  spriteSize: PreviewSpriteSize;
  assetJobs?: string[];
  keywordBatches?: string[][];
}

export interface GeneratedSprite {
  id: string;
  prompt: string;
  mimeType: string;
  b64Json: string;
}

export interface GenerateSpritesResponse {
  sprites: GeneratedSprite[];
  model: string;
}

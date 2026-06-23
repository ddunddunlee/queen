export interface ImageGenerationRequest {
  prompt: string;
  size: "32x32" | "64x64" | "128x128";
}

export interface ImageGenerationResult {
  imageUrl?: string;
  imageBlob?: Blob;
  provider: string;
}

export async function generateSpriteImage(
  _request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  throw new Error("Image generation provider is not configured yet.");
}

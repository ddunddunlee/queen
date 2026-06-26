import type { SpriteSheetMetadata } from "./createSpriteSheet";

export function createAsepriteMetadata(metadata: SpriteSheetMetadata) {
  return {
    frames: metadata.frames.reduce<Record<string, unknown>>((frames, frame) => {
      frames[`${frame.name}.png`] = {
        frame: { x: frame.x, y: frame.y, w: frame.w, h: frame.h },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: frame.w, h: frame.h },
        sourceSize: { w: frame.w, h: frame.h },
        duration: 100
      };
      return frames;
    }, {}),
    meta: {
      app: "PixIan",
      version: "0.1.0",
      image: `${metadata.name}.png`,
      format: "RGBA8888",
      size: {
        w:
          metadata.columns * metadata.frameSize.width +
          Math.max(0, metadata.columns - 1) * metadata.spacing,
        h:
          Math.ceil(metadata.frames.length / metadata.columns) * metadata.frameSize.height +
          Math.max(0, Math.ceil(metadata.frames.length / metadata.columns) - 1) * metadata.spacing
      },
      scale: "1"
    }
  };
}

export function createUnityMetadata(metadata: SpriteSheetMetadata) {
  return {
    name: metadata.name,
    textureType: "Sprite",
    spriteMode: "Multiple",
    pixelsPerUnit: metadata.frameSize.width,
    filterMode: "Point",
    compression: "None",
    alphaIsTransparency: true,
    meshType: "FullRect",
    frames: metadata.frames.map((frame) => ({
      name: frame.name,
      rect: {
        x: frame.x,
        y: frame.y,
        width: frame.w,
        height: frame.h
      },
      pivot: { x: 0.5, y: 0.5 },
      alignment: "Center"
    }))
  };
}

export function createGodotImportConfig(metadata: SpriteSheetMetadata) {
  return [
    "[remap]",
    "",
    'importer="texture"',
    'type="CompressedTexture2D"',
    "",
    "[params]",
    "",
    "compress/mode=0",
    "compress/high_quality=false",
    "mipmaps/generate=false",
    "roughness/mode=0",
    "process/fix_alpha_border=false",
    "process/premult_alpha=false",
    "process/normal_map_invert_y=false",
    "process/hdr_as_srgb=false",
    "process/hdr_clamp_exposure=false",
    "process/size_limit=0",
    "detect_3d/compress_to=1",
    "",
    "[sprite_sheet]",
    "",
    `columns=${metadata.columns}`,
    `frame_width=${metadata.frameSize.width}`,
    `frame_height=${metadata.frameSize.height}`,
    `spacing=${metadata.spacing}`
  ].join("\n");
}

export function createEngineReadme(metadata: SpriteSheetMetadata) {
  return `# ${metadata.name} Game Engine Import

## Included files

- ${metadata.name}.png: transparent sprite sheet
- metadata.json: generic frame coordinates
- aseprite.json: Aseprite-compatible frame metadata
- unity.sprite.json: Unity sprite slicing guide
- godot.import: Godot texture import settings reference

## Recommended import settings

Unity:
- Texture Type: Sprite (2D and UI)
- Sprite Mode: Multiple
- Pixels Per Unit: ${metadata.frameSize.width}
- Filter Mode: Point
- Compression: None
- Alpha Is Transparency: enabled

Godot:
- Filter: disabled / nearest
- Mipmaps: disabled
- Repeat: disabled
- Slice using ${metadata.frameSize.width}x${metadata.frameSize.height} cells

Aseprite:
- Import ${metadata.name}.png with aseprite.json for frame coordinates.
`;
}

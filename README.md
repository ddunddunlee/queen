# Pixel Sprite Asset Generator

A Next.js MVP for game developers who need repeatable pixel sprite prompts, uploaded-frame cleanup, and sprite sheet exports.

## Features

- Prompt Builder with character, weapon, view, motion, palette, and sprite-size locks
- Subscribed Auto Generation page for prompt + count based image generation
- Automatic frame prompts for idle, walk, attack, hit, death, and a full 8-frame set
- Image Normalizer that center-crops and resizes with `imageSmoothingEnabled = false`
- Sprite Sheet Generator for multiple PNG frames with 4 or 8 columns and 0-2px spacing
- Game-engine-ready PNG, JSON metadata, Aseprite JSON, Unity slicing guide, Godot import reference, and ZIP export
- `/lib/generation` placeholder for future image generation API integration

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_IMAGE_MODEL=gpt-image-1
SUBSCRIPTION_ACCESS_TOKEN=your_private_subscription_token
NEXT_PUBLIC_ENABLE_DEV_SUBSCRIPTION=true
```

The current MVP uses a simple subscription token gate. For a production subscription business, replace `lib/subscription/verifySubscription.ts` with Stripe, Clerk, Lemon Squeezy, or your billing provider's server-side entitlement check.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy

This project is ready for Vercel.

1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables from `.env.example`.
4. Deploy with the default Next.js settings.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Folder Structure

```txt
app/
  page.tsx
  generate/page.tsx
  prompt-builder/page.tsx
  sprite-sheet/page.tsx
  normalizer/page.tsx
components/
  layout/
  prompt/
  sprite/
  image/
  ui/
lib/
  prompts/
  image/
  generation/
types/
  sprite.ts
```

## Future Expansion

- OpenAI Images API integration
- Replicate or Stable Diffusion provider adapters
- Saved character presets and projects
- Palette enforcement and background removal
- Browser pixel editor
- Unity, Godot, and Aseprite export presets

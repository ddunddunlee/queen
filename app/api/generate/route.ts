import { NextResponse } from "next/server";
import { verifySubscriptionToken } from "@/lib/subscription/verifySubscription";
import type { GenerateSpritesRequest, GenerateSpritesResponse } from "@/types/generation";

const MAX_COUNT = 8;
const IMAGE_OUTPUT_SIZE = "1024x1024";

function assertRequestBody(body: Partial<GenerateSpritesRequest>): GenerateSpritesRequest {
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const count = Number(body.count);
  const spriteSize = Number(body.spriteSize);

  if (!prompt) {
    throw new Error("Prompt is required.");
  }

  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    throw new Error(`Count must be between 1 and ${MAX_COUNT}.`);
  }

  if (![32, 64, 128].includes(spriteSize)) {
    throw new Error("Sprite size must be 32, 64, or 128.");
  }

  return {
    prompt,
    count,
    spriteSize: spriteSize as GenerateSpritesRequest["spriteSize"]
  };
}

export async function POST(request: Request) {
  try {
    const subscriptionToken = request.headers.get("x-subscription-token");

    if (!verifySubscriptionToken(subscriptionToken)) {
      return NextResponse.json({ error: "Active subscription required." }, { status: 402 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured on the server." }, { status: 500 });
    }

    const body = assertRequestBody((await request.json()) as Partial<GenerateSpritesRequest>);
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const lockedPrompt = `${body.prompt}

Generate exactly one isolated pixel art sprite on a transparent background.
Keep the subject centered, readable, and suitable for downscaling to ${body.spriteSize}x${body.spriteSize}.
Use crisp hard-edged pixels, no blur, no gradients, and no anti-aliasing.`;

    const generated = await Promise.all(
      Array.from({ length: body.count }, async (_, index) => {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            prompt: `${lockedPrompt}\n\nVariation index: ${index + 1}.`,
            n: 1,
            size: IMAGE_OUTPUT_SIZE,
            response_format: "b64_json"
          })
        });

        const payload = (await response.json()) as {
          data?: Array<{ b64_json?: string }>;
          error?: { message?: string };
        };

        if (!response.ok) {
          throw new Error(payload.error?.message || "OpenAI image generation failed.");
        }

        const b64Json = payload.data?.[0]?.b64_json;

        if (!b64Json) {
          throw new Error("OpenAI did not return image data.");
        }

        return {
          id: `generated_${index + 1}`,
          prompt: lockedPrompt,
          mimeType: "image/png",
          b64Json
        };
      })
    );

    const result: GenerateSpritesResponse = {
      sprites: generated,
      model
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not generate sprites." },
      { status: 400 }
    );
  }
}

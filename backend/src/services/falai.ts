import { fal, ValidationError } from "@fal-ai/client";

export function initFalAi() {
  if (!process.env.FAL_KEY) {
    throw new Error("Fal AI env is not set");
  }
}

type GenerateImageResult = {
  description: string;
  images: {
    url: string;
    file_name: string;
  }[];
};

type GenerateImageResponse =
  | {
      ok: true;
      error: null;
      data: { message: string; images: { url: string; fileName: string }[] };
    }
  | { ok: false; error: string; data: null };

export async function generateImage(
  prompt: string,
  images: string[],
): Promise<GenerateImageResponse> {
  try {
    console.log("received prompt and image_urls, generating", prompt, images)
    const result = await fal.subscribe("fal-ai/gemini-25-flash-image/edit", {
      input: {
        prompt,
        image_urls: images,
      },
    });
    const data: GenerateImageResult = result.data;
    return {
      ok: true,
      data: {
        message: data.description,
        images: data.images.map((image) => ({
          url: image.url,
          fileName: image.file_name,
        })),
      },
      error: null,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.body.detail.map((detail) => detail.msg).join(";\n");
      console.error(message);
      return { ok: false, error: message, data: null };
    }
    console.error(error);
    return { ok: false, error: "failed to generate image", data: null };
  }
}

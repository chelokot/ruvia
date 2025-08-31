import { fal } from "@fal-ai/client";
import { Hono } from "hono";
import type { AuthorizedAppEnv } from "../services/app.js";
import { generateImage } from "../services/falai.js";
import { incrementGenerationCount, useCredits } from "../services/user.js";

const PRICE = 1;

export const generateRoute = new Hono<AuthorizedAppEnv>().post(
  "/",
  async (context) => {
    if (context.var.user.credits < PRICE) {
      return context.json({ ok: false, error: "not enough credits" }, 400);
    }
    const result = await useCredits({
      db: context.var.db,
      firebaseId: context.var.user.firebaseId,
      amount: PRICE,
    });
    if (!result) {
      return context.json({ ok: false, error: "failed to use credits" }, 500);
    }

    const contentType = context.req.header("content-type") || "";

    if (!contentType.startsWith("multipart/form-data")) {
      return context.json(
        { ok: false, error: "multipart/form-data required" },
        415,
      );
    }

    const formData = await context.req.formData();

    const promptEntry = formData.get("prompt");
    const prompt = typeof promptEntry === "string" ? promptEntry.trim() : "";
    if (!prompt) {
      return context.json({ ok: false, error: "prompt is required" }, 400);
    }

    const image1Entry = formData.get("image1") as File | null;
    if (!image1Entry) {
      return context.json({ ok: false, error: "provide at least image1" }, 400);
    }
    const image2Entry = formData.get("image2") as File | null;

    const images: string[] = [];
    for (const image of [image1Entry, image2Entry]) {
      if (image) {
        const url = await fal.storage.upload(image);
        images.push(url);
      }
    }

    try {
      const { ok, data, error } = await generateImage(prompt, images);
      if (ok) {
        await incrementGenerationCount({
          db: context.var.db,
          firebaseId: context.var.user.firebaseId,
        });
      }
      return context.json({ ok, data, error });
    } catch (error) {
      console.error(error);
      return context.json(
        { ok: false, data: null, error: "failed to generate image" },
        500,
      );
    }
  },
);

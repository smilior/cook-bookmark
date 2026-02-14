import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const MODEL = "gemini-3-pro-preview";

export const GEMINI_CONFIG = {
  thinkingConfig: {
    thinkingLevel: ThinkingLevel.HIGH,
  },
  tools: [{ googleSearch: {} }],
};

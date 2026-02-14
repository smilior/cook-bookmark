import { GoogleGenAI, ThinkingLevel } from "@google/genai";

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const MODEL = "gemini-2.5-flash";

export const GEMINI_CONFIG = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  tools: [{ googleSearch: {} }],
};

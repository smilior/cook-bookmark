import { ai, MODEL, GEMINI_CONFIG } from "@/lib/gemini";
import { openai, OPENAI_MODEL } from "@/lib/openai";

type GeminiConfig = typeof GEMINI_CONFIG | undefined;

/**
 * AIにプロンプトを送信してJSONレスポンスを取得する。
 * Geminiを優先し、失敗時はOpenAIにフォールバックする。
 */
export async function callAIForJSON(
  prompt: string,
  geminiConfig?: GeminiConfig
): Promise<Record<string, unknown>> {
  // 1) Try Gemini first
  try {
    const result = await callGemini(prompt, geminiConfig);
    return result;
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.warn("[ai-extract] Gemini failed, falling back to OpenAI:", errMsg);
  }

  // 2) Fallback to OpenAI
  try {
    const result = await callOpenAI(prompt);
    return result;
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[ai-extract] OpenAI also failed:", errMsg);
    throw new Error("両方のAIサービスでエラーが発生しました");
  }
}

async function callGemini(
  prompt: string,
  config?: GeminiConfig
): Promise<Record<string, unknown>> {
  const response = await ai.models.generateContent({
    model: MODEL,
    ...(config ? { config } : {}),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Safely extract text from response
  let responseText = "";
  try {
    responseText = response.text?.trim() ?? "";
  } catch {
    // response.text getter can throw if response was blocked or empty
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      responseText = parts
        .filter((p) => "text" in p && typeof p.text === "string")
        .map((p) => (p as { text: string }).text)
        .join("")
        .trim();
    }
  }

  if (!responseText) {
    throw new Error("Gemini returned empty response");
  }

  console.log("[ai-extract] Gemini response length:", responseText.length);

  return parseJSONResponse(responseText);
}

async function callOpenAI(prompt: string): Promise<Record<string, unknown>> {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    input: prompt,
  });

  const responseText = response.output_text?.trim() ?? "";

  if (!responseText) {
    throw new Error("OpenAI returned empty response");
  }

  console.log("[ai-extract] OpenAI response length:", responseText.length);

  return parseJSONResponse(responseText);
}

function parseJSONResponse(text: string): Record<string, unknown> {
  let jsonText = text;
  // Strip markdown code blocks if present
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonText);
}

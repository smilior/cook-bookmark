import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL } from "@/lib/gemini";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

// Vercel Serverless Function timeout (seconds)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceUrl } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "テキストが必要です" },
        { status: 400 }
      );
    }

    // Validate sourceUrl if provided
    if (sourceUrl && typeof sourceUrl === "string" && sourceUrl.trim()) {
      try {
        new URL(sourceUrl);
      } catch {
        return NextResponse.json(
          { error: "無効なURL形式です" },
          { status: 400 }
        );
      }
    }

    // Fetch existing categories for classification
    const existingCategories = await db.select({ name: category.name }).from(category).orderBy(asc(category.name));
    const categoryNames = existingCategories.map((c) => c.name);

    // Truncate text to avoid exceeding token limits
    const textContent = text.trim().slice(0, 15000);

    // Build the Gemini prompt
    const prompt = `以下のテキストからレシピ情報を抽出してください。
テキストはウェブページからコピーされたものや、ユーザーが直接入力したものです。
JSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。

抽出する情報:
- title: 料理名
- ingredients: 材料リスト（配列）各要素は {"name": "材料名", "amount": "分量", "group": "グループ名"} の形式。材料が「A」「B」「ソース」「生地」「タレ」などのグループに分かれている場合はgroup名を設定。グループがない場合はgroupを空文字列にしてください
- steps: 調理手順（配列）各要素は {"text": "手順テキスト", "imageUrl": "", "tip": "この手順のポイント・コツ"} の形式。各手順に固有のポイントやコツがあればtipに設定、なければ空文字列にしてください
- cookingTime: 調理時間
- servings: 何人前
- calories: カロリー
- nutrition: 栄養情報（オブジェクト形式 {"key": "value"}）
- tips: 全体的なポイント・コツ・ヒント（文字列の配列）。各手順固有のコツはstepsのtipフィールドに入れてください
- category: このレシピのカテゴリ名（文字列）。${categoryNames.length > 0 ? `以下の既存カテゴリから最も適切なものを選んでください: [${categoryNames.join(", ")}]。どれにも当てはまらない場合は新しいカテゴリ名を提案してください` : "料理のカテゴリ名を提案してください"}（例: 主菜、副菜、スープ、デザート、パン、麺類など）
- imageUrl: ""

重要: レシピの調理に直接関係ない内容は全て除外してください。例:
- 投稿者の日記・近況報告・感想
- コメント数・閲覧数・SNSの反応
- 日付付きの更新メモ
- 広告・宣伝・他レシピへのリンク紹介

テキストにレシピ情報が含まれていない場合は、以下のJSONを返してください:
{"error": "レシピ情報が見つかりませんでした"}

情報が見つからないフィールドは空文字列または空配列を返してください。

回答は以下のJSON形式のみで返してください:
{"title":"string","ingredients":[{"name":"string","amount":"string","group":"string"}],"steps":[{"text":"string","imageUrl":"","tip":"string"}],"cookingTime":"string","servings":"string","calories":"string","nutrition":{},"tips":["string"],"category":"string","imageUrl":""}

テキスト:
${textContent}`;

    // Call Gemini API
    let recipeData;
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      // Safely extract text from response
      let responseText = "";
      try {
        responseText = response.text?.trim() ?? "";
      } catch {
        // response.text getter can throw if response was blocked or empty
        // Try extracting from candidates directly
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
        console.error("[extract-text] Empty Gemini response", JSON.stringify(response.candidates?.[0]?.finishReason));
        return NextResponse.json(
          { error: "AIからの応答が空でした。もう一度お試しください。" },
          { status: 500 }
        );
      }

      console.log("[extract-text] Gemini response length:", responseText.length);
      console.log("[extract-text] Gemini response preview:", responseText.slice(0, 500));

      // Parse JSON response - strip markdown code blocks if present
      let jsonText = responseText;
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      recipeData = JSON.parse(jsonText);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[extract-text] Gemini API error:", errMsg);
      // Handle rate limit errors
      if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota")) {
        return NextResponse.json(
          { error: "AIの利用制限に達しました。しばらく待ってからお試しください。" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "レシピ情報の解析に失敗しました" },
        { status: 500 }
      );
    }

    // Check if Gemini indicated no recipe was found
    if (recipeData.error) {
      return NextResponse.json(
        { error: recipeData.error },
        { status: 422 }
      );
    }

    // Ensure all expected fields exist with defaults
    const extracted = {
      title: recipeData.title || "",
      ingredients: Array.isArray(recipeData.ingredients)
        ? recipeData.ingredients.map((i: Record<string, unknown>) => ({
            name: i.name || "",
            amount: i.amount || "",
            group: i.group || "",
          }))
        : [],
      steps: Array.isArray(recipeData.steps)
        ? recipeData.steps.map((s: unknown) => {
            if (typeof s === "string") return { text: s, imageUrl: "", tip: "" };
            const step = s as Record<string, unknown>;
            return {
              text: step.text || "",
              imageUrl: step.imageUrl || "",
              tip: typeof step.tip === "string" ? step.tip.trim() : "",
            };
          })
        : [],
      cookingTime: recipeData.cookingTime || "",
      servings: recipeData.servings || "",
      calories: recipeData.calories || "",
      nutrition:
        typeof recipeData.nutrition === "object" && recipeData.nutrition !== null
          ? recipeData.nutrition
          : {},
      tips: Array.isArray(recipeData.tips)
        ? recipeData.tips.filter((t: unknown) => typeof t === "string" && t.trim())
        : [],
      category: typeof recipeData.category === "string" ? recipeData.category.trim() : "",
      imageUrl: recipeData.imageUrl || "",
    };

    return NextResponse.json(extracted);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

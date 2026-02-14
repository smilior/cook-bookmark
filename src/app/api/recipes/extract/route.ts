import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL } from "@/lib/gemini";

function extractImageUrl(html: string): string {
  // Try og:image first
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogMatch) return ogMatch[1];

  // Try twitter:image
  const twitterMatch = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (twitterMatch) return twitterMatch[1];

  // Try reverse attribute order (content before property)
  const ogMatchReverse = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
  );
  if (ogMatchReverse) return ogMatchReverse[1];

  return "";
}

function stripHtml(html: string): string {
  // Remove script and style tags with content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ");
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, " ");
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URLが必要です" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "無効なURL形式です" },
        { status: 400 }
      );
    }

    // Fetch the web page
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CookBookmarkBot/1.0)",
        },
      });
      if (!response.ok) {
        return NextResponse.json(
          { error: `ページの取得に失敗しました (${response.status})` },
          { status: 502 }
        );
      }
      html = await response.text();
    } catch {
      return NextResponse.json(
        { error: "ページの取得に失敗しました。URLを確認してください。" },
        { status: 502 }
      );
    }

    // Extract image URL from meta tags before stripping HTML
    const imageUrl = extractImageUrl(html);

    // Strip HTML and truncate
    const textContent = stripHtml(html).slice(0, 10000);

    // Build the Gemini prompt
    const prompt = `以下のウェブページのテキストからレシピ情報を抽出してください。
JSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。

抽出する情報:
- title: 料理名
- ingredients: 材料リスト（配列）各要素は {"name": "材料名", "amount": "分量"} の形式
- steps: 調理手順（文字列の配列）
- cookingTime: 調理時間
- servings: 何人前
- calories: カロリー
- nutrition: 栄養情報（オブジェクト形式 {"key": "value"}）
- imageUrl: "${imageUrl}"

情報が見つからない場合は空文字列または空配列を返してください。

回答は以下のJSON形式のみで返してください:
{"title":"string","ingredients":[{"name":"string","amount":"string"}],"steps":["string"],"cookingTime":"string","servings":"string","calories":"string","nutrition":{},"imageUrl":"string"}

ウェブページのテキスト:
${textContent}`;

    // Call Gemini API
    let recipeData;
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const responseText = response.text?.trim() ?? "";

      // Parse JSON response - strip markdown code blocks if present
      let jsonText = responseText;
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      recipeData = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: "レシピ情報の解析に失敗しました" },
        { status: 500 }
      );
    }

    // Ensure all expected fields exist with defaults
    const extracted = {
      title: recipeData.title || "",
      ingredients: Array.isArray(recipeData.ingredients)
        ? recipeData.ingredients
        : [],
      steps: Array.isArray(recipeData.steps) ? recipeData.steps : [],
      cookingTime: recipeData.cookingTime || "",
      servings: recipeData.servings || "",
      calories: recipeData.calories || "",
      nutrition:
        typeof recipeData.nutrition === "object" && recipeData.nutrition !== null
          ? recipeData.nutrition
          : {},
      imageUrl: recipeData.imageUrl || imageUrl || "",
    };

    return NextResponse.json(extracted);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL, GEMINI_CONFIG } from "@/lib/gemini";
import { db } from "@/lib/db";
import { category } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

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

// Extract step images from JSON-LD structured data (Schema.org Recipe)
function extractJsonLdStepImages(html: string): { text: string; imageUrl: string }[] {
  const steps: { text: string; imageUrl: string }[] = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const recipes = findRecipeObjects(data);
      for (const recipe of recipes) {
        if (!Array.isArray(recipe.recipeInstructions)) continue;
        for (const step of recipe.recipeInstructions) {
          if (step["@type"] === "HowToStep" || step.text) {
            const text = (step.text || step.name || "").trim();
            let img = "";
            if (typeof step.image === "string") {
              img = step.image;
            } else if (Array.isArray(step.image) && step.image.length > 0) {
              img = typeof step.image[0] === "string" ? step.image[0] : step.image[0]?.url || "";
            } else if (step.image?.url) {
              img = step.image.url;
            }
            if (text) steps.push({ text, imageUrl: img });
          }
        }
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return steps;
}

// Recursively find Recipe objects in JSON-LD (handles @graph, arrays, nested)
function findRecipeObjects(data: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const item of data) results.push(...findRecipeObjects(item));
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj["@type"] === "Recipe" || (Array.isArray(obj["@type"]) && (obj["@type"] as string[]).includes("Recipe"))) {
      results.push(obj);
    }
    if (obj["@graph"]) results.push(...findRecipeObjects(obj["@graph"]));
  }
  return results;
}

// Extract image URL from an img tag, checking src, data-src, srcset
function extractImgSrc(tag: string, baseUrl: string): string {
  // Priority: data-src > src > srcset (first entry)
  const dataSrc = tag.match(/data-(?:lazy-)?src=["']([^"']+)["']/i);
  const src = tag.match(/\ssrc=["']([^"']+)["']/i);
  const srcset = tag.match(/srcset=["']([^"',\s]+)/i);
  const raw = dataSrc?.[1] || src?.[1] || srcset?.[1] || "";
  if (!raw) return "";
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return raw.startsWith("http") ? raw : "";
  }
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

    // Extract site name from og:site_name or <title>
    const siteNameMatch =
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
    const siteName = siteNameMatch?.[1]?.trim() ?? new URL(url).hostname.replace(/^www\./, "");

    // 1) Try JSON-LD structured data first (most reliable for step images)
    const jsonLdSteps = extractJsonLdStepImages(html);
    const hasJsonLdImages = jsonLdSteps.some((s) => s.imageUrl);

    // 2) Extract images with context (alt, surrounding text) as fallback
    const imgContexts: { src: string; alt: string; context: string }[] = [];
    const imgRegex = /<img[^>]+>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const tag = imgMatch[0];
      const src = extractImgSrc(tag, url);
      if (!src) continue;
      if (/logo|icon|avatar|badge|emoji|button|arrow/i.test(src)) continue;

      const alt = tag.match(/alt=["']([^"']*?)["']/i)?.[1] ?? "";

      // Grab surrounding text (~200 chars before & after the img tag)
      const pos = imgMatch.index!;
      const before = html.slice(Math.max(0, pos - 200), pos);
      const after = html.slice(pos + tag.length, pos + tag.length + 200);
      const nearby = stripHtml(before + " " + after).slice(0, 150);

      imgContexts.push({ src, alt, context: nearby });
    }
    // Deduplicate by src, keep first 30
    const seen = new Set<string>();
    const stepImages = imgContexts.filter((img) => {
      if (seen.has(img.src)) return false;
      seen.add(img.src);
      return true;
    }).slice(0, 30);

    // Fetch existing categories for classification
    const existingCategories = await db.select({ name: category.name }).from(category).orderBy(asc(category.name));
    const categoryNames = existingCategories.map((c) => c.name);

    // Strip HTML and truncate
    const textContent = stripHtml(html).slice(0, 10000);

    // Build the Gemini prompt
    const prompt = `以下のウェブページのテキストからレシピ情報を抽出してください。
JSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。

抽出する情報:
- title: 料理名
- ingredients: 材料リスト（配列）各要素は {"name": "材料名", "amount": "分量", "group": "グループ名"} の形式。材料が「A」「B」「ソース」「生地」「タレ」などのグループに分かれている場合はgroup名を設定。グループがない場合はgroupを空文字列にしてください
- steps: 調理手順（配列）各要素は {"text": "手順テキスト", "imageUrl": "手順画像URL", "tip": "この手順のポイント・コツ"} の形式。下記の「画像一覧」からalt属性や周辺テキストを手がかりに、各手順に対応する画像URLを設定してください。対応する画像がない手順はimageUrlを空文字列にしてください。各手順に固有のポイントやコツがあればtipに設定、なければ空文字列にしてください
- cookingTime: 調理時間
- servings: 何人前
- calories: カロリー
- nutrition: 栄養情報（オブジェクト形式 {"key": "value"}）
- tips: 全体的なポイント・コツ・ヒント（文字列の配列）。特定の手順に紐付かない一般的なポイントやコツがあれば抽出してください。各手順固有のコツはstepsのtipフィールドに入れてください
- category: このレシピのカテゴリ名（文字列）。${categoryNames.length > 0 ? `以下の既存カテゴリから最も適切なものを選んでください: [${categoryNames.join(", ")}]。どれにも当てはまらない場合は新しいカテゴリ名を提案してください` : "料理のカテゴリ名を提案してください"}（例: 主菜、副菜、スープ、デザート、パン、麺類など）
- imageUrl: "${imageUrl}"

重要: レシピの調理に直接関係ない内容は全て除外してください。例:
- 投稿者の日記・近況報告・感想（「つくレポ○件感謝」「久しぶりに〜」等）
- コメント数・閲覧数・SNSの反応
- 日付付きの更新メモ（「25.5 〜しました」等）
- 広告・宣伝・他レシピへのリンク紹介

情報が見つからない場合は空文字列または空配列を返してください。

${hasJsonLdImages ? `構造化データから取得した手順と画像の対応（これを優先して使ってください）:
${jsonLdSteps.map((s, i) => `手順${i + 1}: ${s.text.slice(0, 80)}${s.imageUrl ? ` → 画像: ${s.imageUrl}` : " → 画像なし"}`).join("\n")}

` : ""}ページ内の画像一覧（構造化データに画像がない手順や、構造化データがない場合に使ってください）:
${stepImages.map((img, i) => `[${i + 1}] URL: ${img.src}${img.alt ? ` | alt: ${img.alt}` : ""}${img.context ? ` | 周辺テキスト: ${img.context}` : ""}`).join("\n")}

回答は以下のJSON形式のみで返してください:
{"title":"string","ingredients":[{"name":"string","amount":"string","group":"string"}],"steps":[{"text":"string","imageUrl":"string","tip":"string"}],"cookingTime":"string","servings":"string","calories":"string","nutrition":{},"tips":["string"],"category":"string","imageUrl":"string"}

ウェブページのテキスト:
${textContent}`;

    // Call Gemini API
    let recipeData;
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        config: GEMINI_CONFIG,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const responseText = response.text?.trim() ?? "";
      console.log("[extract] Gemini response length:", responseText.length);
      console.log("[extract] Gemini response preview:", responseText.slice(0, 500));

      // Parse JSON response - strip markdown code blocks if present
      let jsonText = responseText;
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      recipeData = JSON.parse(jsonText);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[extract] Gemini API error:", errMsg);
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
      imageUrl: recipeData.imageUrl || imageUrl || "",
      siteName,
    };

    return NextResponse.json(extracted);
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

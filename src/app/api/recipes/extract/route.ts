import { NextRequest, NextResponse } from "next/server";
import { ai, MODEL, GEMINI_CONFIG } from "@/lib/gemini";

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

    // Extract site name from og:site_name or <title>
    const siteNameMatch =
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
    const siteName = siteNameMatch?.[1]?.trim() ?? new URL(url).hostname.replace(/^www\./, "");

    // Extract images with context (alt, surrounding text) for step matching
    const imgContexts: { src: string; alt: string; context: string }[] = [];
    const imgRegex = /<img[^>]+>/gi;
    let imgMatch;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const tag = imgMatch[0];
      const srcMatch = tag.match(/src=["']([^"']+)["']/i);
      if (!srcMatch) continue;
      const src = srcMatch[1];
      if (!src.startsWith("http")) continue;
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

    // Strip HTML and truncate
    const textContent = stripHtml(html).slice(0, 10000);

    // Build the Gemini prompt
    const prompt = `以下のウェブページのテキストからレシピ情報を抽出してください。
JSON形式のみで回答してください。マークダウンのコードブロックは使わないでください。

抽出する情報:
- title: 料理名
- ingredients: 材料リスト（配列）各要素は {"name": "材料名", "amount": "分量", "group": "グループ名"} の形式。材料が「A」「B」「ソース」「生地」「タレ」などのグループに分かれている場合はgroup名を設定。グループがない場合はgroupを空文字列にしてください
- steps: 調理手順（配列）各要素は {"text": "手順テキスト", "imageUrl": "手順画像URL"} の形式。下記の「画像一覧」からalt属性や周辺テキストを手がかりに、各手順に対応する画像URLを設定してください。対応する画像がない手順はimageUrlを空文字列にしてください
- cookingTime: 調理時間
- servings: 何人前
- calories: カロリー
- nutrition: 栄養情報（オブジェクト形式 {"key": "value"}）
- tips: ポイント・コツ・ヒント（文字列の配列）。レシピのポイントやコツ、ワンポイントアドバイスなどがあれば抽出してください
- imageUrl: "${imageUrl}"

情報が見つからない場合は空文字列または空配列を返してください。

ページ内の画像一覧（各手順に対応する画像を選んでください）:
${stepImages.map((img, i) => `[${i + 1}] URL: ${img.src}${img.alt ? ` | alt: ${img.alt}` : ""}${img.context ? ` | 周辺テキスト: ${img.context}` : ""}`).join("\n")}

回答は以下のJSON形式のみで返してください:
{"title":"string","ingredients":[{"name":"string","amount":"string","group":"string"}],"steps":[{"text":"string","imageUrl":"string"}],"cookingTime":"string","servings":"string","calories":"string","nutrition":{},"tips":["string"],"imageUrl":"string"}

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
      console.error("[extract] Gemini API error:", e);
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
        ? recipeData.steps.map((s: unknown) =>
            typeof s === "string" ? { text: s, imageUrl: "" } : s
          )
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

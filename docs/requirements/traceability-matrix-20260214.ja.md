# トレーサビリティマトリクス

**プロジェクト名**: Cook Bookmark
**作成日**: 2026-02-14
**バージョン**: 1.0

---

## 要件 → ユーザーストーリー → 実装

| 要件ID | 要件 | ユーザーストーリー | 優先度 | ステータス | 実装 |
|---|---|---|---|---|---|
| FR-001 | Google OAuth認証 | US-001 | Must Have | 完了 | `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts` |
| FR-002 | セッション管理 | US-001 | Must Have | 完了 | `src/lib/auth.ts`, `src/middleware.ts` |
| FR-003 | 未認証ユーザーリダイレクト | US-001 | Must Have | 完了 | `src/middleware.ts` |
| FR-004 | サインアウト | US-001 | Must Have | 完了 | `src/components/sign-in-button.tsx` |
| FR-010 | URLの取得・解析 | US-002 | Must Have | 未着手 | TBD: APIルート |
| FR-011 | Gemini AI抽出 | US-002 | Must Have | 未着手 | TBD: APIルート + Gemini SDK |
| FR-012 | レシピフィールド抽出 | US-002 | Must Have | 未着手 | TBD: Geminiプロンプト |
| FR-013 | フィールド欠損処理 | US-002 | Must Have | 未着手 | TBD: 抽出ロジック |
| FR-014 | 保存前のユーザー確認 | US-002 | Must Have | 未着手 | TBD: プレビューUI |
| FR-015 | 元URL保存 | US-002 | Must Have | 未着手 | TBD: DBスキーマ |
| FR-020 | レシピ一覧表示 | US-003 | Must Have | 未着手 | TBD: ダッシュボードページ |
| FR-021 | レシピ編集 | US-005 | Must Have | 未着手 | TBD: 編集フォーム |
| FR-022 | レシピ削除 | US-006 | Must Have | 未着手 | TBD: 削除アクション |
| FR-023 | カテゴリ割り当て | US-008 | Should Have | 未着手 | TBD: カテゴリUI + DB |
| FR-024 | タグ管理 | US-009 | Should Have | 未着手 | TBD: タグUI + DB |
| FR-025 | お気に入りトグル | US-010 | Should Have | 未着手 | TBD: お気に入りアクション |
| FR-030 | キーワード検索 | US-007 | Must Have | 未着手 | TBD: 検索コンポーネント |
| FR-031 | カテゴリフィルター | US-008 | Should Have | 未着手 | TBD: フィルターUI |
| FR-032 | タグフィルター | US-009 | Should Have | 未着手 | TBD: フィルターUI |
| FR-033 | お気に入りフィルター | US-010 | Should Have | 未着手 | TBD: フィルターUI |
| FR-034 | 評価順ソート | US-011 | Should Have | 未着手 | TBD: ソートロジック |
| FR-040 | 共有コレクション | US-003 | Must Have | 未着手 | TBD: ユーザーレベルフィルタなし |
| FR-041 | 全ユーザーCRUD可能 | US-005, US-006 | Must Have | 未着手 | TBD: 所有権制限なし |
| FR-042 | 登録者表示 | US-012 | Must Have | 未着手 | TBD: CreatedBy表示 |
| FR-050 | 星評価（1〜5） | US-011 | Should Have | 未着手 | TBD: 評価コンポーネント |
| FR-051 | 評価表示 | US-011 | Should Have | 未着手 | TBD: 評価表示 |
| FR-052 | 評価更新 | US-011 | Should Have | 未着手 | TBD: 評価更新 |

---

## 非機能要件 → 実装

| 要件ID | 要件 | ステータス | 実装 |
|---|---|---|---|
| NFR-001 | 標準的なパフォーマンス | - | Vercelサーバーレス |
| NFR-002 | AIローディングインジケーター | 未着手 | TBD: ローディングUIコンポーネント |
| NFR-010 | Vercelホスティング | 完了 | `vercel.json` |
| NFR-011 | Tursoデータベース | 完了 | `src/lib/db/index.ts` |
| NFR-020 | Googleログインのみ | 完了 | `src/lib/auth.ts` |
| NFR-021 | セキュアCookie | 完了 | `src/middleware.ts` |
| NFR-022 | HTTPS | 完了 | Vercelにより強制 |
| NFR-030 | モバイルファーストデザイン | 未着手 | TBD: Tailwindレスポンシブ |
| NFR-031 | レスポンシブレイアウト | 未着手 | TBD: Tailwindブレークポイント |
| NFR-032 | 日本語UI | 一部完了 | ログインページ完了、ダッシュボードTBD |
| NFR-040 | TypeScript strict | 完了 | `tsconfig.json` |
| NFR-041 | Drizzleマイグレーション | 一部完了 | スキーマ定義済み、マイグレーション未生成 |
| NFR-042 | Vercel自動デプロイ | 完了 | Git連携設定済み |

---

## データベーススキーマ → 要件

| テーブル | カラム | 関連要件 | ステータス |
|---|---|---|---|
| user | id, name, email, emailVerified, image, timestamps | FR-001〜004, FR-042 | 完了 |
| session | id, expiresAt, token, userId, ipAddress, userAgent | FR-002, FR-003 | 完了 |
| account | id, accountId, providerId, userId, tokens, scope | FR-001 | 完了 |
| verification | id, identifier, value, expiresAt | FR-001 | 完了 |
| recipe | id, title, sourceUrl, ingredients, steps, cookingTime, servings, calories, nutrition, imageUrl, rating, isFavorite, categoryId, createdBy, timestamps | FR-010〜052 | 未着手 |
| category | id, name, timestamps | FR-023, FR-031 | 未着手 |
| tag | id, name, timestamps | FR-024, FR-032 | 未着手 |
| recipe_tag | recipeId, tagId | FR-024, FR-032 | 未着手 |

---

## 実装進捗サマリー

| カテゴリ | 合計 | 完了 | 未着手 |
|---|---|---|---|
| 機能要件 | 26 | 4 | 22 |
| 非機能要件 | 13 | 8 | 5 |
| データベーステーブル | 8 | 4 | 4 |
| ユーザーストーリー | 12 | 1 | 11 |

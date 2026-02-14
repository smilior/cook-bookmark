# UI/UX Design Specification - Cook Bookmark

**Created**: 2026-02-14
**Design Approach**: Mobile-First, Warm Minimal
**Stack**: Next.js 16 + Tailwind CSS v4 + shadcn/ui + Lucide React

---

## 1. Design Philosophy

### Concept: "Kitchen Companion"

A warm, clean, and easy-to-use recipe app designed for use in the kitchen with one hand on a smartphone. Prioritizes readability, large touch targets, and quick access to recipes.

### Design Principles

1. **Mobile-First**: Every screen designed for 375px first, then scaled up
2. **One-Hand Friendly**: Bottom navigation, reachable actions
3. **Scannable**: Card-based layout, clear visual hierarchy
4. **Warm & Inviting**: Food-inspired warm color palette
5. **Fast Access**: Minimum taps to find and view a recipe

---

## 2. Color System

### Theme: Warm Kitchen

Using shadcn/ui CSS variables with a warm, food-inspired palette.

```
Primary:        oklch(0.55 0.15 40)     -- Warm terracotta/burnt orange
Primary-fg:     oklch(0.98 0 0)         -- White
Secondary:      oklch(0.96 0.01 80)     -- Warm cream
Secondary-fg:   oklch(0.25 0.02 50)     -- Dark warm
Accent:         oklch(0.85 0.08 85)     -- Warm beige
Accent-fg:      oklch(0.25 0.02 50)     -- Dark warm
Background:     oklch(0.985 0.005 80)   -- Off-white warm
Foreground:     oklch(0.18 0.02 50)     -- Dark warm brown
Muted:          oklch(0.95 0.01 80)     -- Light warm
Muted-fg:       oklch(0.50 0.02 50)     -- Medium warm
Destructive:    oklch(0.577 0.245 27)   -- Red (keep default)
Border:         oklch(0.91 0.01 80)     -- Warm border
Card:           oklch(1 0 0)            -- White
```

### Semantic Colors

- **Rating Star Active**: `oklch(0.80 0.18 85)` — Golden amber
- **Favorite Active**: `oklch(0.65 0.25 25)` — Warm red/coral
- **Success**: `oklch(0.65 0.17 145)` — Green
- **Category Chips**: Various warm pastels

---

## 3. Typography

### Font Stack

- **Sans**: Geist Sans (already configured) — Clean, modern, excellent readability
- **Mono**: Geist Mono (already configured) — For cooking times, quantities

### Scale (Mobile-First)

| Usage | Class | Size |
|---|---|---|
| Page Title | `text-2xl font-bold` | 24px |
| Section Title | `text-lg font-semibold` | 18px |
| Recipe Card Title | `text-base font-semibold` | 16px |
| Body Text | `text-sm` | 14px |
| Caption/Meta | `text-xs text-muted-foreground` | 12px |
| Step Number | `text-lg font-bold text-primary` | 18px |
| Ingredient Qty | `font-mono text-sm` | 14px |

---

## 4. Spacing & Layout

### Mobile Grid

- **Container**: `px-4` (16px padding)
- **Card Gap**: `gap-3` (12px)
- **Section Gap**: `gap-6` (24px)
- **Touch Target Minimum**: 44x44px (`min-h-11 min-w-11`)

### Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile (default) | < 640px | 1 column, bottom nav |
| Tablet (sm) | 640px+ | 2 column grid |
| Desktop (lg) | 1024px+ | 3 column grid, side nav |

---

## 5. Screen Designs

### 5.1 Landing Page (`/`)

```
┌─────────────────────────┐
│                         │
│     [App Icon/Logo]     │
│                         │
│     Cook Bookmark       │
│                         │
│  お気に入りのレシピを    │
│  AIで簡単に保存・管理    │
│                         │
│  [Googleでログイン]     │
│                         │
│    (simple, centered)   │
└─────────────────────────┘
```

- Centered layout, minimal
- Single CTA: Google login
- App description in Japanese
- Warm background

### 5.2 Dashboard / Recipe List (`/dashboard`)

```
┌─────────────────────────┐
│ Cook Bookmark    [Avatar]│  ← Sticky header
├─────────────────────────┤
│ [🔍 レシピを検索...]    │  ← Search bar
│ [和食][洋食][中華][All]  │  ← Category chips (horizontal scroll)
├─────────────────────────┤
│ ┌─────────┐┌─────────┐  │
│ │ [Image] ││ [Image] │  │  ← 2-column card grid
│ │ Title   ││ Title   │  │
│ │ ★★★★☆  ││ ★★★☆☆  │  │
│ │ ♡ 30min ││ ♡ 15min │  │
│ └─────────┘└─────────┘  │
│ ┌─────────┐┌─────────┐  │
│ │ [Image] ││ [Image] │  │
│ │ Title   ││ Title   │  │
│ │ ★★★★★  ││ ★★☆☆☆  │  │
│ │ ♡ 45min ││ ♡ 20min │  │
│ └─────────┘└─────────┘  │
├─────────────────────────┤
│  [Home] [Add] [Profile] │  ← Bottom navigation
└─────────────────────────┘
```

- **Sticky header**: App name + user avatar
- **Search bar**: Always visible below header
- **Category chips**: Horizontal scrollable
- **Recipe cards**: 2-column grid on mobile
- **Card info**: Image, title, rating stars, favorite icon, cooking time
- **Bottom nav**: Home (list), Add (new recipe), Profile (settings)
- **FAB alternative**: Large "+" button for adding recipes

### 5.3 Recipe Detail (`/dashboard/recipes/[id]`)

```
┌─────────────────────────┐
│ [←Back]          [Edit] │  ← Header with actions
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │                     │ │
│ │   [Recipe Image]    │ │  ← Full-width hero image
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Recipe Title      [♡]   │  ← Title + favorite toggle
│ ★★★★☆ · 30分 · 2人前   │  ← Meta info line
│ by ユーザー名           │  ← Registered by
│                         │
│ [元のレシピを見る →]    │  ← Source URL link
│                         │
│ ─── 材料 ───────────── │
│ ・鶏もも肉    300g      │
│ ・醤油        大さじ2    │
│ ・みりん      大さじ1    │
│ ・...                   │
│                         │
│ ─── 作り方 ──────────── │
│ 1. 鶏肉を一口大に切る   │
│ 2. フライパンで焼く     │
│ 3. 調味料を加える       │
│ ...                     │
│                         │
│ ─── 栄養情報 ────────── │
│ カロリー: 350kcal       │
│                         │
│ [タグ: 鶏肉] [簡単]     │  ← Tags
├─────────────────────────┤
│  [Home] [Add] [Profile] │
└─────────────────────────┘
```

- **Hero image**: Full-width at top
- **Meta line**: Rating, time, servings in one line
- **Sections**: Materials, Steps, Nutrition separated clearly
- **Ingredients**: Clean list with quantities right-aligned
- **Steps**: Numbered, clear spacing between steps
- **Source link**: Link to original recipe page

### 5.4 Add Recipe (`/dashboard/recipes/new`)

```
┌─────────────────────────┐
│ [×Close]  レシピを追加   │
├─────────────────────────┤
│                         │
│ レシピURLを入力          │
│ ┌─────────────────────┐ │
│ │ https://...         │ │  ← URL input
│ └─────────────────────┘ │
│ [AIで取得する]          │  ← Primary CTA button
│                         │
│ ─── OR ────────────── │
│                         │
│ (Loading state:)        │
│ ┌─────────────────────┐ │
│ │  🔄 レシピを解析中...│ │  ← Loading indicator
│ │  (3-10秒程度)       │ │
│ └─────────────────────┘ │
│                         │
│ (After extraction:)     │
│ ─── プレビュー ─────── │
│                         │
│ 料理名                  │
│ [鶏の照り焼き        ]  │
│                         │
│ カテゴリ                │
│ [和食 ▼]               │
│                         │
│ 調理時間                │
│ [30分]                  │
│                         │
│ 人数                    │
│ [2人前]                 │
│                         │
│ 材料                    │
│ [editable list...]      │
│                         │
│ 手順                    │
│ [editable steps...]     │
│                         │
│ タグ                    │
│ [+ タグを追加]          │
│                         │
│ [レシピを保存する]      │  ← Save button
│                         │
├─────────────────────────┤
│  [Home] [Add] [Profile] │
└─────────────────────────┘
```

- **Step 1**: URL input + "AIで取得する" button
- **Loading**: Spinner with message during AI extraction
- **Step 2**: Preview/edit extracted data
- **Step 3**: Save button
- All fields editable before saving

### 5.5 Edit Recipe (`/dashboard/recipes/[id]/edit`)

Same layout as Add Recipe, but pre-filled with existing data. Delete button at bottom.

---

## 6. Component Library

### New shadcn/ui Components Needed

```bash
# Components to install
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add tabs
npx shadcn@latest add textarea
npx shadcn@latest add toast
```

### Custom Components

| Component | Description |
|---|---|
| `BottomNav` | Fixed bottom navigation (Home, Add, Profile) |
| `RecipeCard` | Card with image, title, rating, favorite, time |
| `StarRating` | Interactive 1-5 star rating component |
| `FavoriteButton` | Heart toggle button |
| `CategoryChips` | Horizontal scrollable category filter |
| `TagInput` | Tag adding/removing component |
| `SearchBar` | Search input with icon |
| `RecipeForm` | Form for add/edit recipe |
| `LoadingSpinner` | AI extraction loading state |
| `IngredientList` | Formatted ingredient list |
| `StepList` | Numbered cooking steps |

---

## 7. Navigation Structure

### Bottom Navigation (Mobile)

```
┌─────────────────────────────┐
│   [🏠]      [➕]      [👤]  │
│   ホーム     追加    マイページ│
└─────────────────────────────┘
```

- **Home**: Recipe list (dashboard)
- **Add**: New recipe registration
- **Profile**: User info, settings, logout

### Page Hierarchy

```
/                       → Landing (unauthenticated)
/login                  → Google login
/dashboard              → Recipe list (home)
/dashboard/recipes/new  → Add recipe
/dashboard/recipes/[id] → Recipe detail
/dashboard/recipes/[id]/edit → Edit recipe
/dashboard/profile      → User profile
```

---

## 8. Interaction Patterns

### Touch Targets
- All buttons: minimum `h-11` (44px)
- Card tap: entire card is tappable
- Favorite: tap icon toggles immediately (optimistic update)
- Rating: tap star to set rating

### Transitions
- Page transitions: `transition-all duration-200`
- Card hover (desktop): `hover:shadow-md transition-shadow duration-200`
- Favorite toggle: `transition-colors duration-150`
- Bottom nav active: `text-primary` with smooth color transition

### Loading States
- Recipe list: Skeleton cards
- AI extraction: Spinner + "レシピを解析中..." message
- Image loading: Skeleton placeholder with aspect-ratio
- Actions: Button disabled state with spinner

### Error States
- AI extraction failure: Toast with retry option
- Network error: Toast with "接続を確認してください"
- Empty state: Illustration + "レシピを追加しましょう" message

---

## 9. Responsive Behavior

### Mobile (default, < 640px)
- 2-column recipe card grid
- Bottom navigation visible
- Full-width images on detail page
- Stack all form fields vertically

### Tablet (sm: 640px+)
- 3-column recipe card grid
- Bottom navigation still visible
- Side padding increases

### Desktop (lg: 1024px+)
- 4-column recipe card grid
- Side navigation replaces bottom nav
- Recipe detail: 2-column layout (image left, content right)
- Max-width container: `max-w-6xl`

---

## 10. Accessibility

- `lang="ja"` on html element
- All images: `alt` text (recipe title)
- Form inputs: associated `<label>` elements
- Star rating: `aria-label="評価: X点"` + keyboard navigable
- Favorite button: `aria-label="お気に入りに追加/解除"`
- Bottom nav: `<nav>` with `aria-label="メインナビゲーション"`
- Focus visible: Ring style on keyboard focus
- Color contrast: 4.5:1 minimum for all text
- `prefers-reduced-motion`: Respect user preference

---

## 11. Pre-Delivery Checklist

- [ ] No emojis as UI icons (use Lucide React SVG icons)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states don't cause layout shift
- [ ] Touch targets minimum 44x44px
- [ ] Light mode text contrast 4.5:1+
- [ ] Responsive at 375px, 640px, 1024px
- [ ] No horizontal scroll on mobile
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] `prefers-reduced-motion` respected
- [ ] Japanese text throughout UI
- [ ] Smooth transitions (150-300ms)

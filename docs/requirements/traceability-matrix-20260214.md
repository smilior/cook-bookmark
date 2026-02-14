# Traceability Matrix

**Project Name**: Cook Bookmark
**Created**: 2026-02-14
**Version**: 1.0

---

## Requirements → User Stories → Implementation

| Req ID | Requirement | User Story | Priority | Status | Implementation |
|---|---|---|---|---|---|
| FR-001 | Google OAuth authentication | US-001 | Must Have | Done | `src/lib/auth.ts`, `src/app/api/auth/[...all]/route.ts` |
| FR-002 | Session management | US-001 | Must Have | Done | `src/lib/auth.ts`, `src/middleware.ts` |
| FR-003 | Redirect unauthenticated users | US-001 | Must Have | Done | `src/middleware.ts` |
| FR-004 | Sign out | US-001 | Must Have | Done | `src/components/sign-in-button.tsx` |
| FR-010 | Fetch and parse URL | US-002 | Must Have | Not Started | TBD: API route |
| FR-011 | Gemini AI extraction | US-002 | Must Have | Not Started | TBD: API route + Gemini SDK |
| FR-012 | Extract recipe fields | US-002 | Must Have | Not Started | TBD: Gemini prompt |
| FR-013 | Handle missing fields | US-002 | Must Have | Not Started | TBD: Extraction logic |
| FR-014 | User confirmation before save | US-002 | Must Have | Not Started | TBD: Preview UI |
| FR-015 | Store source URL | US-002 | Must Have | Not Started | TBD: DB schema |
| FR-020 | Recipe list display | US-003 | Must Have | Not Started | TBD: Dashboard page |
| FR-021 | Edit recipe | US-005 | Must Have | Not Started | TBD: Edit form |
| FR-022 | Delete recipe | US-006 | Must Have | Not Started | TBD: Delete action |
| FR-023 | Category assignment | US-008 | Should Have | Not Started | TBD: Category UI + DB |
| FR-024 | Tag management | US-009 | Should Have | Not Started | TBD: Tag UI + DB |
| FR-025 | Favorite toggle | US-010 | Should Have | Not Started | TBD: Favorite action |
| FR-030 | Keyword search | US-007 | Must Have | Not Started | TBD: Search component |
| FR-031 | Category filter | US-008 | Should Have | Not Started | TBD: Filter UI |
| FR-032 | Tag filter | US-009 | Should Have | Not Started | TBD: Filter UI |
| FR-033 | Favorites filter | US-010 | Should Have | Not Started | TBD: Filter UI |
| FR-034 | Rating sort | US-011 | Should Have | Not Started | TBD: Sort logic |
| FR-040 | Shared collection | US-003 | Must Have | Not Started | TBD: No user-level filtering |
| FR-041 | Any user can CRUD | US-005, US-006 | Must Have | Not Started | TBD: No ownership restrictions |
| FR-042 | Display registrant | US-012 | Must Have | Not Started | TBD: CreatedBy display |
| FR-050 | Star rating (1-5) | US-011 | Should Have | Not Started | TBD: Rating component |
| FR-051 | Display rating | US-011 | Should Have | Not Started | TBD: Rating display |
| FR-052 | Update rating | US-011 | Should Have | Not Started | TBD: Rating update |

---

## Non-Functional Requirements → Implementation

| Req ID | Requirement | Status | Implementation |
|---|---|---|---|
| NFR-001 | Standard performance | - | Vercel serverless |
| NFR-002 | AI loading indicator | Not Started | TBD: Loading UI component |
| NFR-010 | Vercel hosting | Done | `vercel.json` |
| NFR-011 | Turso database | Done | `src/lib/db/index.ts` |
| NFR-020 | Google OAuth only | Done | `src/lib/auth.ts` |
| NFR-021 | Secure cookies | Done | `src/middleware.ts` |
| NFR-022 | HTTPS | Done | Vercel enforced |
| NFR-030 | Mobile-first design | Not Started | TBD: Tailwind responsive |
| NFR-031 | Responsive layout | Not Started | TBD: Tailwind breakpoints |
| NFR-032 | Japanese UI | Partial | Login page done, dashboard TBD |
| NFR-040 | TypeScript strict | Done | `tsconfig.json` |
| NFR-041 | Drizzle migrations | Partial | Schema defined, migrations not generated |
| NFR-042 | Vercel auto-deploy | Done | Git integration configured |

---

## Database Schema → Requirements

| Table | Columns | Related Requirements | Status |
|---|---|---|---|
| user | id, name, email, emailVerified, image, timestamps | FR-001~004, FR-042 | Done |
| session | id, expiresAt, token, userId, ipAddress, userAgent | FR-002, FR-003 | Done |
| account | id, accountId, providerId, userId, tokens, scope | FR-001 | Done |
| verification | id, identifier, value, expiresAt | FR-001 | Done |
| recipe | id, title, sourceUrl, ingredients, steps, cookingTime, servings, calories, nutrition, imageUrl, rating, isFavorite, categoryId, createdBy, timestamps | FR-010~052 | Not Started |
| category | id, name, timestamps | FR-023, FR-031 | Not Started |
| tag | id, name, timestamps | FR-024, FR-032 | Not Started |
| recipe_tag | recipeId, tagId | FR-024, FR-032 | Not Started |

---

## Implementation Progress Summary

| Category | Total | Done | Not Started |
|---|---|---|---|
| Functional Requirements | 26 | 4 | 22 |
| Non-Functional Requirements | 13 | 8 | 5 |
| Database Tables | 8 | 4 | 4 |
| User Stories | 12 | 1 | 11 |

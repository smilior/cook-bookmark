# Software Requirements Specification (SRS)

**Project Name**: Cook Bookmark
**Version**: 1.0
**Created**: 2026-02-14
**Author**: Requirements Analyst AI

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for Cook Bookmark, a web application that allows users to build a personal recipe collection by extracting recipe information from URLs using generative AI (Gemini API).

### 1.2 Scope

**In Scope:**

- User authentication via Google OAuth
- Recipe URL registration and AI-powered recipe extraction
- Recipe CRUD operations (Create, Read, Update, Delete)
- Recipe organization (categories, tags, favorites)
- Recipe search and filtering
- Family sharing (shared recipe collection)
- Star rating system (5-point scale)
- Mobile-first responsive design

**Out of Scope:**

- User registration via email/password
- Multi-tenant support (only single family group)
- Meal planning / calendar integration
- Shopping list generation
- Social features (comments, public sharing)
- Native mobile app (PWA may be considered later)

### 1.3 Definitions & Abbreviations

- **Recipe URL**: A web page URL containing recipe information
- **AI Extraction**: Automated extraction and formatting of recipe data using Gemini API
- **Shared Collection**: A single recipe list visible to all authenticated family members
- **SRS**: Software Requirements Specification
- **MVP**: Minimum Viable Product
- **CRUD**: Create, Read, Update, Delete

### 1.4 Reference Documents

- Better Auth documentation
- Gemini API documentation
- Next.js App Router documentation
- Drizzle ORM documentation

---

## 2. System Overview

### 2.1 System Purpose

Cook Bookmark enables users to:

1. Save recipe URLs from any cooking website
2. Automatically extract structured recipe data using Gemini AI
3. Store recipes in a personal/family collection
4. Search, filter, and organize recipes
5. Rate recipes based on family feedback

### 2.2 Users

- **Primary Users**: Husband and wife (2 people) — register recipes, rate, search
- **Secondary Users**: Other family members (up to 3) — view and search shared recipes
- **Total**: Less than 5 users

### 2.3 Target Environment

- **Device**: Smartphone (primary), Desktop (secondary)
- **Browser**: Chrome, Safari (mobile)
- **Network**: Internet connection required
- **Hosting**: Vercel (serverless)
- **Database**: Turso (SQLite-compatible, serverless)

---

## 3. Current Implementation Status

The following components are already implemented and operational:

### 3.1 Technology Stack (Implemented)

| Component | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.3 |
| Authentication | Better Auth | 1.4.18 |
| Database | Turso (libSQL) | 0.17.0 |
| ORM | Drizzle ORM | 0.45.1 |
| UI Components | shadcn/ui (Radix UI) | 1.4.3 |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 0.564.0 |
| Deployment | Vercel | - |

### 3.2 Implemented Features

| Feature | Status | Details |
|---|---|---|
| Google OAuth Login | Done | Better Auth + Google social provider |
| Session Management | Done | Cookie-based session (HTTP/HTTPS) |
| Route Protection | Done | Middleware protecting `/dashboard/*` |
| Auth DB Schema | Done | user, session, account, verification tables |
| Landing Page | Done | `/` with navigation |
| Login Page | Done | `/login` with Google sign-in button |
| Dashboard Page | Placeholder | `/dashboard` showing "Hello World" |
| Vercel Deployment | Done | vercel.json configured |

### 3.3 Implemented Database Schema

**Tables (Better Auth):**

- `user` — id, name, email (unique), emailVerified, image, createdAt, updatedAt
- `session` — id, expiresAt, token (unique), userId (FK→user), ipAddress, userAgent
- `account` — id, accountId, providerId, userId (FK→user), accessToken, refreshToken, idToken, scope
- `verification` — id, identifier, value, expiresAt

### 3.4 Prepared but Not Yet Used

- `GEMINI_API_KEY` environment variable (configured in .env.local)
- Drizzle Kit migration scripts (db:generate, db:migrate, db:push, db:studio)

---

## 4. Functional Requirements

### 4.1 Authentication (Implemented)

- **FR-001**: The system SHALL authenticate users via Google OAuth 2.0
- **FR-002**: The system SHALL maintain user sessions using secure cookies
- **FR-003**: The system SHALL redirect unauthenticated users to the login page
- **FR-004**: The system SHALL allow users to sign out

### 4.2 Recipe URL Registration

- **FR-010**: WHEN a user submits a URL, the system SHALL fetch and parse the web page content
- **FR-011**: WHEN the page content is fetched, the system SHALL send it to Gemini API for recipe extraction
- **FR-012**: The Gemini API SHALL extract and return the following fields:
  - Recipe name
  - Ingredients list (with quantities)
  - Cooking steps (step-by-step)
  - Cooking time
  - Serving size (number of servings)
  - Calories / nutritional information
  - Photo URL (from source site)
- **FR-013**: IF a field cannot be extracted, THEN the system SHALL either leave it empty or use AI estimation
- **FR-014**: WHEN extraction is complete, the system SHALL display the extracted data for user confirmation before saving
- **FR-015**: The system SHALL store the original source URL with each recipe

### 4.3 Recipe Management

- **FR-020**: The system SHALL display a list of all registered recipes
- **FR-021**: The system SHALL allow users to edit any recipe field
- **FR-022**: The system SHALL allow users to delete recipes
- **FR-023**: The system SHALL allow users to assign categories to recipes (e.g., Japanese, Western, Chinese)
- **FR-024**: The system SHALL allow users to add tags to recipes
- **FR-025**: The system SHALL allow users to mark recipes as favorites

### 4.4 Recipe Search & Filtering

- **FR-030**: The system SHALL provide keyword search (recipe name, ingredients)
- **FR-031**: The system SHALL provide category-based filtering
- **FR-032**: The system SHALL provide tag-based filtering
- **FR-033**: The system SHALL provide favorites-only filtering
- **FR-034**: The system SHALL provide sorting by star rating (high to low)

### 4.5 Family Sharing

- **FR-040**: All authenticated users SHALL see the same shared recipe collection
- **FR-041**: Any authenticated user SHALL be able to register, edit, and delete recipes
- **FR-042**: The system SHALL display which user registered each recipe

### 4.6 Star Rating

- **FR-050**: The system SHALL allow the recipe registrant to rate a recipe on a 1-5 star scale
- **FR-051**: The system SHALL display the star rating on the recipe list and detail views
- **FR-052**: The system SHALL allow the registrant to update the rating

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **NFR-001**: Standard performance acceptable (small-scale family use, 2-5 users)
- **NFR-002**: AI extraction may take several seconds; the system SHALL show a loading indicator

### 5.2 Availability

- **NFR-010**: The system SHALL be hosted on Vercel with standard uptime
- **NFR-011**: The database SHALL be hosted on Turso with automatic backups

### 5.3 Security

- **NFR-020**: Authentication SHALL use Google OAuth 2.0 only
- **NFR-021**: Session cookies SHALL use HttpOnly and Secure flags in production
- **NFR-022**: All communication SHALL use HTTPS

### 5.4 Usability

- **NFR-030**: The UI SHALL be mobile-first (primary use in kitchen on smartphone)
- **NFR-031**: The UI SHALL be responsive (usable on desktop as well)
- **NFR-032**: The UI language SHALL be Japanese

### 5.5 Maintainability

- **NFR-040**: The system SHALL use TypeScript for type safety
- **NFR-041**: The database schema SHALL be managed via Drizzle ORM migrations
- **NFR-042**: The system SHALL be deployable via Vercel with zero-configuration

### 5.6 Constraints

- **NFR-050**: Development timeline: 1 month (MVP)
- **NFR-051**: Gemini API usage subject to API rate limits and pricing
- **NFR-052**: Turso free tier database limits apply

---

## 6. External Interfaces

### 6.1 User Interface

- Mobile-first responsive design using Tailwind CSS + shadcn/ui
- Japanese language UI
- Key screens:
  - Landing page (`/`)
  - Login page (`/login`)
  - Dashboard / Recipe list (`/dashboard`)
  - Recipe detail page
  - Recipe registration form (URL input + AI extraction preview)
  - Recipe edit form

### 6.2 Software Interfaces

| Interface | Purpose | Protocol |
|---|---|---|
| Gemini API | Recipe extraction from URL content | HTTPS / REST |
| Google OAuth | User authentication | OAuth 2.0 |
| Turso Database | Data persistence | libSQL (HTTPS) |

### 6.3 Communication Interfaces

- **Protocol**: HTTPS (TLS)
- **Data Format**: JSON
- **API Style**: Next.js API Routes (App Router)

---

## 7. Data Model (New Tables Required)

The following tables need to be added to the existing schema:

### 7.1 recipe

| Column | Type | Description |
|---|---|---|
| id | text (PK) | Unique identifier |
| title | text | Recipe name |
| sourceUrl | text | Original recipe URL |
| ingredients | text (JSON) | Ingredients list with quantities |
| steps | text (JSON) | Cooking steps |
| cookingTime | text | Estimated cooking time |
| servings | text | Number of servings |
| calories | text | Calorie information |
| nutrition | text (JSON) | Nutritional information |
| imageUrl | text | Photo URL |
| rating | integer | Star rating (1-5, nullable) |
| isFavorite | integer (boolean) | Favorite flag |
| categoryId | text (FK) | Category reference |
| createdBy | text (FK→user) | User who registered the recipe |
| createdAt | integer (timestamp) | Creation timestamp |
| updatedAt | integer (timestamp) | Last update timestamp |

### 7.2 category

| Column | Type | Description |
|---|---|---|
| id | text (PK) | Unique identifier |
| name | text (unique) | Category name (e.g., Japanese, Western) |
| createdAt | integer (timestamp) | Creation timestamp |

### 7.3 tag

| Column | Type | Description |
|---|---|---|
| id | text (PK) | Unique identifier |
| name | text (unique) | Tag name |
| createdAt | integer (timestamp) | Creation timestamp |

### 7.4 recipe_tag (junction table)

| Column | Type | Description |
|---|---|---|
| recipeId | text (FK→recipe) | Recipe reference |
| tagId | text (FK→tag) | Tag reference |

---

## 8. MVP Prioritization (MoSCoW)

### Must Have (MVP Release)

- FR-001~004: Google OAuth (Done)
- FR-010~015: Recipe URL registration + AI extraction
- FR-020~022: Recipe list, edit, delete
- FR-030: Keyword search
- FR-040~042: Family shared collection

### Should Have

- FR-023~024: Category and tag classification
- FR-025: Favorites
- FR-033: Favorites-only filter
- FR-050~052: Star rating
- FR-031~032: Category/tag filtering
- FR-034: Rating sort

### Could Have

- FR-012 (calories/nutrition): Calorie and nutritional information
- FR-012 (photo): Photo URL extraction
- Advanced search (cooking time filter)

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| Cook Bookmark | The application name |
| Recipe URL | A web page URL containing a cooking recipe |
| AI Extraction | Automated recipe data extraction using Gemini API |
| Shared Collection | A single recipe list shared among all family members |
| Star Rating | A 1-5 scale evaluation of a recipe |

## Appendix B: Change History

| Version | Date | Changes | Author |
|---|---|---|---|
| 1.0 | 2026-02-14 | Initial creation | Requirements Analyst AI |

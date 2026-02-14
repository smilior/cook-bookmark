# Functional Requirements

**Project Name**: Cook Bookmark
**Created**: 2026-02-14
**Version**: 1.0

---

## FR-001~004: Authentication (Implemented)

**Priority**: Must Have
**Category**: Authentication
**Status**: Implemented

### Description

User authentication via Google OAuth 2.0 using Better Auth. Session management with secure cookies and route protection middleware.

### Detailed Requirements

- **FR-001**: The system SHALL authenticate users via Google OAuth 2.0
- **FR-002**: The system SHALL maintain user sessions using secure cookies
- **FR-003**: WHEN an unauthenticated user accesses `/dashboard/*`, the system SHALL redirect to `/login`
- **FR-004**: WHEN a user clicks sign out, the system SHALL clear the session and redirect to the landing page

### Acceptance Criteria (EARS Format)

#### AC-1: Google Login

**Pattern**: Event-Driven (WHEN)

```
WHEN a user clicks the Google login button, the system SHALL redirect to Google OAuth and, upon successful authentication, create a session and redirect to the dashboard.
```

**Test Verification**:
- [x] Integration test: Google OAuth flow works end-to-end
- [x] Manual test: Login redirects to dashboard

#### AC-2: Session Protection

**Pattern**: Event-Driven (WHEN)

```
WHEN an unauthenticated user requests a page matching /dashboard/*, the system SHALL redirect to /login with a callbackUrl parameter.
```

**Test Verification**:
- [x] Middleware test: Unauthenticated access redirects to login

#### AC-3: Sign Out

**Pattern**: Event-Driven (WHEN)

```
WHEN a user clicks the sign-out button, the system SHALL invalidate the session cookie and redirect to the landing page.
```

**Test Verification**:
- [x] Manual test: Sign out clears session

---

## FR-010~015: Recipe URL Registration

**Priority**: Must Have
**Category**: Recipe Registration

### Description

Users submit a URL from any recipe website. The system fetches the page, sends content to Gemini AI for extraction, and creates a structured recipe record.

### Detailed Requirements

1. **Input**
   - Recipe URL (required)

2. **Processing**
   - Fetch and parse web page content from URL
   - Send parsed content to Gemini API with extraction prompt
   - Receive structured recipe data from AI
   - Display extracted data for user confirmation

3. **Output**
   - Structured recipe record saved to database
   - Fields: title, ingredients, steps, cookingTime, servings, calories, nutrition, imageUrl, sourceUrl

### Acceptance Criteria (EARS Format)

#### AC-4: URL Submission

**Pattern**: Event-Driven (WHEN)

```
WHEN a user submits a valid URL, the system SHALL fetch the page content and initiate AI extraction.
```

**Test Verification**:
- [ ] Unit test: URL validation
- [ ] Integration test: Page content fetching

#### AC-5: AI Extraction

**Pattern**: Event-Driven (WHEN)

```
WHEN page content is sent to Gemini API, the system SHALL receive and parse structured recipe data including title, ingredients, steps, cooking time, servings, calories, nutrition, and photo URL.
```

**Test Verification**:
- [ ] Unit test: Gemini API response parsing
- [ ] Integration test: End-to-end extraction from sample URLs

#### AC-6: Missing Fields

**Pattern**: Unwanted Behavior (IF...THEN)

```
IF a recipe field cannot be extracted from the source page, THEN the system SHALL either leave the field empty or use AI estimation, and SHALL NOT block the registration process.
```

**Test Verification**:
- [ ] Unit test: Handling of partial extraction results

#### AC-7: User Confirmation

**Pattern**: Event-Driven (WHEN)

```
WHEN AI extraction is complete, the system SHALL display the extracted data to the user for review and confirmation before saving to the database.
```

**Test Verification**:
- [ ] E2E test: Preview screen displays extracted data

#### AC-8: Source URL Storage

**Pattern**: Event-Driven (WHEN)

```
WHEN a recipe is saved, the system SHALL store the original source URL and display it as a link to the original page.
```

**Test Verification**:
- [ ] Unit test: Source URL is persisted

---

## FR-020~025: Recipe Management

**Priority**: Must Have (020-022), Should Have (023-025)
**Category**: Recipe Management

### Description

Users can view, edit, delete, categorize, tag, and favorite their recipes.

### Detailed Requirements

1. **Input**
   - Recipe fields for editing
   - Category selection
   - Tag input
   - Favorite toggle

2. **Processing**
   - CRUD operations on recipe records
   - Category/tag association management
   - Favorite flag toggle

3. **Output**
   - Updated recipe records
   - Updated category/tag associations

### Acceptance Criteria (EARS Format)

#### AC-9: Recipe List

**Pattern**: Event-Driven (WHEN)

```
WHEN a user navigates to the dashboard, the system SHALL display a list of all registered recipes with title, image, rating, and favorite status.
```

**Test Verification**:
- [ ] E2E test: Dashboard shows recipe list

#### AC-10: Recipe Edit

**Pattern**: Event-Driven (WHEN)

```
WHEN a user edits a recipe and saves, the system SHALL update the recipe record and display the updated information.
```

**Test Verification**:
- [ ] Integration test: Recipe update persists

#### AC-11: Recipe Delete

**Pattern**: Event-Driven (WHEN)

```
WHEN a user confirms recipe deletion, the system SHALL remove the recipe and associated tags from the database.
```

**Test Verification**:
- [ ] Integration test: Recipe and associations are removed

#### AC-12: Category Assignment

**Pattern**: Event-Driven (WHEN)

```
WHEN a user assigns a category to a recipe, the system SHALL update the recipe's category reference.
```

**Test Verification**:
- [ ] Unit test: Category assignment persists

#### AC-13: Tag Management

**Pattern**: Event-Driven (WHEN)

```
WHEN a user adds or removes tags from a recipe, the system SHALL update the recipe_tag associations accordingly.
```

**Test Verification**:
- [ ] Unit test: Tag associations are created/removed

#### AC-14: Favorite Toggle

**Pattern**: Event-Driven (WHEN)

```
WHEN a user toggles the favorite button on a recipe, the system SHALL update the isFavorite flag and reflect the change immediately in the UI.
```

**Test Verification**:
- [ ] E2E test: Favorite toggle updates UI

---

## FR-030~034: Recipe Search & Filtering

**Priority**: Must Have (030), Should Have (031-034)
**Category**: Search & Filtering

### Description

Users can search recipes by keyword and filter by category, tag, favorites, and rating.

### Acceptance Criteria (EARS Format)

#### AC-15: Keyword Search

**Pattern**: Event-Driven (WHEN)

```
WHEN a user enters a search query, the system SHALL filter recipes whose title or ingredients contain the query string (case-insensitive).
```

**Test Verification**:
- [ ] Unit test: Search matches title and ingredients

#### AC-16: Category Filter

**Pattern**: Event-Driven (WHEN)

```
WHEN a user selects a category filter, the system SHALL display only recipes belonging to the selected category.
```

**Test Verification**:
- [ ] E2E test: Category filter narrows results

#### AC-17: Tag Filter

**Pattern**: Event-Driven (WHEN)

```
WHEN a user selects a tag filter, the system SHALL display only recipes associated with the selected tag.
```

**Test Verification**:
- [ ] E2E test: Tag filter narrows results

#### AC-18: Favorites Filter

**Pattern**: Event-Driven (WHEN)

```
WHEN a user activates the favorites filter, the system SHALL display only recipes marked as favorite.
```

**Test Verification**:
- [ ] E2E test: Only favorited recipes are shown

#### AC-19: Rating Sort

**Pattern**: Event-Driven (WHEN)

```
WHEN a user selects sort by rating, the system SHALL order recipes by star rating from highest to lowest.
```

**Test Verification**:
- [ ] Unit test: Sorting order is correct

---

## FR-040~042: Family Sharing

**Priority**: Must Have
**Category**: Sharing

### Description

All authenticated users share a single recipe collection. Every user sees the same recipes.

### Acceptance Criteria (EARS Format)

#### AC-20: Shared Collection

**Pattern**: Ubiquitous (SHALL)

```
The system SHALL display the same recipe collection to all authenticated users.
```

**Test Verification**:
- [ ] Integration test: Two users see the same recipe list

#### AC-21: Recipe Ownership Display

**Pattern**: Ubiquitous (SHALL)

```
The system SHALL display the name of the user who registered each recipe.
```

**Test Verification**:
- [ ] Unit test: CreatedBy user name is displayed

---

## FR-050~052: Star Rating

**Priority**: Should Have
**Category**: Rating

### Description

Recipe registrants can rate their recipes on a 1-5 star scale based on family feedback.

### Acceptance Criteria (EARS Format)

#### AC-22: Rate Recipe

**Pattern**: Event-Driven (WHEN)

```
WHEN the recipe registrant sets a star rating (1-5), the system SHALL save the rating and display it on the recipe.
```

**Test Verification**:
- [ ] Integration test: Rating is persisted and displayed

#### AC-23: Update Rating

**Pattern**: Event-Driven (WHEN)

```
WHEN the recipe registrant updates the star rating, the system SHALL save the new rating and update the display.
```

**Test Verification**:
- [ ] Integration test: Rating update is reflected

---

## Dependencies

| Requirement | Depends On |
|---|---|
| FR-010~015 (Recipe Registration) | Gemini API key configured |
| FR-020~025 (Recipe Management) | FR-010 (Recipe Registration) |
| FR-030~034 (Search & Filter) | FR-020 (Recipe List) |
| FR-040~042 (Family Sharing) | FR-001 (Authentication) |
| FR-050~052 (Star Rating) | FR-010 (Recipe Registration) |

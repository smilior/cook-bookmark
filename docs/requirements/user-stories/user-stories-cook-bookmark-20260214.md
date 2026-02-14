# User Stories

**Project Name**: Cook Bookmark
**Epic**: MVP - Personal Recipe Collection
**Created**: 2026-02-14

---

## US-001: Google Login

**As a** family member
**I want** to log in with my Google account
**So that** I can access the shared recipe collection without creating a separate account

### Acceptance Criteria (EARS Format)

#### AC-1: Successful Login

**Pattern**: Event-Driven (WHEN)

```
WHEN a user clicks the Google login button and completes Google authentication, the system SHALL create a session and redirect to the dashboard.
```

**Given-When-Then**:
- **Given**: User is on the login page
- **When**: User clicks "Googleでログイン" and authenticates
- **Then**: User is redirected to the dashboard with an active session

### Estimate: 0 SP (Implemented)
### Priority: Must Have

---

## US-002: Register Recipe from URL

**As a** user
**I want** to paste a recipe URL and have the app automatically extract recipe information
**So that** I can quickly save recipes without manual data entry

### Acceptance Criteria (EARS Format)

#### AC-2: URL Input and Extraction

**Pattern**: Event-Driven (WHEN)

```
WHEN a user submits a recipe URL, the system SHALL fetch the page content and extract structured recipe data via Gemini AI.
```

**Given-When-Then**:
- **Given**: User is on the recipe registration page
- **When**: User pastes a URL and clicks submit
- **Then**: System shows a loading indicator, then displays extracted recipe data for review

#### AC-3: Preview and Confirm

**Pattern**: Event-Driven (WHEN)

```
WHEN extracted recipe data is displayed, the system SHALL allow the user to review, edit, and confirm before saving.
```

**Given-When-Then**:
- **Given**: AI extraction is complete and preview is shown
- **When**: User reviews the data and clicks confirm
- **Then**: Recipe is saved to the database and appears in the recipe list

### Estimate: 8 SP
### Priority: Must Have

---

## US-003: View Recipe List

**As a** user
**I want** to see all registered recipes on the dashboard
**So that** I can browse and choose what to cook

### Acceptance Criteria (EARS Format)

#### AC-4: Recipe List Display

**Pattern**: Event-Driven (WHEN)

```
WHEN a user navigates to the dashboard, the system SHALL display all recipes as cards showing title, image, rating, and favorite status.
```

**Given-When-Then**:
- **Given**: User is logged in
- **When**: User opens the dashboard
- **Then**: All shared recipes are displayed as a card list

### Estimate: 3 SP
### Priority: Must Have

---

## US-004: View Recipe Detail

**As a** user
**I want** to view the full details of a recipe
**So that** I can follow the cooking steps

### Acceptance Criteria (EARS Format)

#### AC-5: Detail Page

**Pattern**: Event-Driven (WHEN)

```
WHEN a user taps on a recipe card, the system SHALL display the full recipe detail including title, image, ingredients, steps, cooking time, servings, source URL, and rating.
```

**Given-When-Then**:
- **Given**: User is viewing the recipe list
- **When**: User taps a recipe card
- **Then**: Full recipe detail is displayed in a mobile-friendly layout

### Estimate: 3 SP
### Priority: Must Have

---

## US-005: Edit Recipe

**As a** user
**I want** to edit recipe information
**So that** I can correct errors or add personal notes

### Acceptance Criteria (EARS Format)

#### AC-6: Edit and Save

**Pattern**: Event-Driven (WHEN)

```
WHEN a user edits recipe fields and saves, the system SHALL update the recipe record and display the updated information.
```

**Given-When-Then**:
- **Given**: User is on the recipe detail page
- **When**: User taps edit, modifies fields, and saves
- **Then**: Changes are persisted and the updated recipe is displayed

### Estimate: 3 SP
### Priority: Must Have

---

## US-006: Delete Recipe

**As a** user
**I want** to delete a recipe
**So that** I can remove recipes we no longer want

### Acceptance Criteria (EARS Format)

#### AC-7: Delete with Confirmation

**Pattern**: Event-Driven (WHEN)

```
WHEN a user confirms recipe deletion, the system SHALL remove the recipe and all associated data (tags, etc.) from the database.
```

**Given-When-Then**:
- **Given**: User is on the recipe detail page
- **When**: User taps delete and confirms
- **Then**: Recipe is removed and user is redirected to the recipe list

### Estimate: 2 SP
### Priority: Must Have

---

## US-007: Search Recipes by Keyword

**As a** user
**I want** to search recipes by keyword
**So that** I can quickly find a specific recipe

### Acceptance Criteria (EARS Format)

#### AC-8: Keyword Search

**Pattern**: Event-Driven (WHEN)

```
WHEN a user enters a search query, the system SHALL filter and display recipes whose title or ingredients match the query (case-insensitive).
```

**Given-When-Then**:
- **Given**: User is on the dashboard
- **When**: User types a keyword in the search box
- **Then**: Recipe list is filtered to show matching results

### Estimate: 3 SP
### Priority: Must Have

---

## US-008: Categorize Recipes

**As a** user
**I want** to assign categories to recipes
**So that** I can organize recipes by cuisine type

### Acceptance Criteria (EARS Format)

#### AC-9: Category Assignment

**Pattern**: Event-Driven (WHEN)

```
WHEN a user assigns a category (e.g., Japanese, Western, Chinese) to a recipe, the system SHALL save the association and allow filtering by category.
```

**Given-When-Then**:
- **Given**: User is editing or registering a recipe
- **When**: User selects a category
- **Then**: Category is saved and the recipe appears under that category filter

### Estimate: 3 SP
### Priority: Should Have

---

## US-009: Tag Recipes

**As a** user
**I want** to add tags to recipes
**So that** I can create custom groupings

### Acceptance Criteria (EARS Format)

#### AC-10: Tag Management

**Pattern**: Event-Driven (WHEN)

```
WHEN a user adds or removes tags on a recipe, the system SHALL update the associations and allow filtering by tag.
```

**Given-When-Then**:
- **Given**: User is editing or registering a recipe
- **When**: User adds/removes tags
- **Then**: Tags are saved and the recipe appears under matching tag filters

### Estimate: 3 SP
### Priority: Should Have

---

## US-010: Favorite Recipes

**As a** user
**I want** to mark recipes as favorites
**So that** I can quickly access our family's go-to recipes

### Acceptance Criteria (EARS Format)

#### AC-11: Favorite Toggle

**Pattern**: Event-Driven (WHEN)

```
WHEN a user taps the favorite button on a recipe, the system SHALL toggle the favorite status and update the UI immediately.
```

**Given-When-Then**:
- **Given**: User is viewing a recipe (list or detail)
- **When**: User taps the heart/star favorite icon
- **Then**: Favorite status toggles and UI reflects the change

### Estimate: 2 SP
### Priority: Should Have

---

## US-011: Rate Recipes

**As a** recipe registrant
**I want** to rate recipes with 1-5 stars
**So that** I can remember how the family liked each dish

### Acceptance Criteria (EARS Format)

#### AC-12: Star Rating

**Pattern**: Event-Driven (WHEN)

```
WHEN the recipe registrant sets or updates a star rating (1-5), the system SHALL save the rating and display it on the recipe card and detail page.
```

**Given-When-Then**:
- **Given**: User is viewing a recipe they registered
- **When**: User taps a star rating
- **Then**: Rating is saved and displayed on the recipe

### Estimate: 2 SP
### Priority: Should Have

---

## US-012: See Who Registered a Recipe

**As a** family member
**I want** to see who registered each recipe
**So that** I know who found and added it

### Acceptance Criteria (EARS Format)

#### AC-13: Registrant Display

**Pattern**: Ubiquitous (SHALL)

```
The system SHALL display the name and profile image of the user who registered each recipe.
```

**Given-When-Then**:
- **Given**: User is viewing the recipe list or detail
- **When**: Page loads
- **Then**: Registrant name/image is shown on each recipe

### Estimate: 1 SP
### Priority: Must Have

---

## Story Point Summary

| Priority | Stories | Total SP |
|---|---|---|
| Must Have | US-001~007, US-012 | 23 SP |
| Should Have | US-008~011 | 10 SP |
| **Total** | **12 stories** | **33 SP** |

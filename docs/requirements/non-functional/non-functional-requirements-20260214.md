# Non-Functional Requirements

**Project Name**: Cook Bookmark
**Created**: 2026-02-14
**Version**: 1.0

---

## NFR-001: Performance

### Response Time

- **Page Load**: < 3 seconds (standard, no strict requirement)
- **AI Extraction**: May take 5-10 seconds; loading indicator required
- **Search/Filter**: < 1 second (client-side or simple DB query)

### Throughput

- **Concurrent Users**: Up to 5 (family use)
- **No special throughput requirements** for this scale

### Measurement

- Standard Vercel analytics (if needed)
- No dedicated load testing required

---

## NFR-002: Availability & Reliability

### Availability

- **Hosting**: Vercel serverless (standard availability ~99.9%)
- **Database**: Turso managed service (standard availability)
- **No custom SLA required** for family use

### Reliability

- **Data Backup**: Turso automatic backups (managed service default)
- **Error Handling**: Graceful error messages for AI extraction failures

---

## NFR-003: Security

### Authentication

- **Method**: Google OAuth 2.0 only (via Better Auth)
- **Session**: Cookie-based with HttpOnly and Secure flags (in production)
- **No additional MFA** required
- **No password management** required

### Communication

- **Protocol**: HTTPS (enforced by Vercel)
- **API Keys**: Stored in environment variables, never exposed to client

### Data Protection

- **Personal Data**: Only Google profile information (name, email, image)
- **No sensitive data** beyond basic user profiles
- **No GDPR compliance** required (family use only)

---

## NFR-004: Usability

### Device Support

- **Primary**: Smartphone (mobile-first design)
- **Secondary**: Desktop / Tablet
- **Design Approach**: Responsive, mobile-first using Tailwind CSS

### UI Language

- **Japanese** (all UI text in Japanese)

### Accessibility

- Standard semantic HTML
- Sufficient color contrast
- Touch-friendly button sizes (minimum 44x44px for mobile)

### User Experience

- Recipe registration should be achievable in 3 steps or fewer:
  1. Paste URL
  2. Review AI-extracted data
  3. Confirm and save
- Search and filtering should be immediately accessible from the main screen

---

## NFR-005: Scalability

- **No scalability requirements** beyond 5 users
- Vercel serverless auto-scales if needed (no configuration required)
- Turso free tier sufficient for expected data volume

---

## NFR-006: Maintainability

### Code Quality

- **Language**: TypeScript (strict mode) for type safety
- **Framework**: Next.js App Router with React Server Components
- **ORM**: Drizzle ORM with typed schema
- **UI**: shadcn/ui components for consistent design

### Database Management

- Schema managed via Drizzle Kit migrations
- Scripts available: `db:generate`, `db:migrate`, `db:push`, `db:studio`

### Deployment

- **Platform**: Vercel with Git integration
- **Process**: Push to main branch → automatic deployment
- **Zero-downtime**: Vercel handles rolling deployments

---

## NFR-007: Constraints

### Development

- **Timeline**: 1 month (MVP)
- **Team**: Solo developer + AI assistance
- **Budget**: Free tier services (Vercel, Turso, Gemini API free tier)

### External Dependencies

| Service | Constraint |
|---|---|
| Gemini API | Rate limits and token limits per request |
| Turso | Free tier: 9GB storage, 500M rows read/month |
| Vercel | Free tier: 100GB bandwidth, serverless function limits |
| Google OAuth | Requires Google Cloud Console project configuration |

### Technical

- Next.js 16 App Router (no Pages Router)
- SQLite-compatible database only (Turso/libSQL)
- No server-side persistent storage (serverless environment)

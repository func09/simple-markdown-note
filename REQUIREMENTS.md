# REQUIREMENTS.md

## 🎯 Project Goals

A robust, personal note-taking app built on the Cloudflare ecosystem (Workers, D1, Pages) while leveraging standard technologies like Hono and SQLite-compatible storage.
Enforce a highly reproducible environment using pnpm workspaces and schema-driven development with OpenAPI.

## 📅 Development Roadmap (Milestones)

### Phase 1: Environment Setup & Schema Design (pnpm / Drizzle / Hono OpenAPI) 

* **DB/API Schema**: 
    - SQLite table definitions using Drizzle in `packages/database`.
    - API specifications and schemas using `@hono/zod-openapi` and Zod in `apps/api`.
* **Persistence**: Data persistence setup using Cloudflare D1 (`.wrangler/` for local development).

### Phase 2: API Implementation & Authentication (Hono / JWT) 

* **Auth**: Sign-in and authentication implementation using JWT and email verification (Resend).
* **CRUD**: Endpoints for creating, reading, updating, and deleting notes.
* **Client Generation**: Generation and usage of a frontend TypeScript client (`packages/api-client`) from OpenAPI definitions.

### Phase 3: Web Frontend MVP (React / React Router / Tailwind CSS) 

* **UI**: 3-column responsive layout implementation leveraging UI component libraries.
* **Sync**: API integration and auto-save functionality utilizing `api-client`.

### Phase 4: Asset Management & Search (Tags)

* **Tags**: Many-to-many tag management using Drizzle.

### Phase 5: Desktop Deployment (macOS / Electron)

* **Desktop**: Packaging via Electron (`apps/desktop`). Menu bar and shortcut integration.

### Phase 6: Mobile Deployment (iOS / Expo / NativeWind) 

* **Mobile**: Native app implementation using Expo and React Native (`apps/mobile`). Building the authentication flow and basic UI.

---

## 📂 Directory Structure (Monorepo)

```text
.
├── apps/
│   ├── api/                # Hono API (Cloudflare Workers / Node.js) & OpenAPI (zod-openapi)
│   ├── web/                # React (Web / React Router / Cloudflare Pages)
│   ├── desktop/            # Electron (Native shell)
│   └── mobile/             # Expo (React Native)
├── packages/
│   ├── api-client/         # Generated & shared API client
│   ├── schemas/            # Zod schemas and type definitions
│   ├── database/           # Drizzle Schema & Migrations
│   └── emails/             # Email templates (Resend, etc.)
└── package.json
```
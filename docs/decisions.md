# Design Decisions

A running log of non-obvious choices made during development, with the trade-off behind each.

## D1 — Use SQLite via `better-sqlite3`

**Choice**: SQLite file-on-disk, accessed through the synchronous `better-sqlite3` driver.

**Considered**: PostgreSQL (managed), MySQL.

**Why SQLite**:
- The spec explicitly allows it ("Relational database of your choice, like SQLite").
- For a single-tenant tool serving 10K rows, SQLite is faster than a networked database in almost every dimension.
- Zero deploy complexity — no separate DB process, no connection pool, no schema migrations against a remote.
- `better-sqlite3` is synchronous and orders of magnitude faster for the seed script than async drivers.

**Trade-off**: Single-writer at a time. Acceptable for one HR Manager.

## D2 — Drizzle ORM over Prisma

**Choice**: Drizzle ORM with `better-sqlite3` adapter.

**Why**:
- No codegen step — schemas are plain TypeScript and refactor cleanly.
- Generates SQL that is easy to read in logs.
- Lighter weight than Prisma; smaller dependency surface for a small project.
- Plays well with `better-sqlite3`'s synchronous API.

**Trade-off**: Smaller ecosystem of plugins than Prisma; less hand-holding for newcomers.

## D3 — Fastify over Express

**Choice**: Fastify.

**Why**:
- Better TypeScript ergonomics out of the box.
- `fastify.inject()` makes integration tests fast and port-free.
- Built-in JSON schema validation hooks pair with Zod.

**Trade-off**: Smaller community than Express, slightly different middleware model.

## D4 — Vite + React (no Next.js)

**Choice**: React 18 + Vite + React Router.

**Why**:
- The product is an internal SPA. There is no SEO requirement, no SSR requirement, no marketing pages.
- Vite has a smaller surface area than Next.js — fewer concepts a reviewer has to understand to read the code.

**Trade-off**: We give up the ergonomics of Next.js' file-based routing and built-in API routes. Both are unnecessary here.

## D5 — npm workspaces over pnpm/Yarn

**Choice**: npm workspaces.

**Why**:
- Ships with Node — no extra tooling for a reviewer to install.
- For three sibling workspaces, npm is sufficient.

**Trade-off**: Slower install than pnpm, no strict dependency isolation. Acceptable here.

---

> Add entries below as further decisions are made.

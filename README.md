# Salary Management

A minimal, end-to-end salary management tool for the HR Manager of a ~10,000-person organisation. The HR Manager can browse, search, filter, add, edit and delete employees, and explore salary distributions per country and per job title.

## Stack

| Layer | Choice |
|---|---|
| Backend | Node 20 · TypeScript (strict) · Fastify · Drizzle ORM · `better-sqlite3` · Zod |
| Frontend | React 19 · Vite · TypeScript · Tailwind v4 · TanStack Query · react-hook-form · Recharts |
| Shared | Zod schemas + inferred types used by both API and forms |
| Tests | Vitest across all workspaces; React Testing Library on the client |

Design choices are recorded in [`docs/decisions.md`](docs/decisions.md).

## Project layout

```
salary-management/
├── shared/    # @salary/shared — Zod schemas + insight contract types
├── server/    # @salary/server — Fastify API + SQLite + seed script
├── client/    # @salary/client — React + Vite UI
├── data/      # first_names.txt + last_names.txt for the seed
└── docs/      # architecture, decisions, performance, prompts, progress
```

## Quick start

Prerequisites: **Node 20+** (older versions of npm don't support the workspace flags used here).

```bash
git clone git@github.com:ekeshwarj5/salary-management.git
cd salary-management
npm install              # installs all three workspaces

# Seed 10,000 employees (~52 ms median on an M1 laptop)
cd server && npm run seed && cd ..

# Terminal 1: API
cd server && npm run dev          # http://localhost:3000

# Terminal 2: UI
cd client && npm run dev          # http://localhost:5173
```

Open <http://localhost:5173>; the app redirects to `/employees`.

## Scripts

Run from the repo root unless noted otherwise.

| Command | What it does |
|---|---|
| `npm install` | Install all workspaces (npm hoists shared deps). |
| `npm test` | Run Vitest in every workspace. |
| `npm run typecheck` | `tsc --noEmit` across all workspaces. |
| `npm run build` | Build all workspaces. |

### Server-only

| Command | What it does |
|---|---|
| `npm run dev --workspace=@salary/server` | Boot Fastify with `tsx watch`. |
| `npm run seed --workspace=@salary/server` | Seed 10K employees (`--count=N`, `--seed=N`, `--db=path`). |
| `npm test --workspace=@salary/server` | 108 service / repository / route tests. |

### Client-only

| Command | What it does |
|---|---|
| `npm run dev --workspace=@salary/client` | Vite dev server on `:5173`. |
| `npm run build --workspace=@salary/client` | Production build (133 kB gz main + 104 kB gz Insights chunk). |
| `npm test --workspace=@salary/client` | 14 component tests under jsdom. |

## Configuration

The server reads three optional environment variables:

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_PATH` | `./data.db` | SQLite file path. Use `:memory:` for ephemeral runs. |
| `PORT` | `3000` | Listen port. |
| `HOST` | `0.0.0.0` | Bind address. |

The client reads `VITE_API_URL` (default `http://localhost:3000`). CORS reflects any origin, so the dev server connects with no extra setup.

## Tests

Total: **183 tests** across the three workspaces.

```bash
npm test                                # all three
npm test --workspace=@salary/shared     # 61 Zod schema tests
npm test --workspace=@salary/server     # 108 service + repo + route tests
npm test --workspace=@salary/client     # 14 component tests
```

The server tests run the same `runEmployeeRepositoryContract` suite against both `InMemoryEmployeeRepository` and `SqliteEmployeeRepository`; behavioural drift between the two implementations is a visible failure.

## API surface

| Verb | Path | Notes |
|---|---|---|
| `GET` | `/employees` | Paginated list. Query: `page`, `pageSize`, `country`, `jobTitle`, `search`. |
| `GET` | `/employees/:id` | Single employee. 404 for unknown or malformed id. |
| `POST` | `/employees` | Create. Body validated with `CreateEmployeeSchema`. |
| `PATCH` | `/employees/:id` | Partial update. Empty body rejected. |
| `DELETE` | `/employees/:id` | 204 on success, 404 if missing. |
| `GET` | `/employees/meta` | Distinct countries + job titles for filter dropdowns. |
| `GET` | `/insights/overview` | Total counts + top 10 lists. |
| `GET` | `/insights/by-country` | Per `(country, currency)` salary aggregates. |
| `GET` | `/insights/by-title?country=XX` | Per-title aggregates within one country. |

Errors come back as `{ error: 'ValidationError', issues: [{ path, message, code }] }` (Zod-shaped) or `{ error: 'NotFound', message }`.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — layered design (routes → services → repositories), shared schema strategy
- [`docs/decisions.md`](docs/decisions.md) — D1–D5: why SQLite, Drizzle, Fastify, Vite-only, npm workspaces
- [`docs/performance.md`](docs/performance.md) — seed script: 10K rows in ~52 ms median; rejected alternatives
- [`docs/prompts.md`](docs/prompts.md) — the AI prompts that shaped each phase, with reasoning
- [`docs/progress.md`](docs/progress.md) — per-phase shipped / validated / deferred log

# Salary Management

A minimal salary management tool for an HR Manager: CRUD over employees and salary insights for an organization of ~10,000 employees.

## Stack

- **Backend** — Node 20, TypeScript (strict), Fastify, Drizzle ORM, SQLite (`better-sqlite3`), Zod, Vitest
- **Frontend** — React + Vite, TypeScript, Tailwind + shadcn/ui, TanStack Query, react-hook-form, Recharts, Testing Library
- **Shared** — Zod schemas + inferred types used by both API and forms

## Layout

```
salary-management/
├── server/    # Fastify API + SQLite
├── client/    # React + Vite UI
├── shared/    # Zod schemas / types (consumed by both)
├── data/      # first_names.txt, last_names.txt (for seed)
└── docs/      # architecture, decisions, performance, prompts, progress
```

## Run

> Requires Node 20+. Install once at the repo root — npm workspaces hoist dependencies.

```bash
npm install
npm run build         # build all workspaces
npm test              # run all tests
npm run typecheck     # type-check all workspaces
```

Per-workspace commands are documented inside each workspace's `package.json`.

## Test

Tests are written first (TDD). Each commit reflects a single red → green → refactor step.

```bash
npm test                       # all workspaces
npm test --workspace=server    # only server
npm test --workspace=client    # only client
npm test --workspace=shared    # only shared
```

## Run the API

```bash
cd server
npm run dev        # tsx watch + Fastify on http://localhost:3000
```

Environment variables (all optional):
- `DATABASE_PATH` — SQLite file path (default `./data.db`)
- `PORT` — listen port (default `3000`)
- `HOST` — bind address (default `0.0.0.0`)

CORS reflects any origin, so a frontend on `localhost:5173` (Vite default) can call the API directly.

## Seed

A seed script populates the database with 10,000 employees by combining names from `data/first_names.txt` and `data/last_names.txt`. See [`docs/performance.md`](docs/performance.md) for benchmark numbers (current run: ~52 ms for 10K rows).

```bash
cd server
npm run seed                              # 10K rows, ./data.db, random
npm run seed -- --count=5000 --seed=42    # reproducible, smaller
npm run seed -- --db=../data.db           # write outside server/
```

The script truncates `employees` before inserting, so re-runs are idempotent.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system overview, layering, data flow
- [`docs/decisions.md`](docs/decisions.md) — trade-offs and design choices
- [`docs/performance.md`](docs/performance.md) — seed script benchmarks
- [`docs/prompts.md`](docs/prompts.md) — AI prompts used during development
- [`docs/progress.md`](docs/progress.md) — per-phase build log

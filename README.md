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

## Seed

A seed script populates the database with 10,000 employees by combining names from `data/first_names.txt` and `data/last_names.txt`. See `docs/performance.md` for benchmark numbers.

```bash
npm run seed --workspace=server
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — system overview, layering, data flow
- [`docs/decisions.md`](docs/decisions.md) — trade-offs and design choices
- [`docs/performance.md`](docs/performance.md) — seed script benchmarks
- [`docs/prompts.md`](docs/prompts.md) — AI prompts used during development
- [`docs/progress.md`](docs/progress.md) — per-phase build log

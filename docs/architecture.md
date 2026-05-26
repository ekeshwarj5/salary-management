# Architecture

## Overview

A single-tenant web application for an HR Manager to manage ~10,000 employees and explore salary insights. Three workspaces (`shared`, `server`, `client`) in one npm workspace, talking through a typed HTTP boundary.

```
┌─────────────┐    HTTP / JSON     ┌────────────────────────────────────┐    SQL    ┌─────────┐
│   Client    │ ─────────────────▶ │   Server (Fastify)                 │ ────────▶ │ SQLite  │
│  React+Vite │ ◀───────────────── │   routes → services → repository   │ ◀──────── │  file   │
└─────────────┘                    └────────────────────────────────────┘           └─────────┘
       │                                          │
       └─────────── shared Zod schemas (one source of truth) ─────────────┘
```

## Layers (server)

1. **routes/** — HTTP concerns only: parse, validate with Zod, call a service, shape the response. No business logic.
2. **services/** — pure business logic. Operates on plain values and a repository interface. Easy to unit-test without a database.
3. **repositories/** — the only layer that knows about SQL. Implements an interface defined alongside the service.

The repository interface is a port. Two implementations satisfy it:

- `InMemoryEmployeeRepository` — used in service-level unit tests and as a reference implementation.
- `SqliteEmployeeRepository` — production path, backed by Drizzle ORM + `better-sqlite3`.

Both implementations run the same `runEmployeeRepositoryContract` test suite (`server/test/employee-repository.contract.ts`); behavioural drift between them surfaces as a visible test failure.

## Services

- **`EmployeeService`** — CRUD over the aggregate, list with pagination + filters, and `getFilterMeta()` for the frontend's filter dropdowns.
- **`InsightsService`** — pure aggregations over `repo.findAll()`:
  - `getByCountry()` — salary aggregates grouped by `(country, currency)`. No cross-currency averages.
  - `getByTitleInCountry(country)` — same aggregates per `(jobTitle, currency)` within one country.
  - `getOverview()` — headcount totals plus top-10 lists. Headcount-only, so cross-currency is moot.

Median is reported alongside mean in both salary aggregations because salary distributions are right-skewed and the mean alone misleads.

## Shared types

The `shared/` workspace exports Zod schemas (`EmployeeSchema`, `CreateEmployeeSchema`, `UpdateEmployeeSchema`) and the output-type contracts for insights (`OverviewInsight`, `CountrySalaryInsight`, `TitleSalaryInsight`). Both the server (request validation) and the client (form validation + form types + API response types) consume them. There is exactly one place where the domain shape lives.

## Database

SQLite via `better-sqlite3`. Justified in [`decisions.md`](decisions.md).

Schema and indexes are created programmatically by `ensureSchema()` in `server/src/db/client.ts`, kept in lockstep with the Drizzle definition in `server/src/db/schema.ts`. The same setup path runs in production and in `:memory:` for tests.

Indexes:
- `idx_employees_country` — country aggregations
- `idx_employees_job_title` — title aggregations
- `idx_employees_country_job_title` — combined (e.g. "average salary for Engineer in IN")

## Client architecture

- **Routing** via `react-router-dom`'s `createBrowserRouter`. Two routes — `/employees` (default) and `/insights` (lazy-loaded so Recharts isn't paid for on the landing page).
- **Data fetching** via TanStack Query. Each feature has its own `hooks.ts` with `useQuery` / `useMutation` wrappers. Mutations invalidate the relevant cache key on success; filter dropdowns get a 5-minute `staleTime`, insights queries 60 s.
- **Forms** via `react-hook-form` + `@hookform/resolvers/zod`, reusing `CreateEmployeeSchema` from `@salary/shared`. Server-side `ValidationError` issues come back through `ApiError.body.issues` and route to specific fields via `setError`.
- **URL-driven state** — filters (`search`, `country`, `jobTitle`) and pagination (`page`) live in the URL, so refresh, bookmark, and back/forward all preserve view state.
- **UI primitives** — handwritten Tailwind components (`Button`, `Input`, `Select`, `Card`, `Dialog`, `Field`, `Pagination`) instead of shadcn. Smaller dependency surface; every prop is visible at a glance.
- **Error boundary** at the app root for render-time crashes.

## Seed script

The seed (`server/src/seed.ts`) is a CLI that bypasses the repository contract intentionally — bulk insert is a hot path, not part of the application surface. It uses raw `better-sqlite3` with a prepared statement inside a single transaction; 10 K rows lands in ~52 ms median. Details and rejected alternatives in [`performance.md`](performance.md).

## Testing strategy

- **Unit** — pure functions and services against the in-memory repository. Fast, deterministic.
- **Repository contract** — a single suite (`server/test/employee-repository.contract.ts`) that both repository implementations satisfy. Guarantees behavioural parity.
- **Route integration** — Fastify `.inject()` against the in-memory repository. No port binding, no HTTP round-trip, but the full request lifecycle (validation, routing, handler, response shaping) is exercised.
- **Component** — React Testing Library on the client, behaviour-focused (not snapshots). The dialog tests stub `HTMLDialogElement.showModal/close` because jsdom doesn't implement them.

Tests are deterministic — no real network, no time-dependent assertions, no flaky fixtures.

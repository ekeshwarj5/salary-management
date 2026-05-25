# Architecture

> This document is updated incrementally as the system takes shape. Treat anything below as a snapshot at the time it was last edited.

## Overview

A single-tenant web application for an HR Manager to manage ~10,000 employees and explore salary insights. It is intentionally minimal: one persona, one host, one relational database.

```
┌─────────────┐    HTTP/JSON     ┌────────────────────────────┐    SQL    ┌─────────┐
│   Client    │ ───────────────▶ │   Server (Fastify)         │ ────────▶ │ SQLite  │
│  React+Vite │ ◀─────────────── │   routes → services → repo │ ◀──────── │  file   │
└─────────────┘                  └────────────────────────────┘           └─────────┘
       │                                       │
       └──────── shared Zod schemas (validation + types) ────────┘
```

## Layering (server)

1. **routes/** — HTTP concerns only: parse, validate (Zod), call a service, shape the response. No business logic.
2. **services/** — pure business logic. Operates on plain values and a repository interface. Easy to unit-test without a database.
3. **repositories/** — the only layer that knows SQL. Implements an interface that services depend on.

The repository interface allows substituting an in-memory implementation for fast unit tests, and a real SQLite-backed implementation in production / integration tests.

## Shared types

The `shared/` workspace exports Zod schemas (e.g. `EmployeeSchema`, `CreateEmployeeSchema`). Both the server (request validation) and the client (form validation + type inference) consume these. There is exactly one source of truth for the domain model.

## Database

SQLite via `better-sqlite3`. Justified in [`decisions.md`](decisions.md).

Key indexes (planned):
- `country` — for country-level insights
- `job_title` — for title-level insights
- `(country, job_title)` — for combined insights queries

## Testing strategy

- **Unit** (fastest) — pure service functions against an in-memory repository.
- **Integration** — Fastify routes via `fastify.inject()` against an in-memory SQLite database.
- **Component** — React components via React Testing Library (behavior, not snapshots).

Tests are deterministic — no real network, no real time-dependent assertions, no flaky fixtures.

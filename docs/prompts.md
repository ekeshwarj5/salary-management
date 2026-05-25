# AI Prompts Log

The assessment asks us to use agentic AI tools intentionally and to record how they were used. This file collects the prompts and the reasoning behind them, in chronological order.

The intent is not to log every keystroke, but to capture the *non-obvious* prompts — the ones that shaped a design decision, accelerated a task significantly, or that I'd want a teammate to see.

## Phase 0 — Planning

**Prompt**: _Paste of the assessment spec, with a request to confirm understanding and propose a stack._

**Why**: Force an explicit playback of the spec before any code, to surface misreadings early. The output was a per-requirement table and a stack proposal that we iterated on.

## Phase 1 — Scaffold

**Prompt**: _Create the repo skeleton (npm workspace, TS strict, Vitest, Prettier, ESLint base), plus the empty `docs/` artifacts described above._

**Why**: Boilerplate has no design content; delegate it. The constraint that mattered was "minimal" — no monorepo tooling beyond npm workspaces, no Husky, no committed lockfile yet (we'll add one after the first install).

## Phase 2 — Domain schemas (TDD)

**Prompt**: _Drive the Employee Zod schema with tests, one field per commit. Each cycle: write the failing tests for the next field, run them to confirm red, write the minimum schema change to pass, run them again, commit. Group related fields (e.g. salary + currency) into a single cycle when they share validation patterns. Keep tests focused — one behavior per `it()`._

**Why**:
- Field-by-field commits give Incubyte's reviewer a visible record of the design emerging through tests, which is the artifact they explicitly evaluate.
- Grouping the obvious mirrors (salary/currency, email/department/joinedAt) prevents the commit log from becoming "+1 line each" noise.
- Using `validEmployee` as a single, growing base record in the tests means adding a required field changes one constant rather than every assertion.
- For derived schemas (`CreateEmployeeSchema`, `UpdateEmployeeSchema`) we chose `.strict()` to make id-injection and field typos loud — the alternative (Zod's default of silently stripping unknowns) hides bugs at the edge of the API.

**Validation discipline**: After each cycle, ran `npm test --workspace=@salary/shared`; would not commit on red. The single red-then-green sequence happened in the first cycle (deliberate, to show the rhythm in `docs/prompts.md`); subsequent cycles ran against the already-passing suite.

## Phase 3 — Service + in-memory repo (TDD)

**Prompt**: _Build EmployeeService and an InMemoryEmployeeRepository with TDD. Service depends on a repository interface (port), never on a concrete DB. One commit per CRUD method, plus one for list+pagination, plus one for list filters. Inject the id generator so tests get deterministic UUIDs. Service trusts that input is already schema-validated upstream — types are the contract; don't double-validate inside the service._

**Why**:
- The port/adapter split is the move that makes SQLite swap-in painless in Phase 4 and keeps the service tests at unit-test speed.
- Injectable id generator over mocking `crypto.randomUUID()` — the seam is explicit in the type and trivially overridable; no global state to reset.
- Splitting list into "pagination" and "filters" commits keeps each diff small enough to read in one breath. Combining them would have been ~10 tests in one commit.
- The decision to *not* re-validate inside the service was deliberate: a redundant `CreateEmployeeSchema.parse()` here would muddy the boundary, slow the seed path (which calls a similar shape), and conflict with the type-first contract.

**Validation discipline**: Each cycle ran `npm test --workspace=@salary/server` before committing. Final suite at 25 green.

---

> Subsequent phases will append here as we build.

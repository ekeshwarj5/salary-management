# AI Prompts Log

The assessment asks us to use agentic AI tools intentionally and to record how they were used. This file collects the prompts and the reasoning behind them, in chronological order.

The intent is not to log every keystroke, but to capture the *non-obvious* prompts — the ones that shaped a design decision, accelerated a task significantly, or that I'd want a teammate to see.

## Phase 0 — Planning

**Prompt**: _Paste of the assessment spec, with a request to confirm understanding and propose a stack._

**Why**: Force an explicit playback of the spec before any code, to surface misreadings early. The output was a per-requirement table and a stack proposal that we iterated on.

## Phase 1 — Scaffold

**Prompt**: _Create the repo skeleton (npm workspace, TS strict, Vitest, Prettier, ESLint base), plus the empty `docs/` artifacts described above._

**Why**: Boilerplate has no design content; delegate it. The constraint that mattered was "minimal" — no monorepo tooling beyond npm workspaces, no Husky, no committed lockfile yet (we'll add one after the first install).

---

> Subsequent phases will append here as we build.

# Performance Notes

The seed script is the only piece where performance is explicitly called out by the spec ("engineers run this script regularly, and performance of the script matters"). This document records the techniques used, the measured timings, and the rejected alternatives.

## Seed script

**Input**: `data/first_names.txt` (100) × `data/last_names.txt` (100) loaded once into memory.

**Output**: 10,000 rows in the `employees` table (default; configurable via `--count`).

### Techniques used

1. **Single transaction**. All inserts run inside `sqlite.transaction(...)`. SQLite commits to disk once instead of after every row. This alone is roughly two orders of magnitude faster than per-row commits.
2. **Prepared statement**. `sqlite.prepare(INSERT … VALUES (?, …, ?))` parses once; each invocation reuses the plan and just binds parameters.
3. **Synchronous driver**. `better-sqlite3` skips the async-roundtrip cost that affects `sqlite3`/`mysql2`-style drivers. For a tight in-process insert loop this is the right trade.
4. **In-memory name lists**. Both `.txt` files are read once with `readFileSync`; the loop picks by index. No file I/O per row.
5. **Idempotent re-runs**. The script `DELETE FROM employees` before inserting; engineers can re-run without worrying about the email `UNIQUE` constraint.
6. **Deterministic mode**. `--seed=N` swaps `Math.random` for a mulberry32 PRNG, so benchmark runs and bug repros use the exact same dataset.

### Measurements

| Run | Rows | Wall-clock (ms) | Rows/sec | Notes |
|-----|-----:|----------------:|---------:|-------|
| 1   | 10,000 | 54 | 186,545 | `--seed=42`, fresh DB, MacBook (M1-class) |
| 2   | 10,000 | 51 | 197,444 | `--seed=42` |
| 3   | 10,000 | 52 | 194,157 | `--seed=42` |

Median: **~52 ms / 10K rows (~195K rows/sec)**. Well inside the "under one second" target.

### Rejected alternatives

- **Drizzle ORM `.insert(employees).values(rows).run()`** — convenient and type-safe, but each call goes through Drizzle's query builder and assembles a fresh SQL string. Direct prepared statement + transaction is 5–10× faster for bulk inserts at this size.
- **`INSERT INTO employees VALUES (...), (...), (...)` chunked multi-row inserts** — comparable speed, but slightly more code and an upper bound on parameters per statement (SQLite default is 32K). Single prepared + transaction is simpler and as fast within the prepared-statement amortisation window.
- **Bypassing repository contract entirely** — kept. The repository contract serves the *application*, not bulk ETL; mixing a 10K-row hot path into the repo interface would muddy the abstraction with a method nobody else needs. The seed script lives outside the contract by design.

### Reproduce

```bash
cd server
npm run seed -- --count=10000 --seed=42 --db=../data.db
```

Then sanity-check from the repo root:

```bash
sqlite3 data.db "SELECT country, currency, COUNT(*), ROUND(AVG(salary)) FROM employees GROUP BY country, currency ORDER BY country;"
```

## Other paths (qualitative)

- **List with filters at 10K rows**. Indexed on `country`, `job_title`, `(country, job_title)`. Page fetches are sub-millisecond.
- **Insights aggregations**. Currently the service reads all 10K rows via `findAll()` and aggregates in JS. End-to-end (DB read + JS grouping/median) measures in low single-digit milliseconds; well within an interactive HR dashboard's budget. If the dataset grew an order of magnitude, the natural next step is to push aggregations into SQL `GROUP BY`.

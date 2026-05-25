# Performance Notes

The seed script is the only piece where performance is explicitly called out by the spec ("engineers run this script regularly, and performance of the script matters"). This document records the techniques used and the measured timings.

## Seed script targets

- **Input**: `data/first_names.txt` + `data/last_names.txt`, both loaded into memory once.
- **Output**: 10,000 rows in the `employees` table.
- **Target**: well under one second on a modern laptop.

## Techniques (planned)

1. **Single transaction** — wrap all inserts in `db.transaction(() => …)`. `better-sqlite3` then commits once, not per row.
2. **Prepared statement** — `const insert = db.prepare("INSERT INTO employees (…) VALUES (…)")`. The parser runs once; each invocation reuses the plan.
3. **No async overhead** — `better-sqlite3` is synchronous; we avoid the overhead of async drivers and event-loop hops.
4. **In-memory name lists** — read both `.txt` files once, then pick names by index in a tight loop. No file I/O per row.
5. **Deterministic mode** — accept a `--seed=<int>` flag for reproducible runs (uses a seeded PRNG); useful for tests.
6. **Idempotency** — `--reset` flag truncates the table before inserting; default mode appends.

## Benchmark format

After implementing the seed script, this document will record:

| Run | Rows | Wall-clock (ms) | Notes |
|-----|-----:|----------------:|-------|
| _example_ | 10,000 | _tbd_ | _baseline, single transaction + prepared stmt_ |

Numbers will be the median of three runs on the same machine, with a freshly created database file.

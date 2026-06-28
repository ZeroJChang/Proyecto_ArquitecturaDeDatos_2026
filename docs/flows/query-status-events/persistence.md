# Query Status Events — Persistence Context

This flow is read-only and spans both datastores: it queries the canonical [status_events](../../knowledge/database.md#status_events) collection in MongoDB and resolves branch VINs from the canonical [vehicles](../../knowledge/database.md#vehicles) table in PostgreSQL. The registry owns their structure, [indexes](../../knowledge/database.md#4-indexes), and [relationships](../../knowledge/database.md#5-relationships); this file documents only how the flow accesses them.

## Stores read

| Store | Why this flow reads it |
|-------|------------------------|
| [status_events](../../knowledge/database.md#status_events) (MongoDB) | The status data returned by the events, latest, and faults endpoints |
| [vehicles](../../knowledge/database.md#vehicles) (PostgreSQL) | Resolve which VINs belong to a branch operator's branch |

## Read access patterns

- **Events:** `find({ vin?, event_timestamp range })`, `sort({ event_timestamp: -1 })`, `skip`/`limit`.
- **Latest:** `findOne({ vin })`, `sort({ event_timestamp: -1 })`.
- **Faults (aggregation pipeline):**
  1. `$match` the VINs in the branch set,
  2. `$sort` by `event_timestamp` descending,
  3. `$group` by `vin`, taking the first (latest) document,
  4. `$match` where `codigo_problema` is not in `[null, '']`.

## Cross-store scoping

Branch scoping crosses engines, so the join runs in application code, not the database — a direct consequence of the canonical cross-store [relationship](../../knowledge/database.md#5-relationships):

1. `vehicles.find({ branchId })` in PostgreSQL → the branch's VIN set.
2. That VIN set constrains the MongoDB query or aggregation above.

An `ADMIN` skips step 1; an operator with no branch resolves to an empty VIN set, and therefore an empty result.

## Consistency and performance

- **Consistency:** eventual relative to status ingestion — reads see whatever [Ingest Status](../ingest-status/index.md) has committed.
- **Index support:** the canonical status access [index](../../knowledge/database.md#4-indexes) on `{ vin, event_timestamp }` serves the events and latest reads and keeps the faults `$match`/`$sort` efficient over the branch's VIN set.
- **Retention:** bounded by the status retention window owned by [Constraints](../../knowledge/database.md#6-constraints); older documents have expired.

---

[Previous: Domain Context](domain-context.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

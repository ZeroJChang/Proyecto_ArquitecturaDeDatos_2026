# Ingest GPS — Persistence Context

This flow is the writer for the [`gps_events`](../../knowledge/database.md#gps_events) entity. The [Database registry](../../knowledge/database.md) owns the entity definition, its columns, [indexes](../../knowledge/database.md#4-indexes), [relationships](../../knowledge/database.md#5-relationships), and [constraints](../../knowledge/database.md#6-constraints); this file documents only how the GPS pipeline accesses the store locally.

## Write access

- **Mode:** JDBC `mode=append` to PostgreSQL `gps_events`, one write per Spark micro-batch.
- **No upsert / no conditional write:** the writer only appends; it never updates or deletes. This realizes the canonical [append-only constraint](../../knowledge/database.md#6-constraints).
- **Flattening:** the nested `telemetria` object is lifted to top-level `latitude`/`longitude` and `processed_at` is stamped at ingestion before the append (see [Sequence](sequence.md)).
- **Empty batches:** the writer early-returns on an empty micro-batch, issuing no JDBC call.

## Delivery and consistency

- **At-least-once:** Kafka offsets are committed to the checkpoint only after a successful write, so a frame is never skipped but may be written more than once after a retry. There is no ingestion-time deduplication.
- **Eventual consistency:** rows become visible to [Query GPS Events](../query-gps-events/index.md) only after the owning micro-batch commits; readers are eventually consistent relative to ingestion latency.

## Failure and retry

- A failed JDBC write (PostgreSQL down, network error) errors the micro-batch; its offsets are **not** committed and Structured Streaming retries the same offsets once the store recovers.
- Because the retry replays uncommitted offsets, duplicate rows are possible — acceptable under the at-least-once model.

## Access patterns and indexes

- The write path needs no secondary index beyond the primary key.
- Owner range reads (`WHERE vin = ? AND event_timestamp BETWEEN ? AND ?`) rely on the **recommended** `(vin, event_timestamp)` index catalogued in [Database → Indexes](../../knowledge/database.md#4-indexes); it is a read-side concern, not created by this flow.
- The association to `vehicles` is a logical `vin` relationship resolved at read time — see [Database → Relationships](../../knowledge/database.md#5-relationships).

## Retention

The 30-day GPS retention window is a canonical [constraint](../../knowledge/database.md#6-constraints) enforced outside this flow (scheduled purge / partition drop); the pipeline only appends.

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

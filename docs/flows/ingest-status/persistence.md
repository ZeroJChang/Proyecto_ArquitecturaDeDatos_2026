# Ingest Status — Persistence Context

This flow is the writer for the [`status_events`](../../knowledge/database.md#status_events) entity. The [Database registry](../../knowledge/database.md) owns the entity definition, its fields, [indexes](../../knowledge/database.md#4-indexes), [relationships](../../knowledge/database.md#5-relationships), and [constraints](../../knowledge/database.md#6-constraints); this file documents only how the status pipeline accesses the store locally.

## Write access

- **Mode:** append to the MongoDB `status_events` collection via the Mongo Spark connector, one write per Spark micro-batch.
- **No upsert / no conditional write:** the writer only appends; it never updates or deletes, realizing the canonical [append-only constraint](../../knowledge/database.md#6-constraints).
- **Flattening:** the nested `telemetria` object is lifted to top-level `bateria`, `encendido`, `codigo_problema`, and `kilometraje`, and `processed_at` is stamped at ingestion before the append (see [Sequence](sequence.md)). The document store absorbs any unknown future `telemetria` keys.
- **Empty batches:** the writer early-returns on an empty micro-batch.

## Delivery and consistency

- **At-least-once:** Kafka offsets are committed to the checkpoint only after a successful write, so a frame is never skipped but may be written more than once after a retry. There is no ingestion-time deduplication.
- **Eventual consistency:** documents become visible to [Query Status Events](../query-status-events/index.md) and [View Dashboards](../view-dashboards/index.md) only after the owning micro-batch commits; readers are eventually consistent relative to ingestion latency.

## Failure and retry

- A failed connector write (MongoDB down, network error) errors the micro-batch; its offsets are **not** committed and Structured Streaming retries the same offsets once the store recovers.
- Replaying uncommitted offsets can duplicate documents — acceptable under the at-least-once model.

## Access patterns and indexes

- The write path needs no secondary index beyond `_id`.
- Latest, range, and fault reads rely on the **recommended** compound `{ vin: 1, event_timestamp: -1 }` index, and the 365-day expiry relies on the **recommended** TTL index — both catalogued in [Database → Indexes](../../knowledge/database.md#4-indexes) as read/retention concerns, not created by this flow.
- The association to `vehicles` is a cross-store logical `vin` relationship resolved at read time in PostgreSQL — see [Database → Relationships](../../knowledge/database.md#5-relationships).

## Retention

The 365-day status retention window is a canonical [constraint](../../knowledge/database.md#6-constraints) enforced by a MongoDB TTL index (planned) outside this flow; the pipeline only appends.

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

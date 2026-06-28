# Query GPS Events — Persistence Context

This flow is read-only. It reads two PostgreSQL stores — the canonical [gps_events](../../knowledge/database.md#gps_events) table and the [vehicle_owners](../../knowledge/database.md#vehicle_owners) link. The registry owns their columns, [indexes](../../knowledge/database.md#4-indexes), [relationships](../../knowledge/database.md#5-relationships), and [constraints](../../knowledge/database.md#6-constraints); this file documents only how the flow accesses them.

## Stores read

| Store | Why this flow reads it |
|-------|------------------------|
| [gps_events](../../knowledge/database.md#gps_events) | The GPS history returned on screen and exported to CSV |
| [vehicle_owners](../../knowledge/database.md#vehicle_owners) | Confirms the caller owns the requested `vin` before any data is returned |

## Read access patterns

- **Ownership check:** `vehicle_owners.findOne({ userId: user.sub, vehicle: { vin } })` joined to `vehicles` via relation, returning the link or null. This is the local use of the canonical owner [relationship](../../knowledge/database.md#5-relationships).
- **Paginated read (`/events`):** `WHERE vin = ? AND event_timestamp BETWEEN ? AND ?`, ordered `event_timestamp` **descending**, with `skip`/`take` pagination for on-screen browsing.
- **Full read (`/events/download`):** the same filter ordered `event_timestamp` **ascending**, with no pagination — every row in range for a chronological export.

## Cross-store and scoping notes

Both queries run entirely in PostgreSQL; there is no cross-store join. Access is scoped by the ownership lookup above rather than by branch.

## Consistency, ordering, and risk

- **Consistency:** eventual relative to ingestion — reads see whatever [Ingest GPS](../ingest-gps/index.md) has committed.
- **Ordering:** descending for the list (newest first), ascending for the download (chronological).
- **Unbounded download:** the download path applies no row cap, so a wide date range can return a large result set. The canonical GPS range [index](../../knowledge/database.md#4-indexes) keeps the filter efficient, but capping or streaming the range is the scaling lever.
- **Retention:** the flow can only return data still inside the GPS retention window owned by [Constraints](../../knowledge/database.md#6-constraints); older rows have been purged.

---

[Previous: Domain Context](domain-context.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

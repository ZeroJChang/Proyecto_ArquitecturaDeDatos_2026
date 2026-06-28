# List Branches — Persistence Context

This flow reads the relational branch registry and counts related rows. The canonical [Database registry](../../knowledge/database.md) owns the entity definitions, indexes, relationships, and constraints; this file documents only how this flow reads them.

## Canonical entities

- [branches](../../knowledge/database.md#branches) — the master table read by this flow.
- [vehicles](../../knowledge/database.md#vehicles) and [vehicle_owners](../../knowledge/database.md#vehicle_owners) — counted per branch.

See [Relationships](../../knowledge/database.md#5-relationships) for the branch→vehicles and ownership relationships these counts traverse.

## Read access patterns

- **List with counts:** `branches` left-joined to a count of `vehicles` and of `vehicle_owners` per branch.
- **Search / sort / pagination:** applied over the branch rows; every response is paginated (`{ data, meta }`).
- **Consistency:** strong, read-your-writes reads against PostgreSQL.

## Performance

Low-cardinality master data; the count joins are cheap at this scale and need no partitioning.

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

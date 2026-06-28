# List Users — Persistence Context

This flow reads the relational user registry. The canonical [Database registry](../../knowledge/database.md) owns the entity definition, indexes, relationships, and constraints; this file documents only how this flow reads them.

## Canonical entities

- [users](../../knowledge/database.md#users) — the account registry read by this flow.

See [Indexes](../../knowledge/database.md#4-indexes) for the unique `email` index and [Relationships](../../knowledge/database.md#5-relationships) for the optional branch assignment.

## Read access patterns

- **List:** `users` with search, role filter, sort, and pagination (`{ data, meta }`).
- **Projection:** the mapper omits the `password` column; the bcrypt hash is **never** serialized into a response.
- **Consistency:** strong, read-your-writes reads against PostgreSQL.

## Sensitive data

`users.password` holds a bcrypt hash classified as secret. It is read from the row but dropped by the mapper before serialization, so no API response carries it. The handling rule is owned by [Security → Sensitive data](../../security.md#sensitive-data).

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

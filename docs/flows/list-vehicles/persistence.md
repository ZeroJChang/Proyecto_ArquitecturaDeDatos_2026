# List Vehicles — Persistence Context

This flow reads the relational vehicle registry. The canonical [Database registry](../../knowledge/database.md) owns the entity definitions, indexes, relationships, and constraints; this file documents only how this flow reads them.

## Canonical entities

- [vehicles](../../knowledge/database.md#vehicles) — the fleet registry, read by all three endpoints.
- [vehicle_owners](../../knowledge/database.md#vehicle_owners) — joined to resolve owner-scoped reads.
- [branches](../../knowledge/database.md#branches) — used to constrain branch-scoped reads.

See [Relationships](../../knowledge/database.md#5-relationships) for how these relate, and [Indexes](../../knowledge/database.md#4-indexes) for the unique `vin` index that serves the by-VIN lookup.

## Read access patterns

| Endpoint | Scope | Access |
|----------|-------|--------|
| `GET /vehicles` (ADMIN) | All vehicles | `vehicles` paginated, no branch filter |
| `GET /vehicles` (BRANCH_USER) | Caller's branch | `WHERE branch_id = :userBranchId`, paginated |
| `GET /vehicles/owner` (OWNER) | Owned vehicles | `vehicle_owners` joined to `vehicles` filtered by `user_id` |
| `GET /vehicles/:vin` (ADMIN, BRANCH_USER) | Single vehicle | `WHERE vin = :vin`; branch users additionally constrained to their `branch_id` |

## Scoping

Role-based scoping follows the canonical [Data scoping](../../knowledge/domain.md#data-scoping) policy: admins see all rows, branch operators only their branch, owners only vehicles linked through `vehicle_owners`. A by-VIN read outside the caller's branch returns `403`; an unknown VIN returns `404`.

## Consistency

Strong, read-your-writes reads against PostgreSQL. Pagination bounds every list response.

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

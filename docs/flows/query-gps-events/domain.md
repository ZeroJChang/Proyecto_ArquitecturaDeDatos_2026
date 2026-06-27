# Query GPS Events — Domain

The access and validation rules that govern who can read which GPS data. These exist to satisfy the confidentiality requirement: an owner sees only their own vehicles.

## Concepts

- **Ownership:** a row in `vehicle_owners` linking a user to a vehicle (by `vehicle_id`, resolved from `vin`).
- **Date range:** the `[startDate, endDate]` window over `event_timestamp` that bounds a query.

## Business rules and invariants

- **Owner scoping (download):** the `download` endpoint requires the caller to own the `vin`. No ownership → `403`. There is no admin override on download — it is an owner-facing export.
- **Owner scoping (events list):** the JSON `events` endpoint also requires ownership, **except** `ADMIN` and `BRANCH_USER` callers, who are allowed through without an ownership row. In practice the endpoint is owner-facing; the bypass exists so privileged roles can inspect any vehicle's GPS history.
- **Valid range:** `startDate` must not be after `endDate`, else `400`.
- **Non-empty export:** a download that matches zero rows returns `404` rather than an empty file, so the user gets a clear "no data" signal.

## Edge cases

- A range entirely outside the 30-day retention window returns no rows (→ `404` on download, empty page on the list).
- Ordering differs by intent: newest-first for on-screen browsing (`events`), oldest-first for a chronological export (`download`).

## Related decision

Access scoping rationale: [ADR-0005](../../adrs/0005-jwt-rbac-data-scoping.md).

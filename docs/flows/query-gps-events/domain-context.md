# Query GPS Events — Domain Context

This flow applies the canonical [Vehicle Telemetry Access](../../knowledge/domain.md#vehicle-telemetry-access) rules and the shared [Data scoping](../../knowledge/domain.md#data-scoping) policy. The registry owns those invariants; this file documents only how the two GPS endpoints apply them and the HTTP behavior they produce.

## Local application

- **Owner scoping (download):** `GET /gps/events/download` requires the caller to own the requested `vin`. No ownership link → `403`. There is no privileged override on download — it is an owner-facing export.
- **Owner scoping (events list):** `GET /gps/events` also requires ownership, **except** for `ADMIN` and `BRANCH_USER` callers, who are let through without an ownership row so privileged roles can inspect any vehicle's GPS history. This bypass is the flow-local expression of the canonical [Data scoping](../../knowledge/domain.md#data-scoping) table.
- **Valid range:** `startDate` must not be after `endDate`; a violated range returns `400` ("La fecha de inicio no puede ser mayor a la fecha de fin").
- **Non-empty export:** a download that matches zero rows returns `404` ("No hay datos GPS para el rango solicitado") rather than an empty file, so the user gets a clear "no data" signal.

## Edge cases

- A range entirely outside the GPS retention window returns no rows — `404` on download, an empty page on the list.
- Ordering differs by intent: newest-first for on-screen browsing (`events`), oldest-first for a chronological export (`download`).

## Related decision

Access scoping rationale: [ADR-0005](../../history/adrs/0005-jwt-rbac-data-scoping.md).

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Persistence Context](persistence.md)

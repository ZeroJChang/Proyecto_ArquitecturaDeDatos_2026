# Query GPS Events

**Purpose:** Let a vehicle owner read and download the GPS history of their own vehicles.
**Trigger:** HTTP — `GET /acme-ev/gps/events`, `GET /acme-ev/gps/events/download`
**Entry point:** `backend/src/gps/controllers/gps.controller.ts::getGpsEvents` / `downloadCsv` → `GetGpsEventsHandler`, `DownloadGpsCsvHandler`
**Capability:** Vehicle Telemetry Access
**Owner:** Backend Team
**Criticality:** High

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `gps_events` (read), `vehicle_owners` (ownership check)

## Related Flows
- [Ingest GPS](../ingest-gps/) — writes the `gps_events` rows this flow reads
- [Claim Vehicle](../claim-vehicle/) — creates the ownership link this flow checks
- [Login](../login/) — issues the JWT that scopes access

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)

## Operational Notes
Not on the critical write path; serves owner reads. CSV export streams all matching rows for a range, so a very wide date range is the main cost risk. General metrics/runbooks: [`observability.md`](../../observability.md), [`operations-guide.md`](../../operations-guide.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md) · [Domain](domain.md)

## Traceability
- Project brief deliverable P3 — "Recuperación de datos para el cliente (GPS)" with CSV download; see [`references.md`](../../references.md).

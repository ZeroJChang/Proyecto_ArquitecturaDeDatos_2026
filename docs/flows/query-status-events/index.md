# Query Status Events

**Purpose:** Let admins and branch operators inspect operational status events, the latest status per vehicle, and vehicles with active faults.
**Trigger:** HTTP — `GET /acme-ev/status/events`, `GET /acme-ev/status/latest/:vin`, `GET /acme-ev/status/faults`
**Entry point:** `backend/src/status/controllers/status.controller.ts::getStatusEvents` / `getLatestStatus` / `getVehiclesWithFaults`
**Capability:** Fleet Monitoring
**Owner:** Backend Team
**Criticality:** High

## Dependencies
- Services: none beyond the datastores
- Queues/Topics: none
- Databases: MongoDB `status_events` (read), PostgreSQL `vehicles` (branch scoping)

## Related Flows
- [Ingest Status](../ingest-status/) — writes the `status_events` documents this flow reads
- [View Dashboards](../view-dashboards/) — the branch dashboard reuses fault data
- [List Vehicles](../list-vehicles/) — branch operators pair status with vehicle listings

## Related Decisions
- [ADR-0002 Polyglot persistence](../../adrs/0002-polyglot-persistence.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
Serves maintenance-planning and fault triage. Branch scoping crosses both datastores (resolve VINs in PostgreSQL, query MongoDB), so a slow `vehicles` read or a slow Mongo aggregation both affect latency. General metrics/runbooks: [`observability.md`](../../observability.md), [`operations-guide.md`](../../operations-guide.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md) · [Domain](domain.md)

## Traceability
- Project brief deliverable P4 — "Recuperación de datos para la sede (Estado)"; see [`references.md`](../../references.md).

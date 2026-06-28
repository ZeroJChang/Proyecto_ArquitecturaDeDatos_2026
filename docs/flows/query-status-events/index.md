# Query Status Events

**Status:** Validated
**Purpose:** Let admins and branch operators inspect operational status events, the latest status per vehicle, and vehicles with active faults.
**Boundary:** From an authenticated admin or branch-operator request to a returned status page, latest-status document, or fault list; ingestion of the underlying documents is out of scope.
**Why grouped:** Three status read endpoints — event history, latest-per-vehicle, and active faults — that share the same branch-scoping rules, one owner, and one failure model.
**Included triggers:** `GET /acme-ev/status/events`; `GET /acme-ev/status/latest/:vin`; `GET /acme-ev/status/faults`
**Entry point:** `backend/src/status/controllers/status.controller.ts::getStatusEvents` / `getLatestStatus` / `getVehiclesWithFaults`
**Capability:** Fleet Monitoring
**Owner:** Backend Team
**Criticality:** High

## Dependencies
- Services: none beyond the datastores
- Queues/Topics: none
- Databases: MongoDB `status_events` (read), PostgreSQL `vehicles` (branch scoping)

## Canonical Knowledge
- Domain: [Fleet Monitoring](../../knowledge/domain.md#fleet-monitoring), [Fault code semantics](../../knowledge/domain.md#fault-code-semantics), [Data scoping](../../knowledge/domain.md#data-scoping)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [status_events](../../knowledge/database.md#status_events), [vehicles](../../knowledge/database.md#vehicles)
- Security: [Authentication and Authorization](../../security.md#authentication-and-authorization)

## Related Flows
- [Ingest Status](../ingest-status/index.md) — writes the `status_events` documents this flow reads
- [View Dashboards](../view-dashboards/index.md) — the branch dashboard reuses fault data
- [List Vehicles](../list-vehicles/index.md) — branch operators pair status with vehicle listings

## Related Decisions
- [ADR-0002 Polyglot persistence](../../history/adrs/0002-polyglot-persistence.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
Serves maintenance-planning and fault triage. Branch scoping crosses both datastores (resolve VINs in PostgreSQL, query MongoDB), so a slow `vehicles` read or a slow Mongo aggregation both affect latency. General metrics/runbooks: [Observability](../../operations/observability.md), [Operations Guide](../../operations/operations-guide.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Domain Context](domain-context.md).
5. [Persistence Context](persistence.md).
6. [Contract Usage](contract-usage.md).

## Traceability
- Project brief deliverable P4 — "Recuperación de datos para la sede (Estado)"; see [References](../../knowledge/references.md).

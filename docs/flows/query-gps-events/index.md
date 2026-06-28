# Query GPS Events

**Status:** Validated
**Purpose:** Let a vehicle owner read and download the GPS history of their own vehicles.
**Boundary:** From an authenticated owner request to a returned GPS page or an exported CSV file; ingestion of the underlying rows is out of scope.
**Why grouped:** Two GPS read endpoints — paginated browse and CSV export — that share the same ownership and date-range rules, one owner, and one failure model.
**Included triggers:** `GET /acme-ev/gps/events`; `GET /acme-ev/gps/events/download`
**Entry point:** `backend/src/gps/controllers/gps.controller.ts::getGpsEvents` / `downloadCsv` → `GetGpsEventsHandler`, `DownloadGpsCsvHandler`
**Capability:** Vehicle Telemetry Access
**Owner:** Backend Team
**Criticality:** High

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `gps_events` (read), `vehicle_owners` (ownership check)

## Canonical Knowledge
- Domain: [Vehicle Telemetry Access](../../knowledge/domain.md#vehicle-telemetry-access), [Data scoping](../../knowledge/domain.md#data-scoping)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [gps_events](../../knowledge/database.md#gps_events), [vehicle_owners](../../knowledge/database.md#vehicle_owners)
- Security: [Authentication and Authorization](../../security.md#authentication-and-authorization)

## Related Flows
- [Ingest GPS](../ingest-gps/index.md) — writes the `gps_events` rows this flow reads
- [Claim Vehicle](../claim-vehicle/index.md) — creates the ownership link this flow checks
- [Login](../login/index.md) — issues the JWT that scopes access

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)

## Operational Notes
Not on the critical write path; serves owner reads. CSV export streams all matching rows for a range, so a very wide date range is the main cost risk. General metrics/runbooks: [Observability](../../operations/observability.md), [Operations Guide](../../operations/operations-guide.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Domain Context](domain-context.md).
5. [Persistence Context](persistence.md).
6. [Contract Usage](contract-usage.md).

## Traceability
- Project brief deliverable P3 — "Recuperación de datos para el cliente (GPS)" with CSV download; see [References](../../knowledge/references.md).

# List Branches

**Purpose:** List branches with per-branch vehicle and owner counts, for administrators.
**Trigger:** HTTP — `GET /acme-ev/branches`
**Entry point:** `backend/src/branches/controllers/branches.controller.ts::getBranches` → `GetBranchesHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Low

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `branches` (read), with counts over `vehicles` / `vehicle_owners`

## Related Flows
- [List Vehicles](../list-vehicles/) — branch scoping uses the branches listed here
- [View Dashboards](../view-dashboards/) — admin dashboard summarizes branch counts

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)

## Operational Notes
Admin-only, low-traffic master-data listing. Not on the critical path. General metrics/runbooks: [`observability.md`](../../observability.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md)

## Traceability
- Administrative oversight of branches; see [`references.md`](../../references.md).

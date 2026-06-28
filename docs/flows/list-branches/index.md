# List Branches

**Status:** Validated
**Purpose:** List branches with per-branch vehicle and owner counts, for administrators.
**Boundary:** Admin read of the branch registry with per-branch vehicle and owner counts; no writes.
**Why grouped:** A single trigger with one outcome, owner, and failure model.
**Included triggers:** `GET /acme-ev/branches`
**Entry point:** `backend/src/branches/controllers/branches.controller.ts::getBranches` → `GetBranchesHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Low

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `branches` (read), with counts over `vehicles` / `vehicle_owners`

## Canonical Knowledge
- Domain: [Fleet Administration](../../knowledge/domain.md#fleet-administration)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [branches](../../knowledge/database.md#branches), with counts over [vehicles](../../knowledge/database.md#vehicles) and [vehicle_owners](../../knowledge/database.md#vehicle_owners)

## Related Flows
- [List Vehicles](../list-vehicles/index.md) — branch scoping uses the branches listed here
- [View Dashboards](../view-dashboards/index.md) — admin dashboard summarizes branch counts

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)

## Operational Notes
Admin-only, low-traffic master-data listing. Not on the critical path. General metrics/runbooks: [Observability](../../operations/observability.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Persistence Context](persistence.md).
5. [Contract Usage](contract-usage.md).

## Traceability
- Administrative oversight of branches; see [References](../../knowledge/references.md).

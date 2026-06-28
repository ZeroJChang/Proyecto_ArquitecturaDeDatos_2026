# View Dashboards

**Status:** Validated
**Purpose:** Provide aggregated fleet metrics — a global view for admins and a branch view for operators.
**Boundary:** From an authenticated dashboard request to a set of aggregated fleet metrics; the detailed reads these metrics summarize belong to their own flows.
**Why grouped:** Two dashboard endpoints — a global admin view and a per-branch operator view — that share the same cross-store aggregation approach, one owner, and one failure model.
**Included triggers:** `GET /acme-ev/dashboard/admin`; `GET /acme-ev/dashboard/branch`
**Entry point:** `backend/src/dashboard/controllers/dashboard.controller.ts::getAdminDashboard` / `getBranchDashboard`
**Capability:** Fleet Monitoring
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: none beyond the datastores
- Queues/Topics: none
- Databases: PostgreSQL (`vehicles`, `branches`, `users`), MongoDB (`status_events` for faults)

## Canonical Knowledge
- Domain: [Fleet Monitoring](../../knowledge/domain.md#fleet-monitoring)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [vehicles](../../knowledge/database.md#vehicles), [branches](../../knowledge/database.md#branches), [users](../../knowledge/database.md#users), [status_events](../../knowledge/database.md#status_events)

## Related Flows
- [Query Status Events](../query-status-events/index.md) — shares the fault-derivation logic
- [List Vehicles](../list-vehicles/index.md), [List Branches](../list-branches/index.md), [List Users](../list-users/index.md) — dashboards summarize what these list in detail

## Related Decisions
- [ADR-0002 Polyglot persistence](../../history/adrs/0002-polyglot-persistence.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
Landing screens after login; high read frequency, low write impact. Each dashboard aggregates across both datastores, so it reflects their combined availability. General metrics/runbooks: [Observability](../../operations/observability.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Contract Usage](contract-usage.md).

## Traceability
- Corporate analytics / branch operations needs from the project brief; see [References](../../knowledge/references.md).

# View Dashboards

**Purpose:** Provide aggregated fleet metrics — a global view for admins and a branch view for operators.
**Trigger:** HTTP — `GET /acme-ev/dashboard/admin`, `GET /acme-ev/dashboard/branch`
**Entry point:** `backend/src/dashboard/controllers/dashboard.controller.ts::getAdminDashboard` / `getBranchDashboard`
**Capability:** Fleet Monitoring
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: none beyond the datastores
- Queues/Topics: none
- Databases: PostgreSQL (`vehicles`, `branches`, `users`), MongoDB (`status_events` for faults)

## Related Flows
- [Query Status Events](../query-status-events/) — shares the fault-derivation logic
- [List Vehicles](../list-vehicles/), [List Branches](../list-branches/), [List Users](../list-users/) — dashboards summarize what these list in detail

## Related Decisions
- [ADR-0002 Polyglot persistence](../../adrs/0002-polyglot-persistence.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
Landing screens after login; high read frequency, low write impact. Each dashboard aggregates across both datastores, so it reflects their combined availability. General metrics/runbooks: [`observability.md`](../../observability.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md)

## Traceability
- Corporate analytics / branch operations needs from the project brief; see [`references.md`](../../references.md).

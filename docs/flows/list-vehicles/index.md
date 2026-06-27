# List Vehicles

**Purpose:** Read vehicles, scoped by role — all (admin), branch-only (branch operator), or owned (owner) — plus lookup by VIN.
**Trigger:** HTTP — `GET /acme-ev/vehicles`, `GET /acme-ev/vehicles/owner`, `GET /acme-ev/vehicles/:vin`
**Entry point:** `backend/src/vehicles/controllers/vehicles.controller.ts::getVehicles` / `getOwnerVehicles` / `getVehicleByVin`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `vehicles`, `vehicle_owners`, `branches` (read)

## Related Flows
- [Claim Vehicle](../claim-vehicle/) — creates the ownership links the `/owner` endpoint reads
- [Query Status Events](../query-status-events/) — branch operators use VIN lookups alongside status

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)

## Operational Notes
Read-only admin/branch/owner listings. Not on the critical path. General metrics/runbooks: [`observability.md`](../../observability.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md)

## Traceability
- Project brief — branch and owner access to their respective vehicles; see [`references.md`](../../references.md).

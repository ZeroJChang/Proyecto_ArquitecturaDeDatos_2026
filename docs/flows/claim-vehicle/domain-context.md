# Claim Vehicle — Domain Context

This flow applies the [Fleet Administration](../../knowledge/domain.md#fleet-administration) capability. The domain registry owns the shared concepts (claim, demo vehicle, ownership) and the single-owner-per-vehicle invariant; this file documents only how the claim behaves locally.

## Single owner per vehicle (canonical)

The single-owner-per-vehicle rule is a canonical business invariant enforced inside the claim transaction — see [Database → Constraints](../../knowledge/database.md#6-constraints). Locally: a VIN already present in `vehicle_owners` cannot be claimed again, and the claim fails with `400`. There is no ownership transfer in this flow.

## Atomic claim

The existence check, the optional vehicle creation, and the ownership insert all run in one database transaction. Either the claim fully succeeds or nothing is written.

## Demo-vehicle generation (local convenience)

When the claimed VIN has no `vehicles` row, `DemoVehicleService` materializes one. These mechanics are local to this flow and exist only to keep demos and the project defense smooth — they are not a production onboarding path (see the capability note in [Fleet Administration](../../knowledge/domain.md#fleet-administration)):

- model chosen at random from a fixed list (`ACME Volt`, `Spark`, `Thunder`, `Wave`, `Pulse`),
- `id_vehiculo` derived as `VH-<last 6 of vin>`,
- `year` set to the current year,
- assigned to the **lowest-id branch** (or branch `1` if none exist).

## Assumptions

- A real claim normally targets a VIN that already exists (ingested or seeded). The demo fallback is a convenience, not a production onboarding path.
- The claiming user is a valid `OWNER` (guaranteed by `RolesGuard`).

## Edge cases and status codes

- Claiming an unknown VIN silently materializes a demo vehicle — acceptable for demo, but in production this masks "unknown VIN" errors and should be reconsidered.
- Concurrent claims of the same VIN are serialized by the transaction; the second sees the first's ownership row and fails with `400` ("Vehicle is already assigned to an owner").
- Missing or invalid `vin` → `400` from the validation pipe; a non-`OWNER` caller → `403` from `RolesGuard`.

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)

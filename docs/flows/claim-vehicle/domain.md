# Claim Vehicle — Domain

The business rules behind claiming a vehicle. The notable rule is the **demo-vehicle fallback**, which only exists to make demos and the project defense smooth.

## Concepts

- **Claim:** creating the `vehicle_owners` link between a user and a vehicle.
- **Demo vehicle:** a synthetic vehicle generated when the claimed VIN is unknown to the platform.

## Business rules and invariants

- **One owner per vehicle:** a VIN already present in `vehicle_owners` cannot be claimed again — the claim fails with `400`. There is no transfer of ownership in this flow.
- **Atomicity:** the existence check, optional vehicle creation, and ownership insert all run in one transaction. Either the claim fully succeeds or nothing is written.
- **Demo fallback:** if the VIN has no `vehicles` row, `DemoVehicleService` creates one:
  - model chosen at random from a fixed list (`ACME Volt`, `Spark`, `Thunder`, `Wave`, `Pulse`),
  - `id_vehiculo` derived as `VH-<last 6 of vin>`,
  - `year` set to the current year,
  - assigned to the **lowest-id branch** (or branch `1` if none exist).

## Assumptions

- A real claim normally targets a VIN that already exists (ingested or seeded). The demo fallback is a convenience, not a production onboarding path.
- The claiming user is a valid `OWNER` (guaranteed by `RolesGuard`).

## Edge cases

- Claiming an unknown VIN silently materializes a demo vehicle — acceptable for demo, but in production this masks "unknown VIN" errors and should be reconsidered.
- Concurrent claims of the same VIN are serialized by the transaction; the second sees the first's ownership row and fails with `400`.

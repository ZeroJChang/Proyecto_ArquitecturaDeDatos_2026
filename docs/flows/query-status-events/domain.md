# Query Status Events — Domain

The rules that decide what counts as a fault and what a branch operator may see.

## Concepts

- **Status event:** a point-in-time snapshot of a vehicle's operation (battery, ignition, fault code, odometer).
- **Active fault:** the latest status event for a vehicle reporting a non-OK fault code.
- **Branch scope:** the set of vehicles whose `branch_id` matches the operator's `branchId`.

## Business rules and invariants

- **Fault definition:** a vehicle is "in fault" when the `codigo_problema` of its **latest** status event is not null and not empty. `000` means no fault. Only the latest event matters — an old fault that has since cleared does not count.
- **Branch scoping:** a `BRANCH_USER` can only read status for vehicles in their branch. Requesting a VIN outside the branch yields `403`. An operator with no `branchId` sees an empty faults list, not an error.
- **Admin scope:** `ADMIN` may query any VIN and any date range without branch restriction.
- **Latest semantics:** "latest" is decided by `event_timestamp` (generation time), not `processed_at`, so out-of-order ingestion does not misreport the current state.

## Edge cases

- A branch with no vehicles → empty faults list.
- A VIN that exists but has no status events → `404` on `latest/:vin`; absent from `events`.
- A vehicle whose latest code is `000` is excluded from faults even if earlier events had faults.

## Related decision

Cross-store scoping and the fault model follow from [ADR-0002](../../adrs/0002-polyglot-persistence.md) and [ADR-0005](../../adrs/0005-jwt-rbac-data-scoping.md).

# Query Status Events — Domain Context

This flow applies the canonical [Fleet Monitoring](../../knowledge/domain.md#fleet-monitoring) rules, the [Fault code semantics](../../knowledge/domain.md#fault-code-semantics), and the shared [Data scoping](../../knowledge/domain.md#data-scoping) policy. The registry owns those definitions and invariants; this file documents only how the three status endpoints apply them.

## Local application

- **Fault detection (`/status/faults`):** a vehicle is surfaced when the `codigo_problema` of its latest status event is a real fault per the canonical [fault code semantics](../../knowledge/domain.md#fault-code-semantics) — not null, not empty, not `000`. A fault that has since cleared is excluded because only the latest event counts.
- **Latest selection (`/status/latest/:vin`):** "latest" follows the canonical latest-by-`event_timestamp` rule, so out-of-order ingestion never misreports current state. A VIN with no status events returns `404`.
- **Branch scoping (`BRANCH_USER`):** an operator reads status only for vehicles in their branch; requesting a VIN outside the branch returns `403`. An operator with no `branchId` gets an empty faults list, not an error — the local expression of the canonical [Data scoping](../../knowledge/domain.md#data-scoping) policy.
- **Admin scope (`ADMIN`):** may query any VIN and any date range with no branch restriction.

## Edge cases

- A branch with no vehicles → empty faults list.
- A VIN that exists but has no status events → `404` on `latest/:vin`; absent from `events`.
- A vehicle whose latest code is `000` is excluded from faults even if earlier events reported faults.

## Related decisions

Cross-store scoping and the fault model follow from [ADR-0002](../../history/adrs/0002-polyglot-persistence.md) and [ADR-0005](../../history/adrs/0005-jwt-rbac-data-scoping.md).

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Persistence Context](persistence.md)

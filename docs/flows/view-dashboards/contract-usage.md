# View Dashboards — Contract Usage

These two endpoints are part of the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, authentication, and compatibility policy; this file documents only how the dashboard operations behave locally. The full schema is the generated Swagger at `/docs`.

## Operation: `GET /acme-ev/dashboard/admin`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `ADMIN` |
| Request | No input beyond the token |
| Response body | `AdminDashboardResponseDto` — total vehicles, active branches, total users, vehicles in fault |
| Status codes | `200` success · `401` missing or invalid token · `403` wrong role |

### Example response (200)

```json
{
  "totalVehicles": 120,
  "activeBranches": 3,
  "totalUsers": 18,
  "vehiclesInFault": 4
}
```

## Operation: `GET /acme-ev/dashboard/branch`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `BRANCH_USER` |
| Request | No input beyond the token; scope derives from the caller's branch |
| Response body | `BranchDashboardResponseDto` — branch vehicles with fault flags |
| Status codes | `200` success · `401` missing or invalid token · `403` wrong role |

### Example response (200)

```json
{
  "vehicles": [
    { "vin": "ACME0000000000001", "model": "ACME Volt", "inFault": false },
    { "vin": "ACME0000000000007", "model": "ACME Spark", "inFault": true, "codigoProblema": "101" }
  ]
}
```

## Local notes

- Field names mirror the response DTOs; the generated Swagger at `/docs` is the source of truth.
- Both dashboards derive fault state from the latest status per vehicle, the same rule applied by [Query Status Events](../query-status-events/index.md).

---

[Previous: Components](components.md) · [Flow Index](index.md)

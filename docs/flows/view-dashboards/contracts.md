# View Dashboards — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `GET /acme-ev/dashboard/admin` (ADMIN)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT, role `ADMIN` |
| Response | `AdminDashboardResponseDto` — total vehicles, active branches, total users, vehicles in fault |
| Status codes | `200` · `401` · `403` |

### Example response

```json
{
  "totalVehicles": 120,
  "activeBranches": 3,
  "totalUsers": 18,
  "vehiclesInFault": 4
}
```

## `GET /acme-ev/dashboard/branch` (BRANCH_USER)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT, role `BRANCH_USER` |
| Response | `BranchDashboardResponseDto` — branch vehicles with fault flags |
| Status codes | `200` · `401` · `403` |

### Example response

```json
{
  "vehicles": [
    { "vin": "ACME0000000000001", "model": "ACME Volt", "inFault": false },
    { "vin": "ACME0000000000007", "model": "ACME Spark", "inFault": true, "codigoProblema": "101" }
  ]
}
```

## Versioning

Stable at API `1.0.0`. Field names are illustrative of the response DTOs; the generated Swagger is the source of truth.

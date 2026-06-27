# List Branches — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `GET /acme-ev/branches` (ADMIN)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT, role `ADMIN` |
| Query params | `page`, `limit`, optional search and sort |
| Response | `{ data: BranchAdmin[], meta: { total, page, limit, totalPages } }` |
| Status codes | `200` · `401` · `403` |

### Example response

```json
{
  "data": [
    { "id": 1, "name": "Guatemala City", "country": "Guatemala", "region": "Guatemala", "isActive": true, "vehicleCount": 42, "ownerCount": 30 }
  ],
  "meta": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 }
}
```

## Versioning

Stable at API `1.0.0`.

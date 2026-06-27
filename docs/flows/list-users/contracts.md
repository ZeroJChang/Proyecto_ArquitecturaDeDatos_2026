# List Users — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `GET /acme-ev/users` (ADMIN)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT, role `ADMIN` |
| Query params | `page`, `limit`, optional search, role filter, sort |
| Response | `{ data: UserAdmin[], meta: { total, page, limit, totalPages } }` |
| Status codes | `200` · `401` · `403` |

### Example response

```json
{
  "data": [
    { "id": 1, "email": "admin@acme-ev.com", "name": "Admin Principal", "role": "ADMIN", "branchId": null }
  ],
  "meta": { "total": 18, "page": 1, "limit": 10, "totalPages": 2 }
}
```

> The response DTO never includes the `password` field; the mapper drops it.

## Versioning

Stable at API `1.0.0`.

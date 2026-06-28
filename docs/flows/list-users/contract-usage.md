# List Users — Contract Usage

This flow consumes the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, and compatibility policy; this file documents only how this read operation behaves locally.

## Operation: `GET /acme-ev/users` (ADMIN)

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `ADMIN` |
| Query params | `page`, `limit`, optional search, role filter, sort |
| Response body | `{ data: UserAdmin[], meta: { total, page, limit, totalPages } }` |
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

The response DTO never includes the `password` field; the mapper drops it (see [Sensitive data](../../security.md#sensitive-data)).

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md)

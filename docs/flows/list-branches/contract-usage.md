# List Branches — Contract Usage

This flow consumes the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, and compatibility policy; this file documents only how this read operation behaves locally.

## Operation: `GET /acme-ev/branches` (ADMIN)

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `ADMIN` |
| Query params | `page`, `limit`, optional search and sort |
| Response body | `{ data: BranchAdmin[], meta: { total, page, limit, totalPages } }` |
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

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md)

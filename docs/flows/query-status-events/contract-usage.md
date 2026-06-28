# Query Status Events — Contract Usage

These three endpoints are part of the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, authentication, and compatibility policy; this file documents only how the status read operations behave locally. All three require role `ADMIN` or `BRANCH_USER`, and the full schema is the generated Swagger at `/docs`.

## Operation: `GET /acme-ev/status/events`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT (`ADMIN`, `BRANCH_USER`) |
| Query params | `vin` (optional for `ADMIN`), `startDate`, `endDate`, `page`, `limit` |
| Response body | `{ data: StatusEvent[], meta: { total, page, limit, totalPages } }` |
| Status codes | `200` success · `400` invalid params · `401` missing or invalid token · `403` out-of-branch VIN |

### Example status event

```json
{
  "vin": "ACME0000000000001",
  "eventTimestamp": "2026-06-14T15:30:00.000Z",
  "bateria": 78.5,
  "encendido": true,
  "codigoProblema": "000",
  "kilometraje": 12345.6
}
```

## Operation: `GET /acme-ev/status/latest/:vin`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT (`ADMIN`, `BRANCH_USER`) |
| Path param | `vin` |
| Response body | The latest `StatusEvent` document for the VIN |
| Status codes | `200` success · `401` missing or invalid token · `403` out-of-branch · `404` no events |

## Operation: `GET /acme-ev/status/faults`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT (`ADMIN`, `BRANCH_USER`) |
| Query params | none — scope derives from the caller's branch |
| Response body | `{ data: VehicleWithFault[] }` — the latest faulted status per branch vehicle |
| Status codes | `200` success (possibly empty) · `401` missing or invalid token · `403` wrong role |

### Example fault entry

```json
{ "vin": "ACME0000000000007", "eventTimestamp": "2026-06-14T15:31:00.000Z", "codigoProblema": "101" }
```

## Validation and failure behavior

- Invalid query params → `400` from the global `ValidationPipe`.
- A `BRANCH_USER` requesting a VIN outside their branch → `403`.
- `latest/:vin` with no stored events → `404`.
- A caller with no `branchId` calling `faults` → `200` with an empty list, not an error.

## Local notes

- The fault and latest-selection rules behind these responses are detailed in [Domain Context](domain-context.md); the cross-store access patterns are in [Persistence Context](persistence.md).

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md)

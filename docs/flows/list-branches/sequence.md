# List Branches — Sequence

## Happy path

1. An `ADMIN` requests `GET /acme-ev/branches` with pagination/search/sort params; JWT and role checked.
2. `GetBranchesHandler` reads `branches`, joining counts of vehicles and owners per branch.
3. Applies search, sort, and pagination.
4. Responds `200` with `{ data, meta }`.

## Validation flow

Invalid pagination/sort params → `400` from the validation pipe.

## Failure flow

- Non-admin caller → `403` (`RolesGuard`).
- Datastore unavailable → `500`.

## Retry behavior

None; idempotent read.

## Idempotency

Read-only.

## External integration calls

PostgreSQL read only.

## Diagram

```mermaid
sequenceDiagram
    actor Admin
    participant API as Branches Controller
    participant H as GetBranchesHandler
    participant DB as PostgreSQL

    Admin->>API: GET /acme-ev/branches?page&limit&search&sort
    API->>H: GetBranchesQuery
    H->>DB: branches + counts(vehicles, owners)
    DB-->>H: rows
    H-->>Admin: 200 {data, meta}
```

---

[Flow Index](index.md) · [Next: Components](components.md)

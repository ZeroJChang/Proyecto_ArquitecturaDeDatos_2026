# Login — Contracts

The exhaustive HTTP contract is in the generated Swagger at `/docs` (see [`references.md`](../../references.md)). This documents the parts needed to understand the flow.

## `POST /acme-ev/auth/login`

| Field | Description |
|-------|-------------|
| Endpoint | `POST /acme-ev/auth/login` |
| Authentication | None (public — this is where tokens are issued) |
| Headers | `Content-Type: application/json` |
| Request body | `{ email: string, password: string }` (both required) |
| Response body | `{ accessToken: string, user: { id, email, name, role, branchId } }` |
| Status codes | `200` success · `400` invalid body · `401` invalid credentials |
| Rate limits | None today (a login rate limit is recommended at scale) |

### Example request

```json
{
  "email": "admin@acme-ev.com",
  "password": "admin123"
}
```

### Example response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@acme-ev.com",
    "name": "Admin Principal",
    "role": "ADMIN",
    "branchId": null
  }
}
```

### JWT claims

```json
{
  "sub": 1,
  "email": "admin@acme-ev.com",
  "role": "ADMIN",
  "branchId": null,
  "iat": 1718370000,
  "exp": 1718456400
}
```

> The response field is `accessToken`. Subsequent requests send it as `Authorization: Bearer <accessToken>`.

## Versioning

The API is at `1.0.0` (Swagger). Adding claims to the JWT is backward compatible; removing or renaming `accessToken` would be breaking for the frontend.

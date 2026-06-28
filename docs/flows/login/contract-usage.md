# Login — Contract Usage

This flow issues the bearer token for the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, and compatibility policy; this file documents only how the login operation behaves locally.

## Operation: `POST /acme-ev/auth/login`

| Aspect | Detail |
|--------|--------|
| Authentication | None — public; this is where tokens are issued |
| Headers | `Content-Type: application/json` |
| Request body | `{ email: string, password: string }` (both required) |
| Response body | `{ accessToken: string, user: { id, email, name, role, branchId } }` |
| Status codes | `200` success · `400` invalid body · `401` invalid credentials |

### Example request

```json
{ "email": "admin@acme-ev.com", "password": "admin123" }
```

### Example response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "email": "admin@acme-ev.com", "name": "Admin Principal", "role": "ADMIN", "branchId": null }
}
```

### JWT claims

```json
{ "sub": 1, "email": "admin@acme-ev.com", "role": "ADMIN", "branchId": null, "iat": 1718370000, "exp": 1718456400 }
```

## Validation and failure behavior

- Missing or malformed `email`/`password` → `400` from the global `ValidationPipe`.
- Unknown email or wrong password → `401` with the **same** message, so the response never reveals whether the email exists.

## Local notes

- The response field is `accessToken`; subsequent requests send it as `Authorization: Bearer <accessToken>`.
- There is no login rate limit today; the recommended throttle is tracked in [Security](../../security.md#input-validation-and-abuse-protections).

---

[Previous: Components](components.md) · [Flow Index](index.md)

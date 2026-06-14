# API REST — ACME EV Data Platform

## Información General

| Propiedad | Valor |
|-----------|-------|
| Base URL | `/acme-ev` |
| Auth | JWT Bearer Token |
| Swagger UI | `/docs` |
| Content-Type | `application/json` |
| Validación | `class-validator` (whitelist + transform) |

## Flujo de autenticación

```mermaid
sequenceDiagram
    participant Client
    participant API as NestJS API
    participant PG as PostgreSQL

    Client->>API: POST /acme-ev/auth/login<br/>{email, password}
    API->>PG: SELECT user WHERE email
    PG-->>API: User {id, email, password_hash, role, branchId}
    API->>API: bcrypt.compare(password, hash)
    API-->>Client: {token: "JWT...", user: {...}}

    Note over Client,API: Todas las requests autenticadas incluyen:<br/>Authorization: Bearer <token>
```

### JWT Payload (Claims)

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

---

## Endpoints

### Auth

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| POST | `/auth/login` | Público | Autenticación de usuario |

**Request:**
```json
{
  "email": "admin@acme-ev.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@acme-ev.com",
    "name": "Admin Principal",
    "role": "ADMIN",
    "branchId": null
  }
}
```

---

### Users

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/users` | ADMIN | Listar usuarios con paginación |

**Query Params:** `page`, `limit`

---

### Branches

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/branches` | ADMIN | Listar sucursales |

**Query Params:** `page`, `limit`

---

### Vehicles

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/vehicles` | ADMIN, BRANCH_USER | Listar vehículos (filtrado por sucursal automático) |
| GET | `/vehicles/owner` | OWNER | Listar vehículos propios |
| GET | `/vehicles/:vin` | ADMIN, BRANCH_USER | Obtener vehículo por VIN |
| POST | `/vehicles/claim` | OWNER | Registrar (claim) un vehículo por VIN |

**Claim Request:**
```json
{
  "vin": "ACME1000000000001"
}
```

---

### GPS Events

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/gps/events` | OWNER | Consultar eventos GPS con filtros |
| GET | `/gps/events/download` | OWNER | Descargar CSV de eventos GPS |

**Query Params:** `vin`, `startDate`, `endDate`, `page`, `limit`

---

### Status Events

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/status/events` | ADMIN, BRANCH_USER | Consultar eventos de estado |
| GET | `/status/latest/:vin` | ADMIN, BRANCH_USER | Último estado de un vehículo |
| GET | `/status/faults` | ADMIN, BRANCH_USER | Vehículos con fallas activas |

**Query Params (events):** `vin`, `startDate`, `endDate`, `page`, `limit`

---

### Dashboard

| Método | Ruta | Roles | Descripción |
|--------|------|-------|-------------|
| GET | `/dashboard/admin` | ADMIN | Dashboard global (métricas agregadas) |
| GET | `/dashboard/branch` | BRANCH_USER | Dashboard de sucursal |

---

## Control de Acceso por Rol

```mermaid
flowchart TD
    REQ[Request entrante] --> JWT{Token válido?}
    JWT -->|No| DENY[401 Unauthorized]
    JWT -->|Sí| ROLE{Rol del usuario}
    
    ROLE -->|ADMIN| ADMIN_ACCESS["Acceso completo<br/>Dashboard admin, Users, Branches,<br/>All Vehicles, Status events"]
    ROLE -->|BRANCH_USER| BRANCH_ACCESS["Acceso por sucursal<br/>Dashboard branch, Vehicles de sucursal,<br/>Status events, Faults"]
    ROLE -->|OWNER| OWNER_ACCESS["Acceso por propiedad<br/>Dashboard owner, GPS events propios,<br/>CSV download, Claim vehicle"]

    ADMIN_ACCESS --> SCOPE_A["Sin filtro adicional"]
    BRANCH_ACCESS --> SCOPE_B["Filtrado por branchId<br/>del JWT claim"]
    OWNER_ACCESS --> SCOPE_O["Filtrado por userId<br/>vía vehicle_owners"]
```

## Paginación

Todos los endpoints de listado soportan paginación server-side:

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)

**Response wrapper:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 400 | Validación fallida (class-validator) |
| 401 | Token ausente o inválido |
| 403 | Rol insuficiente para el recurso |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

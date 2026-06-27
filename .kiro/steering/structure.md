# Estructura de Código y Convenciones

## Estructura del Proyecto

```
proyecto/
├── .env                  # Variables para todos los servicios (gitignored)
├── .env.template         # Template sin secretos (committed)
├── compose.yml           # Docker Compose local (incluye Postgres + Mongo)
├── compose.prod.yml      # Docker Compose producción (Supabase/Atlas)
├── database/             # Migraciones SQL
├── backend/              # API REST (NestJS 11)
├── client/               # Frontend (React 19 + MUI v9)
├── iot-producer/         # Simulador IoT → Kafka (Node.js)
└── spark/
    └── jobs/
        ├── common/       # config, kafka_reader, parsers, schemas, spark_session
        ├── writers/      # postgres_writer, mongo_writer
        └── pipelines/    # process_gps_stream, process_status_stream
```

## Spark Jobs

### Agregar un nuevo pipeline

1. **Schema** → `common/schemas.py`
2. **Config** → `common/config.py` (topic, checkpoint, destino)
3. **Writer** (si es nuevo destino) → `writers/<destino>_writer.py`
4. **Pipeline** → `pipelines/process_<topic>_stream.py`

### Patrón de un pipeline

```python
import common.config as config
import common.spark_session as spark_session
import common.kafka_reader as kafka_reader
import common.parsers as parsers
import common.schemas as schemas
import writers.<writer> as writer

spark = spark_session.create_session("<app-name>")
raw_df = kafka_reader.read(spark, config.KAFKA_BOOTSTRAP_SERVERS, config.KAFKA_TOPIC_XXX)
parsed_df = parsers.parse_kafka_json(raw_df, schemas.xxx_schema).withColumn(...)

def process_batch(batch_df, batch_id):
    writer.write_batch_to_xxx(batch_df, ...)

query = parsed_df.writeStream.foreachBatch(process_batch) \
    .option("checkpointLocation", config.CHECKPOINT_XXX) \
    .start()
query.awaitTermination()
```

### Patrón de un writer

```python
def write_batch_to_<destino>(batch_df, ...):
    if batch_df.isEmpty():
        return
    # lógica de escritura
```

## IoT Producer (Node.js)

```
iot-producer/src/
├── index.js              # Entry point
├── simulator.js          # Genera eventos y publica a Kafka
├── config/env.js         # Lee process.env (inyectado por Docker)
├── kafka/producer.js     # KafkaJS producer
├── kafka/create-topics.js
├── data/guatemala-zones.js
└── utils/geo.js
```

**No expone HTTP. Solo publica a Kafka.**
En producción se reemplaza por dispositivos IoT reales.

---

## Backend (`backend/src/`)

```
src/
├── main.ts                         # Bootstrap (global prefix, CORS, Swagger, pipes)
├── app.module.ts                   # Root module (TypeORM, Mongoose, CqrsModule)
├── app.controller.ts               # Health check
├── common/
│   ├── constants/                  # Roles enum, pagination defaults
│   ├── decorators/                 # @Roles(), @CurrentUser()
│   ├── dtos/                       # PaginationParamsDto, FilterParamsDto, PaginationResponseDto
│   ├── guards/                     # JwtAuthGuard, RolesGuard
│   └── interfaces/                 # JwtPayload interface
├── config/
│   ├── configuration.ts            # Env-based config loader
│   ├── config.schema.ts            # Joi validation (PORT, NODE_ENV, POSTGRES_URI, MONGO_URI, JWT_SECRET, etc.)
│   ├── config.interface.ts         # Config type definitions
│   └── envs/                       # Per-environment config files
├── auth/
│   ├── auth.module.ts              # JwtModule registration
│   ├── controllers/
│   │   └── auth.controller.ts      # POST /auth/login
│   ├── dtos/                       # LoginRequestDto, LoginResponseDto
│   ├── queries/
│   │   ├── login.query.ts
│   │   └── handlers/login.handler.ts   # bcrypt compare + JWT sign
│   └── strategies/
│       └── jwt.strategy.ts         # PassportStrategy (JWT extraction)
├── users/
│   ├── users.module.ts
│   ├── controllers/users.controller.ts  # GET /users (ADMIN)
│   ├── entities/user.entity.ts     # TypeORM: users table
│   ├── dtos/get-user-response.dto.ts
│   ├── mappers/user.mapper.ts
│   └── queries/                    # get-users.query + handler
├── branches/
│   ├── branches.module.ts
│   ├── controllers/branches.controller.ts  # GET /branches (ADMIN)
│   ├── entities/branch.entity.ts   # TypeORM: branches table
│   ├── dtos/get-branch-response.dto.ts
│   ├── mappers/branch.mapper.ts
│   └── queries/                    # get-branches.query + handler
├── vehicles/
│   ├── vehicles.module.ts
│   ├── controllers/vehicles.controller.ts  # GET /vehicles, /vehicles/owner, /vehicles/:vin, POST /vehicles/claim
│   ├── entities/
│   │   ├── vehicle.entity.ts       # TypeORM: vehicles table
│   │   └── vehicle-owner.entity.ts # TypeORM: vehicle_owners table
│   ├── dtos/                       # GetVehicleResponseDto, GetVehiclesRequestDto, ClaimVehicleRequestDto, ClaimVehicleResponseDto
│   ├── mappers/vehicle.mapper.ts
│   ├── commands/                   # claim-vehicle.command + handler
│   ├── queries/                    # get-vehicles, get-vehicle-by-vin, get-owner-vehicles + handlers
│   └── services/
│       └── demo-vehicle.service.ts # Genera vehículo demo si VIN no existe (claim)
├── gps/
│   ├── gps.module.ts
│   ├── controllers/gps.controller.ts      # GET /gps/events, /gps/events/download (OWNER)
│   ├── entities/gps-event.entity.ts       # TypeORM: gps_events table
│   ├── dtos/                       # GetGpsEventsRequestDto, GetGpsEventsResponseDto, DownloadCsvRequestDto
│   ├── mappers/gps-event.mapper.ts
│   └── queries/                    # get-gps-events, download-gps-csv + handlers
├── dashboard/
│   ├── dashboard.module.ts
│   ├── controllers/dashboard.controller.ts # GET /dashboard/admin, /dashboard/branch
│   ├── dtos/                       # AdminDashboardResponseDto, BranchDashboardResponseDto
│   └── queries/                    # get-admin-dashboard, get-branch-dashboard + handlers
├── status/
│   ├── status.module.ts
│   ├── controllers/status.controller.ts   # GET /status/events, /status/latest/:vin, /status/faults
│   ├── schemas/status-event.schema.ts     # Mongoose: status_events collection
│   ├── dtos/                       # GetStatusEventsRequestDto, GetStatusEventsResponseDto, GetVehiclesWithFaultsResponseDto
│   ├── mappers/status-event.mapper.ts
│   └── queries/                    # get-status-events, get-latest-status, get-vehicles-with-faults + handlers
└── seed/
    ├── seed.module.ts              # Standalone NestJS app for seeding
    ├── seed.service.ts             # Truncates + inserts in order
    ├── seed.ts                     # Entry point (npm run seed)
    └── data/                       # branches.seed, users.seed, vehicles.seed, vehicle-owners.seed
```

### Backend Conventions

- **One class per file** (enforced by ESLint)
- **File names:** kebab-case matching the class name (e.g. `get-gps-events.handler.ts`)
- **Private class properties** prefixed with `_` (e.g. `_httpService`)
- **DTOs** suffixed with `Dto`; **Mappers** suffixed with `Mapper`
- **Queries** are plain classes; **Handlers** implement `IQueryHandler` and are decorated with `@QueryHandler`
- **Commands** are plain classes; **Handlers** implement `ICommandHandler` and are decorated with `@CommandHandler`
- **Mappers** are static utility classes — no DI, no state
- **Imports** are grouped and sorted: built-ins → `@nestjs/*` → other external → internal (alphabetical within each group)
- **Config** is environment-merged: `default` config is always applied, then overridden by the active env
- **Global prefix:** `acme-ev` (todas las rutas bajo `/acme-ev/...`)
- **Swagger:** disponible en `/docs` con `@ApiTags()` por módulo y `@ApiBearerAuth()`
- **Auth:** JWT stateless, claims = `{ sub, email, role, branchId }`
- **Roles:** Decorador `@Roles(Role.ADMIN)` + `RolesGuard` global
- **Data scoping:** BRANCH_USER ve solo vehículos de su sucursal; OWNER ve solo sus vehículos
- **Seed:** `npm run seed` ejecuta un app NestJS standalone que trunca y rellena datos demo
- **CSV download:** Usa `json2csv` con streaming para evitar cargar todo en memoria

---

## Frontend (`client/src/`)

```
src/
├── index.tsx                       # React entry point
├── App.tsx                         # Root: AuthProvider + ThemeProvider + RouterProvider
├── context/
│   └── AuthContext.tsx             # JWT token management, login/logout, user state
├── pages/
│   ├── LoginPage.tsx               # Formulario de login
│   ├── AdminDashboardPage.tsx      # Dashboard administrador (métricas + nav cards + faults table)
│   ├── BranchDashboardPage.tsx     # Dashboard operador de sucursal (vehículos + status + faults)
│   ├── OwnerDashboardPage.tsx      # Dashboard propietario (vehículos + registrar)
│   ├── GpsEventsPage.tsx           # Consulta GPS con filtros + tabla + CSV
│   ├── StatusEventsPage.tsx        # Consulta status con filtros + tabla
│   ├── StatusEventsAdminPage.tsx   # Status events para ADMIN
│   ├── VehiclesAdminPage.tsx       # Listado de vehículos (ADMIN)
│   ├── UsersAdminPage.tsx          # Listado de usuarios (ADMIN)
│   ├── BranchesAdminPage.tsx       # Listado de sucursales (ADMIN)
│   ├── RegisterVehiclePage.tsx     # Claim vehículo por VIN (OWNER)
│   └── NotFoundPage.tsx            # 404
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx           # Email + password, validación client-side
│   │   ├── ProtectedRoute.tsx      # Redirect a /login si no autenticado, filtra por roles
│   │   └── RoleRedirect.tsx        # Redirige a dashboard según rol del usuario
│   ├── common/
│   │   ├── LoadingSpinner.tsx      # MUI CircularProgress
│   │   ├── ErrorAlert.tsx          # MUI Alert
│   │   └── PaginationControls.tsx  # MUI Pagination
│   ├── dashboard/
│   │   ├── MetricCard.tsx          # Card con icono + contador (admin dashboard)
│   │   ├── FaultVehicleTable.tsx   # Tabla de vehículos con fallas
│   │   └── VehicleList.tsx         # Lista seleccionable de vehículos (branch dashboard)
│   ├── gps/
│   │   ├── GpsFilters.tsx          # VIN, startDate, endDate inputs
│   │   ├── GpsEventTable.tsx       # MUI DataGrid con paginación server-side
│   │   └── CsvDownloadButton.tsx   # Trigger descarga CSV
│   ├── status/
│   │   ├── StatusFilters.tsx       # VIN, startDate, endDate inputs
│   │   └── StatusEventTable.tsx    # MUI DataGrid con paginación server-side
│   ├── header/
│   │   └── Header.tsx              # Navegación por rol + logout
│   └── layout/
│       └── AuthenticatedLayout.tsx # Header + Outlet (react-router)
├── hooks/
│   ├── use-auth.hook.ts            # Consumer de AuthContext
│   ├── use-request.hook.ts         # Generic HTTP hook (loading, errors, doRequest, auto-logout on 401)
│   └── interfaces/                 # Hook interface types
├── interfaces/
│   ├── Auth.ts                     # LoginRequest, LoginResponse, AuthUser
│   ├── Branch.ts
│   ├── Dashboard.ts
│   ├── GpsEvent.ts
│   ├── StatusEvent.ts
│   ├── User.ts
│   └── Vehicle.ts
├── routes/
│   └── Routes.tsx                  # createBrowserRouter con rutas protegidas por rol
├── constants/
│   └── urls.ts                     # API_URL + URLS object (todos prefijados /acme-ev)
├── themes/
│   └── dark.theme.ts               # MUI dark theme
└── utils/
    ├── auth-storage.util.ts        # localStorage: getToken, setToken, getUser, setUser, remove*
    └── check-email.util.ts         # Validación de email
```

### Frontend Conventions

- **Components:** PascalCase filenames matching the component name
- **Hooks:** `use-<name>.hook.ts` naming pattern
- **Interfaces:** PascalCase, no `I` prefix
- **One component per file**
- **State:** `useState` + Context (AuthContext); no global state manager externo
- **HTTP calls** go through the `useRequest` hook (maneja loading, errors, 401 auto-logout)
- In production, API calls are prefixed with `/api`; in development they use `REACT_APP_API_URL`
- MUI `sx` prop is preferred for component-level styling over separate CSS files
- **Routing:** Role-based con `ProtectedRoute` (allowedRoles prop) + `RoleRedirect` al index
- **DataGrid:** `@mui/x-data-grid` para tablas con paginación server-side
- **Dockerfile** usa nginx para servir el build en producción (`nginx.conf` incluido)

**No tiene Kafka. API REST pura.**

---

## Migraciones SQL

Archivos en `database/` con naming: `YYYY-MM-DD.<descripcion>.sql`

Migraciones existentes:
- `2026-06-12.create-gps-events-table.sql`
- `2026-06-15.create-branches-table.sql`
- `2026-06-15.create-users-table.sql`
- `2026-06-15.create-vehicles-table.sql`
- `2026-06-15.create-vehicle-owners-table.sql`

## Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos JS/Python | kebab-case | `guatemala-zones.js`, `kafka_reader.py` |
| Variables de entorno | UPPER_SNAKE_CASE | `KAFKA_BROKER` |
| Tópicos Kafka | dot notation | `acme.ev.gps` |
| Tablas PostgreSQL | snake_case plural | `gps_events`, `vehicles`, `vehicle_owners` |
| Colecciones MongoDB | snake_case plural | `status_events` |
| Checkpoints | `<dir>/acme-ev-<topic>` | `/opt/spark/work-dir/checkpoints/acme-ev-gps` |
| TypeORM entities | PascalCase singular | `GpsEvent`, `Vehicle`, `VehicleOwner` |
| Mongoose schemas | PascalCase singular | `StatusEvent` |

## Reglas

- Un solo `.env` en la raíz; los servicios NO tienen su propio `.env` en producción
- Cada pipeline tiene un checkpoint path único
- Writers hacen early return si el batch está vacío
- `PYTHONPATH=/opt/spark/jobs` en todos los contenedores Spark
- `POSTGRES_URI` y `MONGO_URI` soportan swap directo a Supabase/Atlas
- JWT_SECRET y JWT_EXPIRES_IN son requeridos en el backend
- El backend es **read-only** respecto a datos de telemetría (no modifica pipelines Kafka/Spark)
- Seed solo se usa para demo/defensa; no se ejecuta en producción
- TypeORM `synchronize: true` solo en desarrollo; en producción usar migraciones SQL

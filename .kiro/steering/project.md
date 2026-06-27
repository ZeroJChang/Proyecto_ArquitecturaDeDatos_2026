# ACME EV Data Platform

Plataforma de procesamiento de datos en tiempo real para vehículos eléctricos.

## Stack

- **IoT Producer** (`iot-producer/`): Node.js — simula telemetría de EVs y publica a Kafka (reemplaza dispositivos IoT reales)
- **Backend** (`backend/`): NestJS 11 — API REST (CQRS, TypeORM + Mongoose); autenticación JWT con roles (ADMIN, BRANCH_USER, OWNER)
- **Frontend** (`client/`): React 19 + MUI v9 — SPA con dashboards por rol, consulta de telemetría GPS/status, descarga CSV
- **Mensajería**: Apache Kafka (KRaft, single broker, 3 particiones por tópico)
- **Procesamiento**: Apache Spark 3.5.1 Structured Streaming (1 master + 2 workers)
- **Almacenamiento**: PostgreSQL (entidades relacionales + GPS events), MongoDB (status events)
- **Infraestructura**: Docker Compose (red `proyecto`)

## Tópicos Kafka

| Tópico | Descripción | Destino |
|--------|-------------|---------|
| `acme.ev.gps` | Telemetría GPS | PostgreSQL (`gps_events`) |
| `acme.ev.status` | Estado operacional | MongoDB (`status_events`) |

## Pipelines Spark

| Pipeline | Source | Sink | Conector |
|----------|--------|------|----------|
| `process_gps_stream.py` | `acme.ev.gps` | PostgreSQL | JDBC + postgresql:42.7.3 |
| `process_status_stream.py` | `acme.ev.status` | MongoDB | mongo-spark-connector_2.12:10.4.0 |

## Comandos spark-submit

GPS → PostgreSQL:
```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --conf spark.driver.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --conf spark.executor.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.7.3 \
  /opt/spark/jobs/pipelines/process_gps_stream.py
```

Status → MongoDB:
```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.mongodb.spark:mongo-spark-connector_2.12:10.4.0 \
  /opt/spark/jobs/pipelines/process_status_stream.py
```

## Docker Compose

Hay dos archivos compose:

- `compose.yml` — entorno local completo (incluye PostgreSQL y MongoDB como contenedores)
- `compose.prod.yml` — producción (sin PostgreSQL/MongoDB locales; usa Supabase/Atlas remotos)

## Autenticación y Roles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `ADMIN` | Administrador global | Dashboard admin, listado de usuarios, sucursales, todos los vehículos |
| `BRANCH_USER` | Operador de sucursal | Dashboard de sucursal, vehículos de su sucursal, status events, faults |
| `OWNER` | Propietario de vehículo | Dashboard owner, GPS events de sus vehículos, descarga CSV, registrar vehículo por VIN |

## API Endpoints (prefijo: `/acme-ev`)

| Módulo | Endpoint | Método | Roles |
|--------|----------|--------|-------|
| Auth | `/auth/login` | POST | Público |
| Users | `/users` | GET | ADMIN |
| Branches | `/branches` | GET | ADMIN |
| Vehicles | `/vehicles` | GET | ADMIN, BRANCH_USER |
| Vehicles | `/vehicles/owner` | GET | OWNER |
| Vehicles | `/vehicles/claim` | POST | OWNER |
| Vehicles | `/vehicles/:vin` | GET | ADMIN, BRANCH_USER |
| GPS | `/gps/events` | GET | OWNER |
| GPS | `/gps/events/download` | GET | OWNER |
| Status | `/status/events` | GET | ADMIN, BRANCH_USER |
| Status | `/status/latest/:vin` | GET | ADMIN, BRANCH_USER |
| Status | `/status/faults` | GET | ADMIN, BRANCH_USER |
| Dashboard | `/dashboard/admin` | GET | ADMIN |
| Dashboard | `/dashboard/branch` | GET | BRANCH_USER |

## Estado Actual

- [x] IoT Producer publica a Kafka (`acme.ev.gps`, `acme.ev.status`)
- [x] Kafka operativo (KRaft, Docker)
- [x] Spark Cluster operativo (1 master + 2 workers)
- [x] Pipeline GPS → PostgreSQL
- [x] Pipeline Status → MongoDB
- [x] MongoDB local (Docker)
- [x] Backend: AuthModule (JWT + bcrypt + roles)
- [x] Backend: UsersModule (listado ADMIN)
- [x] Backend: BranchesModule (listado ADMIN)
- [x] Backend: VehiclesModule (ADMIN/BRANCH_USER/OWNER + claim)
- [x] Backend: GpsModule (eventos + descarga CSV, OWNER)
- [x] Backend: StatusModule (eventos + latest + faults, ADMIN/BRANCH_USER)
- [x] Backend: DashboardModule (admin + branch endpoints)
- [x] Backend: Seed script (demo data para defensa)
- [x] Backend: Migraciones SQL (database/)
- [x] Frontend: Login + AuthContext + ProtectedRoute
- [x] Frontend: Admin Dashboard page (métricas + faults table + nav cards)
- [x] Frontend: Branch Dashboard page (vehículos + status latest + faults)
- [x] Frontend: Owner Dashboard page (vehículos propios + registrar vehículo)
- [x] Frontend: GPS Events page (filtros + tabla + CSV download)
- [x] Frontend: Status Events page (filtros + tabla)
- [x] Frontend: Admin pages (vehicles, users, branches, status events)
- [x] Frontend: Register Vehicle page (claim por VIN, OWNER)
- [x] Frontend: Routing por roles
- [ ] Migrar PostgreSQL → Supabase
- [ ] Migrar MongoDB → Atlas
- [ ] Power BI conectado

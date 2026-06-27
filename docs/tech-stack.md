# Tech Stack & Configuración

## Versiones

| Componente | Versión/Imagen |
|-----------|----------------|
| Node.js | 22.12.0-alpine3.21 |
| Apache Spark | 3.5.1 |
| Scala (Spark) | 2.12 |
| PostgreSQL | 16.2 |
| MongoDB | 7 |
| Kafka | apache/kafka:latest  |
| spark-sql-kafka | `org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1` |
| PostgreSQL JDBC | `org.postgresql:postgresql:42.7.3` |
| Mongo Spark Connector | `org.mongodb.spark:mongo-spark-connector_2.12:10.4.0` |

## Variables de Entorno (single root `.env`)

Todas las variables se definen en el `.env` raíz. Docker Compose las inyecta a cada servicio.

| Prefijo / Variable | Servicio |
|---------|----------|
| `POSTGRES_*` | PostgreSQL / Supabase |
| `MONGO_*` | MongoDB / Atlas |
| `KAFKA_*` | Broker y tópicos |
| `SIMULATION_*`, `TOTAL_*` | IoT Producer |
| `BACKEND_PORT` | API REST |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Backend auth |
| `WEB_APP_URL` | Backend CORS origin |
| `SPARK_*` | Spark cluster |

Campos `POSTGRES_URI` y `MONGO_URI` permiten swap directo a Supabase/Atlas sin cambiar código.

## Red Docker

- Red: `proyecto` (bridge)
- Entre contenedores: usar nombre del servicio (`broker:29092`, `postgres:5432`, `mongo:27017`)
- Desde host: `localhost:<port>`

## Volumes

| Host | Contenedor | Servicio |
|------|-----------|---------|
| `./spark/jobs` | `/opt/spark/jobs` | spark-master, spark-workers |
| `./spark-data` | `/opt/spark/work-dir` | spark-master, spark-workers |
| `./postgres` | `/var/lib/postgresql/data` | postgres |
| `./mongo` | `/data/db` | mongo |

## Servicios Docker Compose

| Servicio | Puerto expuesto | Descripción |
|----------|----------------|-------------|
| postgres | 5432 | Base de datos relacional |
| mongo | 27017 | Base de datos documental |
| broker | 9092 | Kafka  |
| iot-producer | — | Simulador IoT → Kafka |
| backend-service | 3000 | API REST (NestJS) |
| spark-master | 8080, 7077, 4040 | Spark Master |
| spark-worker-1 | — | Spark Worker |
| spark-worker-2 | — | Spark Worker |

Nota: `compose.prod.yml` omite `postgres` y `mongo` (usa Supabase/Atlas remotos).

## Backend

- **Runtime:** Node.js
- **Language:** TypeScript 5.7
- **Framework:** NestJS 11
- **Architecture:** CQRS via `@nestjs/cqrs` (queries para lectura + commands para escritura limitada)
- **ORM (PostgreSQL):** TypeORM (`@nestjs/typeorm`, `typeorm`, `pg`)
- **ODM (MongoDB):** Mongoose (`@nestjs/mongoose`, `mongoose`)
- **Auth:** `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` + `bcrypt`
- **Validation:** `class-validator` + `class-transformer`
- **Config:** `@nestjs/config` with Joi schema validation
- **API Docs:** `@nestjs/swagger` (Swagger/OpenAPI at `/docs`) con `@ApiBearerAuth()`
- **CSV Export:** `json2csv`
- **Global Prefix:** `acme-ev`
- **Testing:** Jest + `ts-jest` + `jest-mock-extended`
- **Linting:** ESLint (flat config) + Prettier
- **Package manager:** npm
- **Seed:** `npm run seed` (standalone NestJS app con `ts-node`)

## Frontend

- **Language:** TypeScript 4.4
- **Framework:** React 19 + React Router 7 (`react-router-dom ^7.15.1`)
- **UI Library:** MUI (Material-UI) v9 with Emotion
- **Data Tables:** `@mui/x-data-grid` (paginación server-side)
- **Icons:** `@mui/icons-material`
- **HTTP Client:** Axios (via `useRequest` hook)
- **Auth:** Context API (AuthContext) + localStorage para JWT token
- **Build tool:** Create React App (`react-scripts` 5)
- **Testing:** Jest + React Testing Library (`@testing-library/react ^16`)
- **Deployment:** nginx (Dockerfile + `nginx.conf`)
- **Package manager:** yarn

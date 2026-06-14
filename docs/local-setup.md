# Local Setup — ACME EV Data Platform

## Prerrequisitos

| Herramienta | Versión mínima | Verificar instalación |
|-------------|---------------|----------------------|
| Docker | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Node.js | 22.x | `node --version` |
| npm | 10.x | `npm --version` |
| yarn | 1.22+ | `yarn --version` |

## 1. Clonar y configurar variables de entorno

```bash
git clone <repo-url>
cd proyecto

# Copiar template y completar valores
cp .env.template .env
```

### Variables requeridas en `.env`

```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=acme
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_URI=postgresql://postgres:tu_password@postgres:5432/acme

# MongoDB
MONGO_USER=mongodb
MONGO_PASSWORD=tu_password
MONGO_DB=acme
MONGO_HOST=mongo
MONGO_PORT=27017
MONGO_URI=mongodb://mongodb:tu_password@mongo:27017

# Kafka
KAFKA_BROKER=broker:29092
KAFKA_TOPIC_GPS=acme.ev.gps
KAFKA_TOPIC_STATUS=acme.ev.status

# IoT Simulator
SIMULATION_INTERVAL_MS=10000
TOTAL_VEHICLES=20

# Backend
BACKEND_PORT=3000
JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=24h
WEB_APP_URL=http://localhost:3000

# Spark
SPARK_CHECKPOINT_DIR=/opt/spark/work-dir/checkpoints
```

## 2. Levantar servicios con Docker Compose

### Entorno local completo (incluye PostgreSQL + MongoDB)

```bash
docker compose up -d
```

### Entorno producción (usa Supabase + Atlas remotos)

```bash
docker compose -f compose.prod.yml up -d
```

### Verificar que todos los servicios están corriendo

```bash
docker compose ps
```

## 3. Ejecutar migraciones SQL

Las migraciones se encuentran en `database/` y deben ejecutarse en orden:

```bash
# Conectar al contenedor de PostgreSQL
docker exec -it postgres-database psql -U postgres -d acme

# Ejecutar migraciones en orden
\i /path/to/database/2026-06-15.create-branches-table.sql
\i /path/to/database/2026-06-15.create-users-table.sql
\i /path/to/database/2026-06-15.create-vehicles-table.sql
\i /path/to/database/2026-06-15.create-vehicle-owners-table.sql
\i /path/to/database/2026-06-12.create-gps-events-table.sql
```

O bien, copiar y ejecutar directamente:

```bash
# Desde el host
cat database/2026-06-15.create-branches-table.sql | docker exec -i postgres-database psql -U postgres -d acme
cat database/2026-06-15.create-users-table.sql | docker exec -i postgres-database psql -U postgres -d acme
cat database/2026-06-15.create-vehicles-table.sql | docker exec -i postgres-database psql -U postgres -d acme
cat database/2026-06-15.create-vehicle-owners-table.sql | docker exec -i postgres-database psql -U postgres -d acme
cat database/2026-06-12.create-gps-events-table.sql | docker exec -i postgres-database psql -U postgres -d acme
```

> **Nota:** En desarrollo con `synchronize: true`, TypeORM crea las tablas automáticamente. Las migraciones son necesarias para producción.

## 4. Seed de datos demo

```bash
cd backend
npm install
npm run seed
```

Esto crea:

- 3 sucursales (Guatemala City, Quetzaltenango, Escuintla)
- 6 usuarios (1 admin, 3 operadores, 2 propietarios)
- 10 vehículos distribuidos entre sucursales
- 4 asignaciones vehículo-propietario

### Credenciales de prueba

| Email | Password | Rol |
|-------|----------|-----|
| `admin@acme-ev.com` | `admin123` | ADMIN |
| `branch1@acme-ev.com` | `branch123` | BRANCH_USER |
| `branch2@acme-ev.com` | `branch123` | BRANCH_USER |
| `branch3@acme-ev.com` | `branch123` | BRANCH_USER |
| `owner1@acme-ev.com` | `owner123` | OWNER |
| `owner2@acme-ev.com` | `owner123` | OWNER |

## 5. Desarrollo local del Backend

```bash
cd backend
npm install
npm run start:dev
```

- API disponible en: `http://localhost:3000/acme-ev`
- Swagger docs: `http://localhost:3000/docs`

## 6. Desarrollo local del Frontend

```bash
cd client
yarn install
yarn start
```

- App disponible en: `http://localhost:3001` (o puerto configurado por CRA)
- Requiere `REACT_APP_API_URL=http://localhost:3000` en `client/.env`

---

## Comandos Kafka

### Listar tópicos del cluster

```bash
docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 \
  --list
```

### Describir un tópico específico

```bash
docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 \
  --describe \
  --topic acme.ev.gps
```

### Consumir mensajes desde un tópico (debug)

```bash
# GPS events
docker exec -it broker /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server broker:9092 \
  --topic acme.ev.gps \
  --from-beginning \
  --max-messages 5

# Status events
docker exec -it broker /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server broker:9092 \
  --topic acme.ev.status \
  --from-beginning \
  --max-messages 5
```

### Crear tópicos manualmente (si es necesario)

```bash
docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 \
  --create \
  --topic acme.ev.gps \
  --partitions 3 \
  --replication-factor 1

docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 \
  --create \
  --topic acme.ev.status \
  --partitions 3 \
  --replication-factor 1
```

### Ver offsets de un consumer group

```bash
docker exec -it broker /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server broker:9092 \
  --list

docker exec -it broker /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server broker:9092 \
  --describe \
  --group <group-id>
```

### Eliminar un tópico

```bash
docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 \
  --delete \
  --topic <topic-name>
```

---

## Comandos Spark

### Spark UI

- **Master UI:** <http://localhost:8080>
- **Spark Jobs UI:** <http://localhost:4040> (disponible cuando hay un job ejecutándose)

### Ejecutar pipeline GPS → PostgreSQL

```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --conf spark.driver.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --conf spark.executor.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.7.3 \
  /opt/spark/jobs/pipelines/process_gps_stream.py
```

### Ejecutar pipeline Status → MongoDB

```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.mongodb.spark:mongo-spark-connector_2.12:10.4.0 \
  /opt/spark/jobs/pipelines/process_status_stream.py
```

### Verificar workers registrados

```bash
docker exec -it spark-master /opt/spark/bin/spark-class \
  org.apache.spark.deploy.Client \
  --master spark://spark-master:7077 \
  --list
```

### Ver logs de un pipeline en ejecución

```bash
# Logs del Spark Master
docker logs spark-master -f

# Logs de un worker específico
docker logs spark-worker-1 -f
docker logs spark-worker-2 -f
```

### Limpiar checkpoints (reiniciar procesamiento desde cero)

```bash
# Eliminar checkpoint de GPS
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-gps

# Eliminar checkpoint de Status
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-status

# Eliminar todos los checkpoints
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/
```

### Spark Shell (para debug interactivo)

```bash
docker exec -it spark-master /opt/spark/bin/pyspark \
  --master spark://spark-master:7077 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1
```

---

## Comandos de Base de Datos

### PostgreSQL — Conectar

```bash
docker exec -it postgres-database psql -U postgres -d acme
```

### PostgreSQL — Consultas útiles

```sql
-- Ver tablas creadas
\dt

-- Contar GPS events procesados
SELECT COUNT(*) FROM gps_events;

-- Ver últimos 10 GPS events
SELECT * FROM gps_events ORDER BY event_timestamp DESC LIMIT 10;

-- Ver vehículos por sucursal
SELECT b.name, COUNT(v.id) as total_vehicles
FROM vehicles v JOIN branches b ON v.branch_id = b.id
GROUP BY b.name;
```

### MongoDB — Conectar

```bash
docker exec -it mongo mongosh -u mongodb -p tu_password --authenticationDatabase admin acme
```

### MongoDB — Consultas útiles

```javascript
// Contar status events
db.status_events.countDocuments()

// Ver últimos 5 status events
db.status_events.find().sort({event_timestamp: -1}).limit(5)

// Vehículos con fallas activas
db.status_events.find({codigo_problema: {$ne: "000"}}).sort({event_timestamp: -1}).limit(10)
```

---

## Troubleshooting

### El IoT Producer no conecta a Kafka

```bash
# Verificar que Kafka está listo
docker logs broker | tail -20

# Verificar conectividad
docker exec -it iot-producer sh -c "nc -zv broker 29092"
```

### Spark no puede conectar a PostgreSQL/MongoDB

```bash
# Verificar que las bases están accesibles desde la red Docker
docker exec -it spark-master sh -c "nc -zv postgres 5432"
docker exec -it spark-master sh -c "nc -zv mongo 27017"
```

### Error de checkpoints corruptos

```bash
# Eliminar y reiniciar el pipeline
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-gps
# Volver a ejecutar el spark-submit correspondiente
```

### Backend no arranca

```bash
# Verificar variables de entorno
docker logs acme-ev-backend

# Verificar conexión a PostgreSQL
docker exec -it acme-ev-backend sh -c "nc -zv postgres 5432"
```

---

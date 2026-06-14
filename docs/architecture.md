# Arquitectura — ACME EV Data Platform

## Diagrama de Contexto (C4 — Nivel 1)

```mermaid
C4Context
    title Sistema ACME EV — Diagrama de Contexto

    Person(admin, "Administrador", "Gestiona la flota completa, usuarios y sucursales")
    Person(branch_user, "Operador de Sucursal", "Monitorea vehículos de su sucursal")
    Person(owner, "Propietario", "Consulta telemetría de sus vehículos")

    System(acme_platform, "ACME EV Data Platform", "Plataforma de procesamiento de datos en tiempo real para vehículos eléctricos")

    System_Ext(iot_devices, "Dispositivos IoT (Simulador)", "Genera telemetría GPS y estado operacional de vehículos eléctricos")
    System_Ext(supabase, "Supabase (PostgreSQL)", "Base de datos relacional gestionada en la nube")
    System_Ext(atlas, "MongoDB Atlas", "Base de datos documental gestionada en la nube")

    Rel(iot_devices, acme_platform, "Publica eventos", "Kafka")
    Rel(admin, acme_platform, "Consulta dashboard, gestiona usuarios", "HTTPS")
    Rel(branch_user, acme_platform, "Monitorea vehículos de sucursal", "HTTPS")
    Rel(owner, acme_platform, "Consulta GPS y estado de sus vehículos", "HTTPS")
    Rel(acme_platform, supabase, "Almacena datos relacionales y GPS", "PostgreSQL Wire Protocol")
    Rel(acme_platform, atlas, "Almacena eventos de estado", "MongoDB Wire Protocol")
```

## Diagrama de Contenedores (C4 — Nivel 2)

```mermaid
C4Container
    title ACME EV Data Platform — Diagrama de Contenedores

    Person(user, "Usuario", "Admin / Operador / Propietario")

    Container_Boundary(platform, "ACME EV Data Platform") {
        Container(client, "Frontend SPA", "React 19 + MUI v9", "Dashboards, consulta de telemetría, descarga CSV")
        Container(backend, "Backend API", "NestJS 11, TypeScript", "API REST con CQRS, Auth JWT, Swagger")
        Container(iot_producer, "IoT Producer", "Node.js 22", "Simula telemetría de EVs, publica a Kafka")
        ContainerQueue(kafka, "Apache Kafka", "KRaft Mode", "Broker de mensajería con tópicos GPS y Status")
        Container(spark, "Spark Cluster", "Apache Spark 3.5.1", "Structured Streaming: procesa streams en micro-batches")
        ContainerDb(postgres, "PostgreSQL 16.2", "Relacional", "Branches, Users, Vehicles, GPS Events")
        ContainerDb(mongo, "MongoDB 7", "Documental", "Status Events")
    }

    Rel(user, client, "Interactúa", "HTTPS")
    Rel(client, backend, "Consume API", "HTTP/REST")
    Rel(backend, postgres, "Lee datos", "TypeORM")
    Rel(backend, mongo, "Lee datos", "Mongoose")
    Rel(iot_producer, kafka, "Publica mensajes", "KafkaJS")
    Rel(kafka, spark, "Consume streams", "Spark Kafka Connector")
    Rel(spark, postgres, "Escribe GPS events", "JDBC")
    Rel(spark, mongo, "Escribe Status events", "Mongo Spark Connector")
```

## Diagrama de Componentes — Backend (C4 — Nivel 3)

```mermaid
C4Component
    title Backend API — Componentes

    Container_Boundary(backend, "Backend NestJS") {
        Component(auth, "AuthModule", "JWT + Passport", "Login, token generation, validation")
        Component(users, "UsersModule", "TypeORM", "CRUD de usuarios (ADMIN)")
        Component(branches, "BranchesModule", "TypeORM", "Listado de sucursales (ADMIN)")
        Component(vehicles, "VehiclesModule", "TypeORM", "Gestión de vehículos, claim por VIN")
        Component(gps, "GpsModule", "TypeORM", "Consulta GPS events, descarga CSV")
        Component(status, "StatusModule", "Mongoose", "Consulta status events, fallas")
        Component(dashboard, "DashboardModule", "TypeORM + Mongoose", "Métricas agregadas por rol")
        Component(config, "ConfigModule", "@nestjs/config + Joi", "Variables de entorno validadas")
    }

    ContainerDb(pg, "PostgreSQL", "", "")
    ContainerDb(mg, "MongoDB", "", "")

    Rel(auth, pg, "Valida credenciales")
    Rel(users, pg, "Lee usuarios")
    Rel(branches, pg, "Lee sucursales")
    Rel(vehicles, pg, "Lee/escribe vehículos")
    Rel(gps, pg, "Lee GPS events")
    Rel(status, mg, "Lee status events")
    Rel(dashboard, pg, "Métricas SQL")
    Rel(dashboard, mg, "Métricas NoSQL")
```

## Flujo de Datos — Telemetría en Tiempo Real

```mermaid
flowchart LR
    subgraph IoT["IoT Producer"]
        SIM[Simulador de Vehículos]
    end

    subgraph Kafka["Apache Kafka (KRaft)"]
        GPS_T[acme.ev.gps<br/>3 particiones]
        STATUS_T[acme.ev.status<br/>3 particiones]
    end

    subgraph Spark["Spark Cluster"]
        GPS_P[GPS Pipeline<br/>process_gps_stream.py]
        STATUS_P[Status Pipeline<br/>process_status_stream.py]
    end

    subgraph Storage["Almacenamiento"]
        PG[(PostgreSQL<br/>gps_events)]
        MG[(MongoDB<br/>status_events)]
    end

    subgraph API["Backend NestJS"]
        REST[API REST<br/>/acme-ev/*]
    end

    subgraph UI["Frontend React"]
        DASH[Dashboards + Tablas]
    end

    SIM -->|JSON| GPS_T
    SIM -->|JSON| STATUS_T
    GPS_T -->|Structured Streaming| GPS_P
    STATUS_T -->|Structured Streaming| STATUS_P
    GPS_P -->|JDBC append| PG
    STATUS_P -->|Mongo Connector| MG
    PG -->|TypeORM| REST
    MG -->|Mongoose| REST
    REST -->|HTTP JSON| DASH
```

## Flujo de Datos Detallado — Pipeline GPS

```mermaid
sequenceDiagram
    participant IoT as IoT Producer
    participant K as Kafka (acme.ev.gps)
    participant S as Spark GPS Pipeline
    participant PG as PostgreSQL

    loop Cada 10 segundos
        IoT->>IoT: Actualiza posición de N vehículos
        IoT->>K: publish({id_vehiculo, vin, timestamp,<br/>tipo_trama, zona_referencia,<br/>departamento, telemetria:{lat, lng}})
    end

    S->>K: readStream (startingOffsets: latest)
    
    loop foreachBatch
        K-->>S: Micro-batch de mensajes
        S->>S: parse JSON → schema GPS
        S->>S: Extrae latitude, longitude
        S->>S: Agrega processed_at timestamp
        S->>PG: JDBC write (append) → gps_events
    end
```

## Flujo de Datos Detallado — Pipeline Status

```mermaid
sequenceDiagram
    participant IoT as IoT Producer
    participant K as Kafka (acme.ev.status)
    participant S as Spark Status Pipeline
    participant MG as MongoDB

    loop Cada 10 segundos
        IoT->>IoT: Actualiza batería, estado, fallas
        IoT->>K: publish({id_vehiculo, vin, timestamp,<br/>tipo_trama, zona_referencia,<br/>departamento, telemetria:{bateria,<br/>encendido, codigo_problema, km}})
    end

    S->>K: readStream (startingOffsets: latest)
    
    loop foreachBatch
        K-->>S: Micro-batch de mensajes
        S->>S: parse JSON → schema Status
        S->>S: Extrae campos de telemetría
        S->>S: Agrega processed_at timestamp
        S->>MG: Mongo Spark Connector write → status_events
    end
```

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (React)
    participant BE as Backend (NestJS)
    participant DB as PostgreSQL

    U->>FE: Ingresa email + password
    FE->>BE: POST /acme-ev/auth/login
    BE->>DB: SELECT user WHERE email = ?
    DB-->>BE: User record (hashed password)
    BE->>BE: bcrypt.compare(password, hash)
    alt Credenciales válidas
        BE->>BE: JWT.sign({sub, email, role, branchId})
        BE-->>FE: 200 {token, user}
        FE->>FE: localStorage.setToken(token)
        FE->>FE: Redirect según rol
    else Credenciales inválidas
        BE-->>FE: 401 Unauthorized
    end

    Note over FE,BE: Requests subsiguientes
    FE->>BE: GET /acme-ev/... (Authorization: Bearer token)
    BE->>BE: JwtStrategy.validate(token)
    BE->>BE: RolesGuard.canActivate(role)
    BE-->>FE: 200 Data / 403 Forbidden
```

## Modelo de Base de Datos — PostgreSQL

```mermaid
erDiagram
    BRANCHES {
        serial id PK
        varchar name
        varchar country
        varchar region
        boolean is_active
        timestamp created_at
    }

    USERS {
        serial id PK
        varchar email UK
        varchar password
        varchar name
        varchar role "ADMIN | BRANCH_USER | OWNER"
        integer branch_id FK
        timestamp created_at
    }

    VEHICLES {
        serial id PK
        varchar vin UK
        varchar id_vehiculo
        varchar model
        integer year
        integer branch_id FK
        timestamp created_at
    }

    VEHICLE_OWNERS {
        serial id PK
        integer user_id FK
        integer vehicle_id FK
        timestamp assigned_at
    }

    GPS_EVENTS {
        serial id PK
        varchar id_vehiculo
        varchar vin
        timestamp event_timestamp
        varchar tipo_trama
        varchar zona_referencia
        varchar departamento
        double latitude
        double longitude
        timestamp processed_at
    }

    BRANCHES ||--o{ USERS : "emplea"
    BRANCHES ||--o{ VEHICLES : "tiene asignados"
    USERS ||--o{ VEHICLE_OWNERS : "posee"
    VEHICLES ||--o{ VEHICLE_OWNERS : "pertenece a"
    VEHICLES ||--o{ GPS_EVENTS : "genera (por VIN)"
```

## Modelo de Base de Datos — MongoDB

```mermaid
erDiagram
    STATUS_EVENTS {
        ObjectId _id PK
        string id_vehiculo
        string vin
        date event_timestamp
        string tipo_trama
        string zona_referencia
        string departamento
        double bateria
        boolean encendido
        string codigo_problema
        double kilometraje
        date processed_at
    }
```

## Infraestructura Docker

```mermaid
graph TB
    subgraph Network["Red Docker: proyecto (bridge)"]
        subgraph Data["Capa de Datos"]
            PG[postgres:5432]
            MG[mongo:27017]
        end

        subgraph Messaging["Capa de Mensajería"]
            BK[broker:9092/29092]
        end

        subgraph Processing["Capa de Procesamiento"]
            SM[spark-master:7077/8080]
            SW1[spark-worker-1]
            SW2[spark-worker-2]
        end

        subgraph Application["Capa de Aplicación"]
            BE[backend-service:3000]
            IOT[iot-producer]
        end

        subgraph Presentation["Capa de Presentación"]
            CL[client:80]
        end
    end

    IOT -->|produce| BK
    BK -->|consume| SM
    SM --> SW1
    SM --> SW2
    SW1 -->|JDBC| PG
    SW2 -->|Mongo Connector| MG
    BE -->|TypeORM| PG
    BE -->|Mongoose| MG
    CL -->|/api proxy| BE
```

## Diagrama de Despliegue — Producción

```mermaid
flowchart TB
    subgraph Cloud["Servicios Cloud"]
        SUP[Supabase<br/>PostgreSQL gestionado]
        ATL[MongoDB Atlas<br/>Cluster gestionado]
    end

    subgraph Docker["Docker Compose (compose.prod.yml)"]
        BK[Kafka Broker]
        IOT[IoT Producer]
        SM[Spark Master]
        SW1[Spark Worker 1]
        SW2[Spark Worker 2]
        BE[Backend Service]
        CL[Client - nginx:80]
    end

    IOT --> BK
    BK --> SM
    SM --> SW1
    SM --> SW2
    SW1 -->|JDBC| SUP
    SW2 -->|Mongo Connector| ATL
    BE -->|POSTGRES_URI| SUP
    BE -->|MONGO_URI| ATL
    CL -->|/api proxy| BE
```

## Resumen de Servicios

| Servicio | Imagen/Build | Puerto Expuesto | Función |
|----------|-------------|-----------------|---------|
| `postgres` | `postgres:16.2` | 5432 | Base de datos relacional (solo local) |
| `mongo` | `mongo:7` | 27017 | Base de datos documental (solo local) |
| `broker` | `apache/kafka:latest` | 9092 | Message broker (KRaft, sin ZooKeeper) |
| `iot-producer` | Build `./iot-producer` | — | Simulador de telemetría IoT |
| `backend-service` | Build `./backend` | 3000 | API REST NestJS |
| `client` | Build `./client` | 80 (prod) / 3000 (local) | SPA React + nginx |
| `spark-master` | `apache/spark:3.5.1` | 8080, 7077, 4040 | Spark Master node |
| `spark-worker-1` | `apache/spark:3.5.1` | — | Spark Worker (1 core, 1GB) |
| `spark-worker-2` | `apache/spark:3.5.1` | — | Spark Worker (1 core, 1GB) |

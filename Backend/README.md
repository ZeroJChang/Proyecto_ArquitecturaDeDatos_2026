# ACME EV Backend Simulator

Backend en Node.js para simular datos de vehículos eléctricos de ACME EV.

## Funcionalidades

- Simula 20 vehículos eléctricos.
- Genera datos GPS y datos de estado cada 10 segundos.
- Mantiene correlación geográfica: un vehículo se mueve cerca de su zona asignada y no salta de Villa Nueva a Petén en pocos minutos.
- Expone APIs REST para consultar ubicación y estado.
- Incluye publisher de Kafka preparado, pero desactivado por defecto.

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

```env
PORT=3000
SIMULATION_INTERVAL_MS=10000
KAFKA_ENABLED=false
KAFKA_BROKER=localhost:9092
KAFKA_TOPIC_GPS=acme.ev.gps
KAFKA_TOPIC_STATUS=acme.ev.status
```

## Endpoints

### Health check

```http
GET /api/health
```

### Listar vehículos actuales

```http
GET /api/vehicles
```

### Última ubicación GPS de todos los vehículos

```http
GET /api/vehicles/gps/latest
```

### Último estado de todos los vehículos

```http
GET /api/vehicles/status/latest
```

### Historial GPS general

```http
GET /api/vehicles/gps/history?limit=100
```

### Historial de estados general

```http
GET /api/vehicles/status/history?limit=100
```

### Historial GPS por vehículo

```http
GET /api/vehicles/EV-ACME-10001/gps?limit=20
```

### Historial de estado por vehículo

```http
GET /api/vehicles/EV-ACME-10001/status?limit=20
```

## Kafka

Kafka está preparado pero desactivado por defecto.

Cuando ya tengas Kafka configurado, cambia:

```env
KAFKA_ENABLED=true
KAFKA_BROKER=localhost:9092
```

El backend publicará eventos en:

- `acme.ev.gps`
- `acme.ev.status`

## Estructura de eventos GPS

```json
{
  "id_vehiculo": "EV-ACME-10001",
  "vin": "VINACMEEV0010001",
  "timestamp": "2026-06-01T18:00:00.000Z",
  "tipo_trama": "GPS",
  "zona_referencia": "Villa Nueva",
  "departamento": "Guatemala",
  "telemetria": {
    "latitud": 14.5251,
    "longitud": -90.5875
  }
}
```

## Estructura de eventos de estado

```json
{
  "id_vehiculo": "EV-ACME-10001",
  "vin": "VINACMEEV0010001",
  "timestamp": "2026-06-01T18:00:00.000Z",
  "tipo_trama": "ESTADO",
  "zona_referencia": "Villa Nueva",
  "departamento": "Guatemala",
  "telemetria": {
    "estado_bateria_porcentaje": 78.5,
    "encendido": true,
    "codigo_problema": "000",
    "kilometraje": 12450.3
  }
}
```

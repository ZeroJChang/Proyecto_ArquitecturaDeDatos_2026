CREATE TABLE gps_events (
  id SERIAL PRIMARY KEY,
  id_vehiculo VARCHAR(50),
  vin VARCHAR(50),
  event_timestamp TIMESTAMP,
  tipo_trama VARCHAR(20),
  zona_referencia VARCHAR(100),
  departamento VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  processed_at TIMESTAMP
);
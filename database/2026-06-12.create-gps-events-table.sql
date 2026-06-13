CREATE TABLE gps_events (
  id SERIAL PRIMARY KEY,
  vin VARCHAR(50),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timestamp VARCHAR(100),
  processed_at TIMESTAMP
);
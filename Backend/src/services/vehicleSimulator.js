import { env } from '../config/env.js';
import { guatemalaZones } from '../data/guatemalaZones.js';
import { distanceKm, generatePointNear, movePoint, randomBetween, randomInt } from '../utils/geo.js';
import { publishKafkaMessage } from '../kafka/kafkaPublisher.js';

const vehicles = new Map();
const gpsHistory = [];
const statusHistory = [];
let intervalId = null;

const MAX_HISTORY_PER_TYPE = 5000;
const MAX_STEP_KM_PER_10_SECONDS = 0.20; // aprox. 72 km/h máximo simulado

function buildVehicle(index) {
  const zone = guatemalaZones[index % guatemalaZones.length];
  const initialPosition = generatePointNear(zone.center, zone.radiusKm / 2);

  return {
    idVehiculo: `EV-ACME-${String(10000 + index).padStart(5, '0')}`,
    vin: `VINACMEEV${String(10000 + index).padStart(7, '0')}`,
    zona: zone,
    position: initialPosition,
    battery: randomInt(45, 100),
    on: Math.random() > 0.15,
    problemCode: '000',
    odometer: Number(randomBetween(1500, 45000).toFixed(1)),
    lastBearing: randomBetween(0, 360),
  };
}

function getProblemCode(vehicle) {
  if (!vehicle.on) return '000';

  const random = Math.random();

  if (vehicle.battery <= 15 && random < 0.35) return '101'; // batería baja
  if (random < 0.03) return String(randomInt(1, 999)).padStart(3, '0');

  return '000';
}

function updateVehiclePosition(vehicle) {
  if (!vehicle.on) return vehicle.position;

  const nextBearing = (vehicle.lastBearing + randomBetween(-35, 35) + 360) % 360;
  const stepKm = randomBetween(0.02, MAX_STEP_KM_PER_10_SECONDS);
  let nextPosition = movePoint(vehicle.position, stepKm, nextBearing);

  const distanceFromZoneCenter = distanceKm(vehicle.zona.center, nextPosition);

  // Regla de correlación: el vehículo se mantiene cerca de su zona asignada.
  // Si se aleja demasiado, se redirige suavemente hacia el centro de la zona.
  if (distanceFromZoneCenter > vehicle.zona.radiusKm) {
    const bearingToCenter = Math.atan2(
      vehicle.zona.center.lng - vehicle.position.lng,
      vehicle.zona.center.lat - vehicle.position.lat
    );

    nextPosition = movePoint(vehicle.position, stepKm, (bearingToCenter * 180) / Math.PI);
  }

  vehicle.lastBearing = nextBearing;
  vehicle.position = nextPosition;
  vehicle.odometer = Number((vehicle.odometer + stepKm).toFixed(1));

  return nextPosition;
}

function updateVehicleStatus(vehicle) {
  if (vehicle.on) {
    vehicle.battery = Math.max(0, Number((vehicle.battery - randomBetween(0.01, 0.07)).toFixed(2)));
  } else if (Math.random() < 0.03) {
    vehicle.battery = Math.min(100, Number((vehicle.battery + randomBetween(0.1, 0.5)).toFixed(2)));
  }

  if (Math.random() < 0.02) {
    vehicle.on = !vehicle.on;
  }

  vehicle.problemCode = getProblemCode(vehicle);
}

function buildGpsEvent(vehicle, timestamp) {
  return {
    id_vehiculo: vehicle.idVehiculo,
    vin: vehicle.vin,
    timestamp,
    tipo_trama: 'GPS',
    zona_referencia: vehicle.zona.name,
    departamento: vehicle.zona.department,
    telemetria: {
      latitud: vehicle.position.lat,
      longitud: vehicle.position.lng,
    },
  };
}

function buildStatusEvent(vehicle, timestamp) {
  return {
    id_vehiculo: vehicle.idVehiculo,
    vin: vehicle.vin,
    timestamp,
    tipo_trama: 'ESTADO',
    zona_referencia: vehicle.zona.name,
    departamento: vehicle.zona.department,
    telemetria: {
      estado_bateria_porcentaje: Number(vehicle.battery.toFixed(2)),
      encendido: vehicle.on,
      codigo_problema: vehicle.problemCode,
      kilometraje: vehicle.odometer,
    },
  };
}

function pushLimited(history, event) {
  history.push(event);
  if (history.length > MAX_HISTORY_PER_TYPE) {
    history.shift();
  }
}

function tick() {
  const timestamp = new Date().toISOString();

  for (const vehicle of vehicles.values()) {
    updateVehiclePosition(vehicle);
    updateVehicleStatus(vehicle);

    const gpsEvent = buildGpsEvent(vehicle, timestamp);
    const statusEvent = buildStatusEvent(vehicle, timestamp);

    pushLimited(gpsHistory, gpsEvent);
    pushLimited(statusHistory, statusEvent);

    publishKafkaMessage(env.kafkaTopicGps, gpsEvent);
    publishKafkaMessage(env.kafkaTopicStatus, statusEvent);
  }
}

export function initializeVehicles(totalVehicles = 20) {
  vehicles.clear();
  gpsHistory.length = 0;
  statusHistory.length = 0;

  for (let index = 1; index <= totalVehicles; index += 1) {
    const vehicle = buildVehicle(index);
    vehicles.set(vehicle.idVehiculo, vehicle);
  }

  tick();
}

export function startSimulation() {
  if (intervalId) return;

  intervalId = setInterval(tick, env.simulationIntervalMs);
  console.log(`[Simulador] Enviando datos cada ${env.simulationIntervalMs / 1000}s`);
}

export function stopSimulation() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

export function getVehicles() {
  return Array.from(vehicles.values()).map((vehicle) => ({
    id_vehiculo: vehicle.idVehiculo,
    vin: vehicle.vin,
    zona_referencia: vehicle.zona.name,
    departamento: vehicle.zona.department,
    bateria_actual: Number(vehicle.battery.toFixed(2)),
    encendido: vehicle.on,
    codigo_problema: vehicle.problemCode,
    kilometraje: vehicle.odometer,
    ubicacion_actual: {
      latitud: vehicle.position.lat,
      longitud: vehicle.position.lng,
    },
  }));
}

export function getLatestGps() {
  const latestByVehicle = new Map();
  for (const event of gpsHistory) {
    latestByVehicle.set(event.id_vehiculo, event);
  }
  return Array.from(latestByVehicle.values());
}

export function getLatestStatuses() {
  const latestByVehicle = new Map();
  for (const event of statusHistory) {
    latestByVehicle.set(event.id_vehiculo, event);
  }
  return Array.from(latestByVehicle.values());
}

export function getGpsByVehicle(vehicleId, limit = 50) {
  return gpsHistory
    .filter((event) => event.id_vehiculo === vehicleId || event.vin === vehicleId)
    .slice(-limit);
}

export function getStatusByVehicle(vehicleId, limit = 50) {
  return statusHistory
    .filter((event) => event.id_vehiculo === vehicleId || event.vin === vehicleId)
    .slice(-limit);
}

export function getGpsHistory(limit = 100) {
  return gpsHistory.slice(-limit);
}

export function getStatusHistory(limit = 100) {
  return statusHistory.slice(-limit);
}

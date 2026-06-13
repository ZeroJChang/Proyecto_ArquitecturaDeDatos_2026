import { guatemalaZones } from './data/guatemala-zones.js';
import {
  distanceKm,
  generatePointNear,
  movePoint,
  randomBetween,
  randomInt,
} from './utils/geo.js';
import { publish } from './kafka/producer.js';
import { env } from './config/env.js';

const vehicles = new Map();
const MAX_STEP_KM_PER_10_SECONDS = 0.2;

function buildVehicle(index) {
  const zone = guatemalaZones[index % guatemalaZones.length];
  return {
    idVehiculo: `EV-ACME-${String(10000 + index).padStart(5, '0')}`,
    vin: `VINACMEEV${String(10000 + index).padStart(7, '0')}`,
    zona: zone,
    position: generatePointNear(zone.center, zone.radiusKm / 2),
    battery: randomInt(45, 100),
    on: Math.random() > 0.15,
    problemCode: '000',
    odometer: Number(randomBetween(1500, 45000).toFixed(1)),
    lastBearing: randomBetween(0, 360),
  };
}

function getProblemCode(vehicle) {
  if (!vehicle.on) return '000';
  const r = Math.random();
  if (vehicle.battery <= 15 && r < 0.35) return '101';
  if (r < 0.03) return String(randomInt(1, 999)).padStart(3, '0');
  return '000';
}

function updatePosition(vehicle) {
  if (!vehicle.on) return;
  const nextBearing =
    (vehicle.lastBearing + randomBetween(-35, 35) + 360) % 360;
  const stepKm = randomBetween(0.02, MAX_STEP_KM_PER_10_SECONDS);
  let next = movePoint(vehicle.position, stepKm, nextBearing);

  if (distanceKm(vehicle.zona.center, next) > vehicle.zona.radiusKm) {
    const bearing = Math.atan2(
      vehicle.zona.center.lng - vehicle.position.lng,
      vehicle.zona.center.lat - vehicle.position.lat,
    );
    next = movePoint(vehicle.position, stepKm, (bearing * 180) / Math.PI);
  }

  vehicle.lastBearing = nextBearing;
  vehicle.position = next;
  vehicle.odometer = Number((vehicle.odometer + stepKm).toFixed(1));
}

function updateStatus(vehicle) {
  if (vehicle.on) {
    vehicle.battery = Math.max(
      0,
      Number((vehicle.battery - randomBetween(0.01, 0.07)).toFixed(2)),
    );
  } else if (Math.random() < 0.03) {
    vehicle.battery = Math.min(
      100,
      Number((vehicle.battery + randomBetween(0.1, 0.5)).toFixed(2)),
    );
  }
  if (Math.random() < 0.02) vehicle.on = !vehicle.on;
  vehicle.problemCode = getProblemCode(vehicle);
}

async function tick() {
  const timestamp = new Date().toISOString();
  const publishes = [];

  for (const vehicle of vehicles.values()) {
    updatePosition(vehicle);
    updateStatus(vehicle);

    publishes.push(
      publish(env.kafkaTopicGps, {
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
      }),
      publish(env.kafkaTopicStatus, {
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
      }),
    );
  }

  await Promise.allSettled(publishes);
}

export function initialize(total = env.totalVehicles) {
  for (let i = 1; i <= total; i++) {
    const v = buildVehicle(i);
    vehicles.set(v.idVehiculo, v);
  }
}

export function start() {
  tick();
  setInterval(tick, env.intervalMs);
  console.log(
    `[Simulator] ${vehicles.size} vehículos, intervalo ${env.intervalMs / 1000}s`,
  );
}

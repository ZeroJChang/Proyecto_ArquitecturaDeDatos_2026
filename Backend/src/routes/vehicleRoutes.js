import express from 'express';
import {
  getGpsByVehicle,
  getGpsHistory,
  getLatestGps,
  getLatestStatuses,
  getStatusByVehicle,
  getStatusHistory,
  getVehicles,
} from '../services/vehicleSimulator.js';

export const vehicleRouter = express.Router();

function parseLimit(value, defaultValue = 100) {
  const limit = Number(value || defaultValue);
  if (Number.isNaN(limit) || limit <= 0) return defaultValue;
  return Math.min(limit, 1000);
}

vehicleRouter.get('/', (_req, res) => {
  res.json({
    total: getVehicles().length,
    data: getVehicles(),
  });
});

vehicleRouter.get('/gps/latest', (_req, res) => {
  res.json({
    total: getLatestGps().length,
    data: getLatestGps(),
  });
});

vehicleRouter.get('/status/latest', (_req, res) => {
  res.json({
    total: getLatestStatuses().length,
    data: getLatestStatuses(),
  });
});

vehicleRouter.get('/gps/history', (req, res) => {
  const limit = parseLimit(req.query.limit, 100);
  res.json({
    total: getGpsHistory(limit).length,
    data: getGpsHistory(limit),
  });
});

vehicleRouter.get('/status/history', (req, res) => {
  const limit = parseLimit(req.query.limit, 100);
  res.json({
    total: getStatusHistory(limit).length,
    data: getStatusHistory(limit),
  });
});

vehicleRouter.get('/:vehicleId/gps', (req, res) => {
  const limit = parseLimit(req.query.limit, 50);
  const data = getGpsByVehicle(req.params.vehicleId, limit);

  if (data.length === 0) {
    return res.status(404).json({
      message: 'No se encontraron datos GPS para el vehículo indicado.',
      data: [],
    });
  }

  return res.json({
    total: data.length,
    data,
  });
});

vehicleRouter.get('/:vehicleId/status', (req, res) => {
  const limit = parseLimit(req.query.limit, 50);
  const data = getStatusByVehicle(req.params.vehicleId, limit);

  if (data.length === 0) {
    return res.status(404).json({
      message: 'No se encontraron datos de estado para el vehículo indicado.',
      data: [],
    });
  }

  return res.json({
    total: data.length,
    data,
  });
});

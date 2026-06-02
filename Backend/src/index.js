import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { initializeKafkaProducer } from './kafka/kafkaPublisher.js';
import { vehicleRouter } from './routes/vehicleRoutes.js';
import { initializeVehicles, startSimulation } from './services/vehicleSimulator.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'ACME EV Backend Simulator',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/vehicles', vehicleRouter);

initializeVehicles(20);
initializeKafkaProducer();
startSimulation();

app.listen(env.port, () => {
  console.log(`ACME EV Backend ejecutándose en http://localhost:${env.port}`);
});

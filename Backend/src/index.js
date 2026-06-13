import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { vehicleRouter } from './routes/vehicleRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', service: 'ACME EV Backend', timestamp: new Date().toISOString() });
});

app.use('/api/vehicles', vehicleRouter);

app.listen(env.port, () => {
  console.log(`ACME EV Backend ejecutándose en http://localhost:${env.port}`);
});

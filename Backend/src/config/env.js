import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  simulationIntervalMs: Number(process.env.SIMULATION_INTERVAL_MS || 10000),
  kafkaEnabled: String(process.env.KAFKA_ENABLED || 'false').toLowerCase() === 'true',
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopicGps: process.env.KAFKA_TOPIC_GPS || 'acme.ev.gps',
  kafkaTopicStatus: process.env.KAFKA_TOPIC_STATUS || 'acme.ev.status',
};

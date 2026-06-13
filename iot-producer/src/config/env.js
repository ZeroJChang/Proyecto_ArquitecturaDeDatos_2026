export const env = {
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopicGps: process.env.KAFKA_TOPIC_GPS || 'acme.ev.gps',
  kafkaTopicStatus: process.env.KAFKA_TOPIC_STATUS || 'acme.ev.status',
  intervalMs: Number(process.env.SIMULATION_INTERVAL_MS || 10000),
  totalVehicles: Number(process.env.TOTAL_VEHICLES || 20),
};

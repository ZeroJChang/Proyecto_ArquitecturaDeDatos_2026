import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';

let producer = null;

export async function initializeProducer() {
  const kafka = new Kafka({ clientId: 'ev-simulator', brokers: [env.kafkaBroker] });
  producer = kafka.producer();
  await producer.connect();
  console.log(`[Kafka] Producer listo en ${env.kafkaBroker}`);
}

export async function publish(topic, message) {
  if (!producer) return;
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

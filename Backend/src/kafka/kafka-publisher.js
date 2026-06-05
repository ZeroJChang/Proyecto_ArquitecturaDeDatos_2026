import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';

let producer = null;

export async function initializeKafkaProducer() {
  if (!env.kafkaEnabled) {
    console.log('[Kafka] Deshabilitado. Para activar, usar KAFKA_ENABLED=true');
    return;
  }

  try {
    const kafka = new Kafka({
      clientId: 'publisher',
      brokers: [env.kafkaBroker],
    });

    producer = kafka.producer();

    await producer.connect();

    console.log(`[Kafka] Producer listo en ${env.kafkaBroker}`);
  } catch (error) {
    producer = null;
    console.error('[Kafka] Error conectando producer:', error.message);
  }
}

export async function publishKafkaMessage(topic, message) {
  if (!env.kafkaEnabled) return;

  if (!producer) {
    console.warn(
      `[Kafka] Producer no inicializado. Evento no enviado al tópico ${topic}`
    );
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    console.error(
      `[Kafka] Error enviando evento a ${topic}:`,
      error.message
    );
  }
}

export async function disconnectKafkaProducer() {
  if (!producer) return;

  await producer.disconnect();
  producer = null;

  console.log('[Kafka] Producer desconectado');
}
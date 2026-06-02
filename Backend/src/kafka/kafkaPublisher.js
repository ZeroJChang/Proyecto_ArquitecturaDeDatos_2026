import kafka from 'kafka-node';
import { env } from '../config/env.js';

let producer = null;
let isReady = false;

export function initializeKafkaProducer() {
  if (!env.kafkaEnabled) {
    console.log('[Kafka] Deshabilitado. Para activar, usar KAFKA_ENABLED=true');
    return;
  }

  const client = new kafka.KafkaClient({ kafkaHost: env.kafkaBroker });
  producer = new kafka.Producer(client);

  producer.on('ready', () => {
    isReady = true;
    console.log(`[Kafka] Producer listo en ${env.kafkaBroker}`);
  });

  producer.on('error', (error) => {
    isReady = false;
    console.error('[Kafka] Error en producer:', error.message);
  });
}

export function publishKafkaMessage(topic, message) {
  if (!env.kafkaEnabled) return;

  if (!producer || !isReady) {
    console.warn(`[Kafka] Producer no listo. Evento no enviado al tópico ${topic}`);
    return;
  }

  producer.send(
    [
      {
        topic,
        messages: JSON.stringify(message),
      },
    ],
    (error) => {
      if (error) {
        console.error(`[Kafka] Error enviando evento a ${topic}:`, error.message);
      }
    }
  );
}

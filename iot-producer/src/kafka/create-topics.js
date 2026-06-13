import { Kafka } from 'kafkajs';
import { env } from '../config/env.js';

const kafka = new Kafka({
  clientId: 'topic-manager',
  brokers: [env.kafkaBroker],
});

const topics = [
  {
    topic: 'acme.ev.gps',
    numPartitions: 3,
    replicationFactor: 1,
  },
  {
    topic: 'acme.ev.status',
    numPartitions: 3,
    replicationFactor: 1,
  },
];

async function createTopics() {
  const admin = kafka.admin();

  try {
    await admin.connect();

    const created = await admin.createTopics({
      waitForLeaders: true,
      topics,
    });

    if (created) {
      console.log('[Kafka] Tópicos creados correctamente');
    } else {
      console.log('[Kafka] Los tópicos ya existen');
    }
  } catch (error) {
    console.error('[Kafka] Error creando tópicos:', error);
  } finally {
    await admin.disconnect();
  }
}

createTopics();

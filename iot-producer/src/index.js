import { initializeProducer } from './kafka/producer.js';
import { initialize, start } from './simulator.js';

await initializeProducer();
initialize();
start();

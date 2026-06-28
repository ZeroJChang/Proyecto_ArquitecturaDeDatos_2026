# References

Curated external and internal links. Every entry states why it is worth opening.

## Business
| Name | Type | Purpose | Link |
|------|------|---------|------|
| Project brief — "Arquitectura de Datos para la Movilidad Inteligente de ACME EV" | Requirements | Originating case study: fleet size, telemetry cadences, retention, access needs, and evaluation criteria | Course deliverable (Universidad Rafael Landívar, Fundamentos de Arquitectura de Datos) |

## Architecture
| Name | Type | Purpose | Link |
|------|------|---------|------|
| Decision Index | ADR index | Entry point to all architectural decisions of record | [Decision Index](../history/decision-index.md) |
| High-Level Design | Design doc | System vision, C4 diagrams, scalability and recovery posture | [High-Level Design](../hld.md) |
| Knowledge Registries | Canonical knowledge | Domain, contracts, and database registries | [Knowledge index](index.md) |

## Operations
| Name | Type | Purpose | Link |
|------|------|---------|------|
| Operations Guide | Runbooks | Symptom-to-runbook for ingestion stalls, DB outages, backlog | [Operations Guide](../operations/operations-guide.md) |
| Observability | Signals | Logs, metrics, and health assessment for the platform | [Observability](../operations/observability.md) |
| Spark Master UI | Dashboard | Live cluster + streaming query status (local `http://localhost:8080`, jobs at `:4040`) | http://localhost:8080 |

## External Providers
| Name | Type | Purpose | Link |
|------|------|---------|------|
| Apache Kafka docs | Docs | KRaft configuration and topic management reference | https://kafka.apache.org/documentation/ |
| Spark Structured Streaming | Docs | Streaming semantics, checkpointing, `foreachBatch` | https://spark.apache.org/docs/3.5.1/structured-streaming-programming-guide.html |
| MongoDB Spark Connector | Docs | `mongo-spark-connector_2.12:10.4.0` write options | https://www.mongodb.com/docs/spark-connector/current/ |
| Supabase | Provider | Managed PostgreSQL target for production; PITR/backups | https://supabase.com/docs |
| MongoDB Atlas | Provider | Managed MongoDB target for production; continuous backup | https://www.mongodb.com/docs/atlas/ |

## API Specs
| Name | Type | Purpose | Link |
|------|------|---------|------|
| EV Fleet Dashboard API (Swagger) | OpenAPI | Live, generated source of truth for the HTTP contract | `/docs` (served by the backend) |

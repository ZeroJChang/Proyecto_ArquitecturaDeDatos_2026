# Observability

How the ACME EV Data Platform is observed. It defines the **signals**; the responses to those signals are the runbooks indexed by the [Operations Guide](operations-guide.md).

> This catalog references operational signals and resources; it does not reproduce dashboard definitions. The Spark UIs and any external monitoring backend remain the source of truth for live visualizations.

## Logging Strategy

- **Log levels:** `ERROR` for failed writes, failed batches, and unhandled exceptions; `WARN` for retries and degraded-but-recovering conditions (Kafka reconnect, unexpectedly empty batches); `INFO` for pipeline start/stop, batch commits, and request completion; `DEBUG` for development tracing.
- **Structured fields:** logs should be JSON carrying at minimum `correlationId`, `flowName`, and `status`. The IoT Producer logs simulator start with vehicle count and interval; Spark logs query progress per micro-batch; the backend logs request/response with the resolved role.
- **Correlation:** a `correlationId` is created at the edge (API request entry, or per Kafka frame at the producer) and propagated through Kafka message metadata, Spark batch logs, and downstream writes so one frame can be traced end to end.
- **Sensitive data:** never log passwords, bcrypt hashes, or JWTs (see [Security](../security.md)). The login flow logs only the email and outcome.

## Metrics

Business metrics answer "is the product working?"; technical metrics answer "is the infrastructure healthy?". Keep them separate so a product failure is not hidden behind green infrastructure.

### Business metrics

| Metric | Type | Description |
|--------|------|-------------|
| `gps.events.ingested` | Counter | GPS frames written to `gps_events` |
| `status.events.ingested` | Counter | Status frames written to `status_events` |
| `vehicles.active` | Gauge | Distinct VINs seen in the last interval |
| `vehicles.in_fault` | Gauge | Vehicles whose latest status carries a non-`000` fault code |
| `gps.csv.downloads` | Counter | Owner CSV exports issued |
| `ingestion.lag_seconds` | Distribution | `processed_at` − `event_timestamp` per frame |

### Technical metrics

| Metric | Type | Description |
|--------|------|-------------|
| `kafka.topic.lag` | Gauge | Unconsumed offsets per topic/partition |
| `spark.batch.duration` | Distribution | Micro-batch processing time per pipeline |
| `spark.batch.input_rows` | Distribution | Rows per micro-batch |
| `spark.query.running` | Gauge | Whether each streaming query is active (1/0) |
| `db.write.errors` | Counter | Failed JDBC/Mongo batch writes |
| `api.request.duration` | Distribution | Backend request latency by route |
| `api.5xx` | Counter | Server errors by route |

## Tracing

- Recommended: OpenTelemetry across the backend, with the producer tagging each frame and Spark logging batch progress.
- Key spans when debugging: Kafka publish (producer), micro-batch processing + datastore write (Spark), and DB read per API request.
- The `correlationId` propagates into spans so logs and traces join up for a single frame or request.

## Resource Catalog

| Resource | Type | Provider | Environment | Scope | Purpose | Owner | Link |
|----------|------|----------|-------------|-------|---------|-------|------|
| Spark Master UI | Dashboard | Apache Spark | Local / dev | Spark cluster | Worker registration and live streaming query progress | Data Platform Team | http://localhost:8080 |
| Spark Job UI | Dashboard | Apache Spark | Local / dev | Streaming query | Per-batch duration and input rows | Data Platform Team | http://localhost:4040 |

The platform does not yet operate a managed metrics backend; the metrics above describe what to emit and the questions each answers. When a backend (e.g. Grafana, CloudWatch, Datadog) is adopted, register each dashboard here with its provider, environment, scope, purpose, owner, and a direct link — do not reproduce dashboard definitions in this file.

## Alerts

| Name | Condition | Severity | Runbook | Escalation |
|------|-----------|----------|---------|------------|
| `kafka-topic-lag` | `kafka.topic.lag` rising for >10 min | Warning | [Ingestion backlog](runbooks/ingestion-backlog.md) | Data on-call |
| `spark-query-down` | `spark.query.running` = 0 for a pipeline | Critical | [Pipeline stopped](runbooks/pipeline-stopped.md) | Data on-call |
| `db-write-errors` | `db.write.errors` > 0 sustained | Critical | [Datastore outage](runbooks/datastore-outage.md) | DB owner |
| `ingestion-lag` | `ingestion.lag_seconds` p99 > 60s | Warning | [Ingestion backlog](runbooks/ingestion-backlog.md) | Data on-call |
| `api-5xx-rate` | `api.5xx` rate breaches SLO | Critical | [Elevated 5xx](runbooks/elevated-5xx.md) | API on-call |

Every alert links to a runbook. An alert with no runbook is an alert no one knows how to act on.

## SLOs

- **Availability:** 99.5% for the read API (≈ 43h/year budget) — aligned with the managed-service posture in the [High-Level Design](../hld.md).
- **Latency:** p99 API read < 500ms.
- **Ingestion freshness:** p99 `ingestion.lag_seconds` < 60s.
- **Error budget policy:** when the monthly budget is spent, non-critical feature work pauses until ingestion freshness and API error rate recover.

## Health Assessment

The system is healthy when: both Spark streaming queries are running, `kafka.topic.lag` is flat near zero, `ingestion.lag_seconds` stays under a minute, `db.write.errors` is zero, and the API serves reads under its latency SLO.

Degradation **before** outright failure shows as: slowly rising `kafka.topic.lag`, climbing `spark.batch.duration`, or a growing `ingestion.lag_seconds` p99. Any of these means the stream is falling behind real time — act on the [Ingestion backlog](runbooks/ingestion-backlog.md) runbook before it becomes an outage.

## See Also

- [Operations Guide](operations-guide.md) — runbooks that respond to the signals defined here.

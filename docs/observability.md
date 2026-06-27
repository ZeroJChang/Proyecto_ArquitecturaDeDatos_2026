# Observability

The global L4 standard for how the ACME EV Data Platform is observed. It defines the **signals**; the responses to those signals live in [`operations-guide.md`](operations-guide.md).

## Logging Strategy

- **Log levels:** `ERROR` for failed writes, failed batches, and unhandled exceptions; `WARN` for retries and degraded-but-recovering conditions (Kafka reconnect, empty batches that were expected to have data); `INFO` for pipeline start/stop, batch commits, and request completion; `DEBUG` for development tracing.
- **Structured fields:** logs should be JSON carrying at minimum `correlationId`, `flowName`, and `status`. The IoT Producer logs simulator start with vehicle count and interval; Spark logs query progress per micro-batch; the backend logs request/response with the resolved role.
- **Correlation:** a `correlationId` is created at the edge (API request entry, or per Kafka frame at the producer) and propagated through Kafka message metadata, Spark batch logs, and downstream writes so one frame can be traced end to end.
- **Sensitive data:** never log passwords, bcrypt hashes, or JWTs. The login flow logs only the email and outcome, never the password. Redact secrets via a field allow-list before writing.

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

## Dashboards

- **Ingestion health:** GPS/status ingestion counters, `ingestion.lag_seconds`, `kafka.topic.lag`, `spark.query.running`. Purpose: confirm the stream is flowing end to end.
- **Spark cluster:** the Spark Master UI (`:8080`) and per-job UI (`:4040`) show worker registration and live streaming query progress.
- **Fleet health:** `vehicles.active`, `vehicles.in_fault`. Purpose: product-level view for admins/branch operators.
- **API:** `api.request.duration`, `api.5xx` by route.

## Alerts

| Name | Condition | Severity | Runbook | Escalation |
|------|-----------|----------|---------|------------|
| `kafka-topic-lag` | `kafka.topic.lag` rising for >10 min | Warning | [Ingestion backlog](operations-guide.md#runbook-ingestion-backlog) | Data on-call |
| `spark-query-down` | `spark.query.running` = 0 for a pipeline | Critical | [Pipeline stopped](operations-guide.md#runbook-pipeline-stopped) | Data on-call |
| `db-write-errors` | `db.write.errors` > 0 sustained | Critical | [Datastore outage](operations-guide.md#runbook-datastore-outage) | DB owner |
| `ingestion-lag` | `ingestion.lag_seconds` p99 > 60s | Warning | [Ingestion backlog](operations-guide.md#runbook-ingestion-backlog) | Data on-call |
| `api-5xx-rate` | `api.5xx` rate breaches SLO | Critical | [Elevated 5xx](operations-guide.md#runbook-elevated-5xx) | API on-call |

Every alert links to a runbook. An alert with no runbook is an alert no one knows how to act on.

## SLOs

- **Availability:** 99.5% for the read API (≈ 43h/year budget) — aligned with the managed-service posture in [`hld.md`](hld.md).
- **Latency:** p99 API read < 500ms.
- **Ingestion freshness:** p99 `ingestion.lag_seconds` < 60s.
- **Error budget policy:** when the monthly budget is spent, non-critical feature work pauses until ingestion freshness and API error rate recover.

## Health Assessment

The system is healthy when: both Spark streaming queries are running, `kafka.topic.lag` is flat near zero, `ingestion.lag_seconds` stays under a minute, `db.write.errors` is zero, and the API serves reads under its latency SLO.

Degradation **before** outright failure shows as: slowly rising `kafka.topic.lag`, climbing `spark.batch.duration`, or a growing `ingestion.lag_seconds` p99. Any of these means the stream is falling behind real time — act on the [Ingestion backlog](operations-guide.md#runbook-ingestion-backlog) runbook before it becomes an outage.

## See Also

- [`operations-guide.md`](operations-guide.md) — runbooks that respond to the signals defined here.

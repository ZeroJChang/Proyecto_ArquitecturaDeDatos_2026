# Glossary

Shared business vocabulary. Each term has one canonical entry; detailed rules and relationships live in the [Domain registry](domain.md), and data structures in the [Database registry](database.md).

| Term | Definition | Context | Related flows |
|------|------------|---------|---------------|
| VIN | Vehicle Identification Number — the unique identifier of a vehicle across the platform | Primary business key linking telemetry to a vehicle | Ingest GPS, Ingest Status, Query GPS Events, Claim Vehicle |
| GPS frame | A telemetry message carrying a vehicle's geographic position at a moment in time | Emitted on the GPS cadence; stored relationally | Produce Telemetry, Ingest GPS, Query GPS Events |
| Status frame | A telemetry message carrying a vehicle's operational state (battery, ignition, fault code, odometer) | Emitted on the status cadence; stored as a flexible document | Produce Telemetry, Ingest Status, Query Status Events |
| Fault code | A three-digit code reported in a status frame; `000` means no fault, any other value signals a problem (e.g. `101` low battery) | Drives the faults view and admin/branch alerts | Query Status Events, View Dashboards |
| Branch | A regional ACME EV location that owns vehicles and employs branch operators | Scopes what a branch operator can see | List Branches, List Vehicles, Query Status Events |
| Owner | A customer who owns one or more vehicles and may access their telemetry | Scopes owner GPS access | Claim Vehicle, Query GPS Events |
| Claim | The act of an owner associating a vehicle (by VIN) with their account | Creates a `vehicle_owners` link; generates a demo vehicle if the VIN is unknown | Claim Vehicle |
| Demo vehicle | A vehicle record auto-generated when an owner claims a VIN the platform has never seen | Demo/defense convenience; assigned to the lowest-id branch | Claim Vehicle |
| Telemetry | Collective term for the GPS and status data streamed from vehicles | The platform's core data asset; append-only | Telemetry Ingestion flows |
| Checkpoint | The Spark Structured Streaming record of which Kafka offsets a pipeline has committed | Enables resume-without-loss after a restart | Ingest GPS, Ingest Status |
| `event_timestamp` | When the vehicle generated the frame | Distinct from `processed_at`; basis for retention and range queries | Ingest GPS, Ingest Status |
| `processed_at` | When the platform ingested the frame | Traceability of the processing pipeline | Ingest GPS, Ingest Status |
| Data scoping | Restricting query results to the rows a caller is entitled to, based on JWT role and branch/ownership | Enforced inside each query handler | Query GPS Events, Query Status Events, List Vehicles |

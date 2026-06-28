# Ingest Status — Components

## Component Table

| Component | Responsibility | Inputs | Outputs | Dependencies | Failure modes |
|-----------|----------------|--------|---------|--------------|---------------|
| Pipeline (`process_status_stream.py`) | Wire read → parse → transform → write; manage the streaming query | env config | running query | all components below | Query stops on unrecoverable error; restart resumes from checkpoint |
| Spark session (`common/spark_session.py`) | Create the Spark session | app name | session | Spark cluster | Fails if master unreachable |
| Kafka reader (`common/kafka_reader.py`) | Open streaming read on the topic | bootstrap servers, topic | raw stream DF | Kafka broker | Read fails if broker down |
| Parser (`common/parsers.py`) | Cast value to string and `from_json` against schema | raw DF, schema | parsed DF | — | Malformed JSON → null fields |
| Status schema (`common/schemas.py`) | Define the expected status frame structure | — | `status_schema` | — | Schema drift yields nulls |
| Mongo writer (`writers/mongo_writer.py`) | Append a batch to a collection via the connector | batch DF, uri, db, collection | docs in MongoDB | MongoDB, Mongo connector | Write error fails the batch (retried); early-returns on empty batch |
| Config (`common/config.py`) | Topics, Mongo URI/db/collection, checkpoint path | environment | constants | — | Bad URI → write failure |

## Diagram

```mermaid
graph TD
    Pipeline[Status Pipeline] --> Session[Spark Session]
    Pipeline --> Reader[Kafka Reader]
    Pipeline --> Parser[JSON Parser]
    Parser --> Schema[status_schema]
    Pipeline --> Writer[Mongo Writer]
    Reader --> Kafka>acme.ev.status]
    Writer --> Mongo[(status_events)]
    Pipeline --> Config[Config + Checkpoint]
```

---

[Previous: Sequence](sequence.md) · [Flow Index](index.md) · [Next: Persistence Context](persistence.md)

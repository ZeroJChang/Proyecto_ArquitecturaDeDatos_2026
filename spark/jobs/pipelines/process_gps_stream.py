# pipelines/gps_to_postgres.py
from pyspark.sql.functions import current_timestamp

import common.config as config
import common.spark_session as spark_session
import common.kafka_reader as kafka_reader
import common.parsers as parsers
import common.schemas as schemas
import writers.postgres_writer as postgres

spark = spark_session.create_session("acme-ev-gps-pipeline")

raw_df = kafka_reader.read(
    spark,
    config.KAFKA_BOOTSTRAP_SERVERS,
    config.KAFKA_TOPIC_GPS,
)

parsed_df = (
    parsers.parse_kafka_json(raw_df, schemas.gps_schema)
    .withColumnRenamed("timestamp", "event_timestamp")
    .withColumn("processed_at", current_timestamp())
)


def process_batch(batch_df, batch_id):
    postgres.write_batch_to_postgres(
        batch_df=batch_df,
        table_name="gps_events",
        url=config.POSTGRES_URL,
        user=config.POSTGRES_USER,
        password=config.POSTGRES_PASSWORD,
    )


query = (
    parsed_df.writeStream.foreachBatch(process_batch)
    .option("checkpointLocation", config.CHECKPOINT_GPS)
    .start()
)

query.awaitTermination()

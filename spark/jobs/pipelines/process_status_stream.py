from pyspark.sql.functions import col, current_timestamp, to_timestamp

import common.config as config
import common.kafka_reader as kafka_reader
import common.parsers as parsers
import common.schemas as schemas
import common.spark_session as spark_session
import writers.mongo_writer as mongo

spark = spark_session.create_session("acme-ev-status-pipeline")

raw_df = kafka_reader.read(
    spark,
    config.KAFKA_BOOTSTRAP_SERVERS,
    config.KAFKA_TOPIC_STATUS,
)

parsed_df = (
    parsers.parse_kafka_json(raw_df, schemas.status_schema)
    .withColumn("event_timestamp", to_timestamp(col("timestamp")))
    .withColumn("bateria", col("telemetria.estado_bateria_porcentaje"))
    .withColumn("encendido", col("telemetria.encendido"))
    .withColumn("codigo_problema", col("telemetria.codigo_problema"))
    .withColumn("kilometraje", col("telemetria.kilometraje"))
    .drop("timestamp", "telemetria")
    .withColumn("processed_at", current_timestamp())
)


def process_batch(batch_df, batch_id):
    mongo.write_batch_to_mongo(
        batch_df=batch_df,
        uri=config.MONGO_URI,
        database=config.MONGO_DB,
        collection=config.MONGO_COLLECTION_STATUS,
    )


query = (
    parsed_df.writeStream.foreachBatch(process_batch)
    .option("checkpointLocation", config.CHECKPOINT_STATUS)
    .start()
)

query.awaitTermination()

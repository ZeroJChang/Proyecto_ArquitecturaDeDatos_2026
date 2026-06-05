import os

from pyspark.sql import SparkSession
from pyspark.sql.functions import col, from_json, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "host.docker.internal:9092"
)

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "host.docker.internal")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "acme")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

CHECKPOINT_DIR = os.getenv(
    "CHECKPOINT_DIR", "/opt/spark/work-dir/checkpoints/acme-ev-gps"
)

POSTGRES_URL = f"jdbc:postgresql://{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

spark = SparkSession.builder.appName("ACME EV GPS Stream Processor").getOrCreate()

spark.sparkContext.setLogLevel("WARN")

schema = StructType(
    [
        StructField("vin", StringType(), True),
        StructField("latitude", DoubleType(), True),
        StructField("longitude", DoubleType(), True),
        StructField("timestamp", StringType(), True),
    ]
)

raw_df = (
    spark.readStream.format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
    .option("subscribe", "acme.ev.gps")
    .option("startingOffsets", "latest")
    .load()
)

parsed_df = (
    raw_df.select(from_json(col("value").cast("string"), schema).alias("data"))
    .select("data.*")
    .withColumnRenamed("timestamp", "event_timestamp")
    .withColumn("processed_at", current_timestamp())
)


def write_to_postgres(batch_df, batch_id):
    if batch_df.isEmpty():
        return

    (
        batch_df.write.format("jdbc")
        .option("url", POSTGRES_URL)
        .option("dbtable", "gps_events")
        .option("user", POSTGRES_USER)
        .option("password", POSTGRES_PASSWORD)
        .option("driver", "org.postgresql.Driver")
        .mode("append")
        .save()
    )


query = (
    parsed_df.writeStream.foreachBatch(write_to_postgres)
    .option("checkpointLocation", CHECKPOINT_DIR)
    .start()
)

query.awaitTermination()

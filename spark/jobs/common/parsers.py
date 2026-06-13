from pyspark.sql.functions import col, from_json


def parse_kafka_json(df, schema):

    return df.select(
        from_json(col("value").cast("string"), schema).alias("data")
    ).select("data.*")

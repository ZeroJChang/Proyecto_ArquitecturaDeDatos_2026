from pyspark.sql.types import StructType, StructField, StringType, DoubleType

gps_schema = StructType(
    [
        StructField("vin", StringType(), True),
        StructField("latitude", DoubleType(), True),
        StructField("longitude", DoubleType(), True),
        StructField("timestamp", StringType(), True),
    ]
)

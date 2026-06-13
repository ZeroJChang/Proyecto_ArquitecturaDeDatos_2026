from pyspark.sql.types import StructType, StructField, StringType, DoubleType

gps_schema = StructType(
    [
        StructField("id_vehiculo", StringType(), True),
        StructField("vin", StringType(), True),
        StructField("timestamp", StringType(), True),
        StructField("tipo_trama", StringType(), True),
        StructField("zona_referencia", StringType(), True),
        StructField("departamento", StringType(), True),
        StructField(
            "telemetria",
            StructType(
                [
                    StructField("latitud", DoubleType(), True),
                    StructField("longitud", DoubleType(), True),
                ]
            ),
            True,
        ),
    ]
)

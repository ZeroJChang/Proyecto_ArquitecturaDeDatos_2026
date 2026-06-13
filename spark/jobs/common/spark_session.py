from pyspark.sql import SparkSession


def create_session(app_name):

    spark = SparkSession.builder.appName(app_name).getOrCreate()

    spark.sparkContext.setLogLevel("WARN")

    return spark

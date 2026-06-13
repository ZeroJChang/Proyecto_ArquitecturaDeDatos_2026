def read(spark, servers, topic):
    return (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", servers)
        .option("subscribe", topic)
        .option("startingOffsets", "latest")
        .load()
    )

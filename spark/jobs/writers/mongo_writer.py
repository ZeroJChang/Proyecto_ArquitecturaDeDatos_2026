def write_batch_to_mongo(batch_df, uri, database, collection):
    if batch_df.isEmpty():
        return

    (
        batch_df.write.format("mongodb")
        .option("connection.uri", uri)
        .option("database", database)
        .option("collection", collection)
        .mode("append")
        .save()
    )

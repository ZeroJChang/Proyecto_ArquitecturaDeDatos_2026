def write_batch_to_postgres(batch_df, table_name, url, user, password):

    if batch_df.isEmpty():
        return

    (
        batch_df.write.format("jdbc")
        .option("url", url)
        .option("dbtable", table_name)
        .option("user", user)
        .option("password", password)
        .option("driver", "org.postgresql.Driver")
        .mode("append")
        .save()
    )

import os

# KAFKA
KAFKA_BOOTSTRAP_SERVERS = os.getenv(
    "KAFKA_BOOTSTRAP_SERVERS", "host.docker.internal:9092"
)

KAFKA_TOPIC_GPS = os.getenv("KAFKA_TOPIC_GPS", "acme.ev.gps")
KAFKA_TOPIC_STATUS = os.getenv("KAFKA_TOPIC_STATUS", "acme.ev.status")

# POSTGRESQL
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "host.docker.internal")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "acme")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_URL = f"jdbc:postgresql://{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# MONGODB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://host.docker.internal:27017")
MONGO_DB = os.getenv("MONGO_DB", "acme")
MONGO_COLLECTION_STATUS = os.getenv("MONGO_COLLECTION_STATUS", "status_events")

# CHECKPOINTS
CHECKPOINT_GPS = os.getenv(
    "CHECKPOINT_GPS", "/opt/spark/work-dir/checkpoints/acme-ev-gps"
)
CHECKPOINT_STATUS = os.getenv(
    "CHECKPOINT_STATUS", "/opt/spark/work-dir/checkpoints/acme-ev-status"
)

export const config = () => ({
  database: {
    postgresUri: process.env.POSTGRES_URI,
    mongoUri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});

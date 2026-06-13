export const env = {
  port: Number(process.env.PORT || 3000),
  postgresUri: process.env.POSTGRES_URI || 'postgresql://postgres:postgres@localhost:5432/acme',
};

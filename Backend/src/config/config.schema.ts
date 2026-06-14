import * as Joi from 'joi';

export const SchemaConfig = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'local')
    .default('local'),
  WEB_APP_URL: Joi.string().uri().optional().default('http://localhost:3001'),
  POSTGRES_URI: Joi.string().optional(),
  MONGO_URI: Joi.string().optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
});

import type { config as base } from './envs/default';
import type { config as production } from './envs/prod';

export type ObjectType = Record<string, unknown>;
export type Default = typeof base;
export type Production = typeof production;
export type Config = Default & Production;

export interface DatabaseConfig {
  postgresUri: string | undefined;
  mongoUri: string | undefined;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  jwt: JwtConfig;
}

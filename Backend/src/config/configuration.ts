import merge from 'lodash.merge';

import { Config } from './config.interface';
import { config as def } from './envs/default';
import { config as dev } from './envs/development';
import { config as local } from './envs/local';
import { config as prod } from './envs/prod';

const byEnv = {
  default: def,
  local,
  production: prod,
  development: dev,
} as const;

export const configuration = (): Promise<Config> => {
  const env = (process.env.NODE_ENV ?? 'local') as keyof typeof byEnv;
  const envConfig = byEnv[env];

  const config = merge({}, byEnv.default(), envConfig());

  return config as unknown as Promise<Config>;
};

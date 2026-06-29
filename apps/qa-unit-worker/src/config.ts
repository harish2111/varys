import { type Env, loadConfig } from '@varys/config';

export const CONFIG = Symbol('CONFIG');
export type AppConfig = Env;

export const configProvider = {
  provide: CONFIG,
  useFactory: (): AppConfig => loadConfig(),
};

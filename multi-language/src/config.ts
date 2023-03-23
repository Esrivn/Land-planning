import { ImmutableObject } from 'seamless-immutable'

export interface Config {
  languageDefault: any,
}

export type IMConfig = ImmutableObject<Config>

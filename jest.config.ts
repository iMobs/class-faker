import { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  setupFilesAfterEnv: ['reflect-metadata'],
};

export default config;

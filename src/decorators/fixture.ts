import type { Faker } from '@faker-js/faker';

export const METADATA_KEY = Symbol('FIXTURES');

export interface FixtureMeta {
  propertyKey: string | symbol;
  options?: FixtureOptions;
  type: any;
}

export type FixtureOptions =
  | string
  | ((faker: Faker) => unknown)
  | (() => unknown)
  | {
      type: () => typeof Number;
      min?: number;
      max?: number;
    }
  | {
      type: () => typeof Date;
      min?: Date;
      max?: Date;
    }
  | {
      type: () => object;
      enum?: object;
    };

export function Fixture(options?: FixtureOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);

    const fixtures: FixtureMeta[] =
      Reflect.getMetadata(METADATA_KEY, target.constructor) ?? [];

    fixtures.push({ propertyKey, options, type });

    Reflect.defineMetadata(METADATA_KEY, fixtures, target.constructor);
  };
}

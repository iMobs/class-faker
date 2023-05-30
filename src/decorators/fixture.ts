import type { Faker } from '@faker-js/faker';

export const METADATA_KEY = Symbol('FIXTURES');

export interface FixtureMeta {
  propertyKey: string | symbol;
  options?: FixtureOptions;
  type: unknown;
}

export type FixtureOptions =
  | string
  | ((faker: Faker) => unknown)
  | (() => unknown)
  | {
      type?: () => unknown;
      enum?: object;
      minCount?: number;
      maxCount?: number;
      minValue?: number;
      maxValue?: number;
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

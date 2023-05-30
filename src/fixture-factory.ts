import { faker } from '@faker-js/faker';
import mergeDeep from 'merge-deep';

import {
  FixtureMeta,
  FixtureOptions,
  METADATA_KEY,
} from './decorators/fixture';

type Class<T> = new (...args: unknown[]) => T;

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

interface FixtureFactory<T> {
  one: () => T;
  many: (length: number) => T[];
  merge: (input: DeepPartial<T>) => T;
}

export function makeFixtureFactory<T>(classType: Class<T>): FixtureFactory<T> {
  const one = (): T => make(classType);
  const many = (length: number): T[] => Array.from({ length }, one);
  const merge = (input: DeepPartial<T>): T => {
    return mergeDeep(one(), input);
  };

  return { one, many, merge };
}

function make<T>(classType: Class<T>): T {
  const fixtures: FixtureMeta[] | undefined = Reflect.getMetadata(
    METADATA_KEY,
    classType,
  );

  if (!fixtures) {
    throw new Error(`${classType.name} has no registered fixtures`);
  }

  const object = new classType();

  for (const fixture of fixtures) {
    const value = makeProperty(fixture.type, fixture.options);

    // if (!(value instanceof fixture.type)) {
    //   throw new TypeError(
    //     `Invalid type, got ${typeof value} not ${fixture.type.name}`,
    //   );
    // }

    object[fixture.propertyKey] = value;
  }

  return object;
}

function makeProperty(
  propertyType: unknown,
  options?: FixtureOptions,
): unknown {
  if (typeof options === 'function') {
    return options(faker);
  }

  if (typeof options === 'string') {
    return faker.helpers.fake(options);
  }

  const type = options?.type?.();

  if (type) {
    if (Array.isArray(type)) {
      const length = faker.number.int({
        min: options.minCount,
        max: options.maxCount,
      });
      return Array.from({ length }, () => makeProperty(type[0], options));
    }
  }

  if (options?.enum) {
    return faker.helpers.arrayElement(Object.values(options.enum));
  }

  const min = options?.minValue;
  const max = options?.maxValue;

  switch (type ?? propertyType) {
    case Boolean:
      return faker.datatype.boolean();
    case Date:
      if (min && max) {
        return faker.date.between({ from: min, to: max });
      } else {
        return faker.date.recent();
      }
    case Number:
      return faker.number.float({ min, max });
    case String:
      return faker.string.sample(max);
    default:
      return make(propertyType as Class<unknown>);
  }
}

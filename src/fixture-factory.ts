import faker from '@faker-js/faker';
import mergeDeep from 'merge-deep';

import {
  FixtureMeta,
  FixtureOptions,
  METADATA_KEY,
} from './decorators/fixture';

type Class<T> = new (...args: any) => T;

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

function makeProperty(propertyType: any, options?: FixtureOptions): unknown {
  if (typeof options === 'function') {
    return options(faker);
  }

  if (typeof options === 'string') {
    return faker.fake(options);
  }

  const type = options?.type?.();

  if (type) {
    if (Array.isArray(type)) {
      const length = faker.datatype.number({
        min: options.minCount,
        max: options.maxCount,
      });
      return Array.from({ length }, () => makeProperty(type[0], options));
    }
  }

  if (options?.enum) {
    return faker.random.arrayElement(Object.values(options.enum));
  }

  const min = options?.minValue;
  const max = options?.maxValue;

  switch (type ?? propertyType) {
    case Boolean:
      return faker.datatype.boolean();
    case Date:
      return faker.datatype.datetime({ min, max });
    case Number:
      return faker.datatype.number({ min, max });
    case String:
      return faker.datatype.string(max);
    default:
      return make(propertyType);
  }
}

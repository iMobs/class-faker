import faker from '@faker-js/faker';

import {
  FixtureMeta,
  FixtureOptions,
  METADATA_KEY,
} from './decorators/fixture';

type Class<T = any> = new (...args: unknown[]) => T;

export class FixtureFactory {
  public build<T extends Class>(classType: T) {
    const result = {
      one: () => {
        return this.make(classType);
      },
      many: (x: number) => {
        return Array(x).fill(result.one());
      },
    };

    return result;
  }

  public make<T extends Class>(classType: T): T {
    const fixtures: FixtureMeta[] | undefined = Reflect.getMetadata(
      METADATA_KEY,
      classType,
    );

    if (!fixtures) {
      throw new Error(`${classType.name} has no registered fixtures`);
    }

    const object = new classType();

    for (const fixture of fixtures) {
      const value = this.makeProperty(fixture.type, fixture.options);

      // if (!(value instanceof fixture.type)) {
      //   throw new TypeError(
      //     `Invalid type, got ${typeof value} not ${fixture.type.name}`,
      //   );
      // }

      object[fixture.propertyKey] = value;
    }

    return object;
  }

  private makeProperty(type: any, options?: FixtureOptions): unknown {
    if (typeof options === 'function') {
      return options(faker);
    }

    if (typeof options === 'string') {
      return faker.fake(options);
    }

    switch (type) {
      case Boolean:
        return faker.datatype.boolean();
      case Date:
        return faker.datatype.datetime();
      case Number:
        return faker.datatype.number();
      case Object:
        return this.make(type);
      case String:
        return faker.datatype.string();
      default:
        return this.make(type);
    }
  }
}

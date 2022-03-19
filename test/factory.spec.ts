import faker from '@faker-js/faker';

import { Fixture, FixtureFactory } from '../src';

describe('FixtureFactory', () => {
  describe('#one', () => {
    it('throws an error if there are no fixtures', () => {
      class Test {
        prop: string;
      }

      expect(() => FixtureFactory(Test).one()).toThrowError(
        `Test has no registered fixtures`,
      );
    });

    describe('basic types', () => {
      describe('booleans', () => {
        it('creates a boolean value', () => {
          class Test {
            @Fixture()
            prop: boolean;
          }

          const result = FixtureFactory(Test).one();
          expect(result).toHaveProperty('prop');
          expect(typeof result.prop).toBe('boolean');
        });
      });

      describe('dates', () => {
        it('creates a random date', () => {
          class Test {
            @Fixture()
            prop: Date;
          }

          const result = FixtureFactory(Test).one();
          expect(result).toHaveProperty('prop');
          expect(result.prop).toBeInstanceOf(Date);
        });

        it('creates a date within limits', () => {
          const minValue = new Date('2022-03-19').getTime();
          const maxValue = new Date('2022-03-20').getTime();

          class Test {
            @Fixture({ minValue, maxValue })
            prop: Date;
          }

          const result = FixtureFactory(Test).one();
          expect(result.prop.getTime()).toBeGreaterThanOrEqual(minValue);
          expect(result.prop.getTime()).toBeLessThanOrEqual(maxValue);
        });
      });

      describe('numbers', () => {
        it.todo('creates random numbers');

        it.todo('creates numbers within limits');
      });

      describe('strings', () => {
        it.todo('creates random strings');

        it.todo('creates templated strings');
      });
    });

    describe('enums', () => {
      it.todo('selects a random enum value');
    });

    describe('nested', () => {
      it('builds nested class fixtures', () => {
        class Bar {
          @Fixture('test')
          baz: string;
        }

        class Foo {
          @Fixture()
          bar: Bar;
        }

        const foo = FixtureFactory(Foo).one();
        expect(foo.bar).toBeInstanceOf(Bar);
        expect(foo.bar.baz).toBe('test');
      });

      it.todo('builds nested properties based on type function');

      it.todo('builds nested arrays within a range');
    });
  });

  describe('#many', () => {
    it('creates an array of fixtures', () => {
      class Test {
        @Fixture('test')
        value: string;
      }

      const count = faker.datatype.number({ min: 1, max: 10 });
      const result = FixtureFactory(Test).many(count);

      expect(result).toHaveLength(count);
      for (const fixture of result) {
        expect(fixture).toBeInstanceOf(Test);
        expect(fixture).toHaveProperty('value', 'test');
      }
    });
  });

  describe('#with', () => {
    it('creates a deeply merged fixture', () => {
      class Bar {
        @Fixture('test')
        baz: string;

        @Fixture()
        other: string;
      }

      class Foo {
        @Fixture()
        bar: Bar;

        @Fixture()
        other: string;
      }

      const result = FixtureFactory(Foo).with({
        other: 'override',
        bar: {
          other: 'nested override',
        },
      });

      expect(result.other).toBe('override');
      expect(result.bar.other).toBe('nested override');
    });

    it.todo('creates a deeply merged array of fixtures');
  });
});

import { Fixture, FixtureFactory } from '../src';

describe('FixtureFactory', () => {
  class Test {
    @Fixture(() => 'test')
    str: string;

    @Fixture()
    num: number;

    @Fixture()
    arr: number[];
  }

  it('works', () => {
    const result = new FixtureFactory().make(Test);

    expect(result).toBeInstanceOf(Test);
    expect(result).toHaveProperty('str', 'test');
    expect(result).toHaveProperty('num');
  });
});

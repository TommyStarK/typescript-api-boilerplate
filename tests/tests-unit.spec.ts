import utils from '../src/utils';

describe('unit tests', () => {
  test('test validateEmail', () => {
    expect(utils.validateEmail('test@test.com')).toBe(true);
    expect(utils.validateEmail('test@')).toBe(false);
  });

  test('test encrypt/decrypt', () => {
    expect(utils.decrypt(utils.encrypt('test'))).toEqual('test');
  });

  test('test hash', () => {
    expect(utils.hash('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });
});

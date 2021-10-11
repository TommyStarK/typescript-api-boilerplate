import utils from '../../src/utils';

describe('unit tests', () => {
  test('test encrypt/decrypt', () => {
    expect(utils.decrypt(utils.encrypt('test'))).toEqual('test');
  });

  test('test hash', () => {
    expect(utils.hash('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });

  test('read directory', async () => {
    await expect(utils.readdirAsync(`${process.cwd()}/src/custom_typings/express`)).resolves.toEqual<string[]>(['index.d.ts']);
    await expect(utils.readdirAsync('/dummy')).rejects.toThrow();
  });

  test('read file', async () => {
    await expect((utils.readFileAsync(`${process.cwd()}/.dockerignore`))).resolves.not.toThrow();
    await expect((utils.readFileAsync('/dummy'))).rejects.toThrow();
  });

  test('unlink file', async () => {
    await expect((utils.unlinkAsync('/dummy'))).rejects.toThrow();
  });

  test('write file', async () => {
    await expect((utils.writeFileAsync('/dummy/foo', ''))).rejects.toThrow();
  });
});

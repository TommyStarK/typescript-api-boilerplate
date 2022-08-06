import {
  readdirAsync,
  readFileAsync,
  unlinkAsync,
  writeFileAsync,
} from '@app/utils/filesystem';

describe('server utils', () => {
  test('read directory', async () => {
    await expect(readdirAsync(`${process.cwd()}/src/custom-typings/express`)).resolves.toEqual<string[]>(['index.d.ts']);
    await expect(readdirAsync('/dummy')).rejects.toThrow();
  });

  test('read file', async () => {
    await expect((readFileAsync(`${process.cwd()}/.dockerignore`))).resolves.not.toThrow();
    await expect((readFileAsync('/dummy'))).rejects.toThrow();
  });

  test('unlink file', async () => {
    await expect((unlinkAsync('/dummy'))).rejects.toThrow();
  });

  test('write file', async () => {
    await expect((writeFileAsync('/dummy/foo', ''))).rejects.toThrow();
  });
});

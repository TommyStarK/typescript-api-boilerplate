import {
  decrypt,
  encrypt,
  hash,
} from '@app/utils/crypto';

describe('server utils', () => {
  test('encrypt/decrypt', () => {
    expect(decrypt(encrypt('test'))).toEqual('test');
  });

  test('hash', () => {
    expect(hash('test')).toEqual('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
  });
});

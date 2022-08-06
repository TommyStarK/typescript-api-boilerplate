import { Query } from '@app/backends/postgres/query';

describe('query wrapper', () => {
  test('default', () => {
    const q = new Query('default', []);

    expect(q.query).toEqual('default');
    expect((q.values as []).length).toEqual(0);
  });

  test('custom', () => {
    const q = new Query('foo', ['bar', 'baz']);

    expect(q.query).toEqual('foo');
    expect((q.values as []).length).toEqual(2);
    expect(q.values).toEqual(['bar', 'baz']);

    q.query = 'dummy';
    q.values = ['foo', 'bar', 'baz'];

    expect(q.query).toEqual('dummy');
    expect((q.values as []).length).toEqual(3);
    expect(q.values).toEqual(['foo', 'bar', 'baz']);
  });
});

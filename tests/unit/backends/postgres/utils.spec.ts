/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/quotes */
import { Utils } from '@app/backends/postgres/utils';

describe('database utils', () => {
  const arrayOfObjects: any[] = [
    {
      Id: '123',
      name: 'john'
    }, {
      id: '456',
      name: 'smith'
    }
  ];

  test('test flatten function to return array', () => {
    const expectedValues = Object.values(arrayOfObjects);

    expect(expectedValues).toHaveLength(expectedValues.length);
    expectedValues.forEach((expectedValue) => expect(expectedValues).toContain(expectedValue));
  });

  test('flattenRows should return an empty array if an empty object is passed', () => {
    const emptyObject = {};
    const flattenedArray = Utils.flattenRows([emptyObject]);

    expect(flattenedArray.length).toEqual(0);
  });

  test('expandColumns should return a string in the correct format for 3 rows and 4 columns', () => {
    const stringValues = Utils.expandColumns(3, 4);

    expect(stringValues).toEqual('($1, $2, $3, $4), ($5, $6, $7, $8), ($9, $10, $11, $12)');
  });

  test('expandColumns should throw an error if the number of columns are equal to 0', () => {
    expect(() => Utils.expandColumns(0, 0)).toThrowError('RangeError: Invalid array length');
  });

  test('expandColumns should throw an error if the passed arguments are negative', () => {
    expect(() => Utils.expandColumns(-1, -9)).toThrowError('RangeError: Invalid array length');
  });

  test('parseToSqlInsertString should return the object values in a correctly formatted string ', () => {
    const stringValues = Utils.parseToSqlInsertString(arrayOfObjects);

    expect(stringValues).toEqual(`('123','john'),('456','smith')`);
  });

  test('parseToSqlInsertString should return an empty string when an empty object is passed', () => {
    const stringValues = Utils.parseToSqlInsertString([{}]);

    expect(stringValues).toEqual('()');
  });
});

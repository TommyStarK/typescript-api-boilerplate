/* eslint-disable  max-len */
/* eslint-disable no-plusplus */
export const Utils = {
  /**
  * @param  {any} arr []:  [PartNumbers { partNumber: 'PN20', partName: 'First front left' }, PartNumbers { partNumber: 'PN21', partName: 'Second front left' }]
  * Stringify array of objects to be in SQL insert format
  * @returns string : values formatted ('PN20','First front left'),('PN21','Second front left')
  */
  parseToSqlInsertString: (arr: any[]): string => arr.map((obj: any) => `(${Object.values(obj).map((value) => `'${value}'`)})`).join(','),

  /**
  * @param  {number} rowCount: number of rows will be inserted, ex :3
  * @param  {number} columnCount : number of columns in tables, ex :2
  * @returns string : SQL formatted ($1, $2), ($3, $4), ($5, $6)
  */
  expandColumns: (rowCount: number, columnCount: number): string => {
    let index = 1;

    if (rowCount <= 0 || columnCount <= 0) {
      throw new Error('RangeError: Invalid array length');
    }

    return Array(rowCount).fill(0).map(() => `(${Array(columnCount).fill(0).map(() => `$${index++}`).join(', ')})`).join(', ');
  },

  flattenRows: (arr: any[]): string[] => {
    const properties: string [] = [];
    arr.forEach((v: any) => Object.keys(v).forEach((p: any) => properties.push(v[p])));

    return properties;
  },
};

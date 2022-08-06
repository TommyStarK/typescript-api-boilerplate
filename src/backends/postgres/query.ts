/* eslint-disable no-underscore-dangle */
export class Query {
  public constructor(private _query: string, private _values: any[]) {}

  public get query(): string {
    return this._query;
  }

  public set query(value: string) {
    this._query = value;
  }

  public get values(): any {
    return this._values;
  }

  public set values(value: any) {
    this._values = value;
  }
}

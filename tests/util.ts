import * as entities from '~/entities';
import { createConnection, Connection } from 'typeorm';

export class TypeormUtil {
  static connection: Connection;

  static async connect(): Promise<void> {
    TypeormUtil.connection = await createConnection({
      type: 'sqlite',
      database: process.env.DB_HOST || '',
      entities: Object.values(entities),
    });

    await TypeormUtil.connection.synchronize();
  }

  static async disconnect(): Promise<void> {
    await TypeormUtil.connection.close();
  }
}

export const injectMock = async (items: any, iterator: any): Promise<any[]> => await Promise.all(
  items.map(iterator)
);

export const testSelection = (checked: any, value: any, selection: any[]) =>
  selection.every((key) => checked[key] === value[key])

export const testSelections = (expectedValues: any[], values: any[], selection: any[]) => 
  expectedValues.every((value) => testSelection(
    values.find(({ id }) => value.id == id),
    value,
    selection
  ))
   
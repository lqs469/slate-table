import { Range } from 'immutable';
import { createRow } from './create-row';
import { defaultOptions } from './option';

export function createTable(columns, rows) {
  const rowNodes = Range(0, rows)
    .map(() => createRow(columns))
    .toArray();

  return {
    type: defaultOptions.typeTable,
    children: rowNodes,
    data: {},
  };
}
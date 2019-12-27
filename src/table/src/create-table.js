import { Range } from 'immutable';
import { createRow } from './create-row';
import { defaultOptions } from './option';

export function createTable(opts, columns, rows) {
  const rowNodes = Range(0, rows)
    .map(() => createRow(opts, columns))
    .toArray();

  return {
    type: defaultOptions.typeTable,
    children: rowNodes,
    data: {},
  };
}
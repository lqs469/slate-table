import { Range } from 'immutable';
import { createCell } from './create-cell';
import { defaultOptions } from './option';

export function createRow(columns) {
  const cellNodes = Range(0, columns)
    .map(() => createCell())
    .toArray();

  return {
    type: defaultOptions.typeRow,
    key: `row_${new Date().getTime()}`,
    data: {},
    children: cellNodes,
  };
}
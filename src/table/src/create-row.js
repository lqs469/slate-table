import { Range } from 'immutable';
import { createCell } from './create-cell';
import { defaultOptions } from './option';
import uuidv4 from 'uuid/v4';

export function createRow(columns) {
  const cellNodes = Range(0, columns)
    .map(() => createCell())
    .toArray();

  return {
    type: defaultOptions.typeRow,
    key: `row_${uuidv4()}`,
    data: {},
    children: cellNodes,
  };
}
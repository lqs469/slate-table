import { Range } from 'immutable';
import { defaultOptions } from './options';
import uuidv4 from 'uuid/v4';

export function createTable(columns, rows) {
  const rowNodes = Range(0, rows)
    .map(() => createRow(columns))
    .toArray();

  return {
    type: defaultOptions.typeTable,
    children: rowNodes,
    data: {}
  };
}

export function createRow(columns) {
  const cellNodes = Range(0, columns)
    .map(() => createCell())
    .toArray();

  return {
    type: defaultOptions.typeRow,
    key: `row_${uuidv4()}`,
    data: {},
    children: cellNodes
  };
}

export function createCell({ elements, data = {}, colspan, rowspan } = {}) {
  const { typeCell, typeContent, defaultColumnWidth } = defaultOptions;

  return {
    type: typeCell,
    key: `cell_${uuidv4()}`,
    children: [
      {
        type: typeContent,
        children: elements || [{ type: 'paragraph', children: [{ text: '' }] }]
      }
    ],
    data: {
      width: defaultColumnWidth,
      ...data
    },
    colspan,
    rowspan
  };
}

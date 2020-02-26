import { defaultOptions } from './options';
import uuidv4 from 'uuid';

export function createTable(columns: number, rows: number) {
  const rowNodes = [...new Array(rows)].map(() => createRow(columns));

  return {
    type: defaultOptions.typeTable,
    children: rowNodes,
    data: {},
  };
}

export function createRow(columns: number) {
  const cellNodes = [...new Array(columns)].map(() => createCell());

  return {
    type: defaultOptions.typeRow,
    key: `row_${uuidv4()}`,
    data: {},
    children: cellNodes,
  };
}

export function createCell({
  elements,
  data = {},
  colspan,
  rowspan,
}: {
  elements?: Node;
  data?: any;
  colspan?: number;
  rowspan?: number;
} = {}) {
  const { typeCell, typeContent, defaultColumnWidth } = defaultOptions;

  return {
    type: typeCell,
    key: `cell_${uuidv4()}`,
    children: [
      {
        type: typeContent,
        children: elements || [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ],
    data: {
      width: defaultColumnWidth,
      ...data,
    },
    colspan,
    rowspan,
  };
}

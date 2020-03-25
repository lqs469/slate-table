import { v4 as uuid } from 'uuid';
import { Node, Element } from 'slate';

export function createTable(columns: number, rows: number): any {
  const rowNodes = [...new Array(rows)].map(() => createRow(columns));

  return {
    type: 'table',
    children: rowNodes,
    data: {},
  };
}

export interface Row extends Element {
  type: 'table-row';
  key: string;
  data: any;
  children: Cell[];
}

export function createRow(columns: number): Row {
  const cellNodes = [...new Array(columns)].map(() => createCell());

  return {
    type: 'table-row',
    key: `row_${uuid()}`,
    data: {},
    children: cellNodes,
  };
}

export interface Cell extends Element {
  type: 'table-cell';
  key: string;
  rowspan?: number;
  colspan?: number;
  width?: number;
  height?: number;
  selectedCell?: boolean;
  children: Node[];
}

export function createCell({
  elements,
  colspan,
  rowspan,
  height,
  width,
}: {
  elements?: Node[];
  height?: number;
  width?: number;
  colspan?: number;
  rowspan?: number;
} = {}): Cell {
  const content = createContent(elements);

  return {
    type: 'table-cell',
    key: `cell_${uuid()}`,
    children: [content],
    width: width,
    height: height,
    colspan,
    rowspan,
  };
}

export interface TableContent extends Element {
  type: 'table-content';
  children: Node[];
}

export function createContent(elements?: Node[]): TableContent {
  return {
    type: 'table-content',
    children: elements || [{ type: 'paragraph', children: [{ text: '' }] }],
  };
}

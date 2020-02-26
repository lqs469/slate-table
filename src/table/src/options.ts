import { CSSProperties } from 'react';

export const defaultOptions: {
  [key: string]: any;
} = {
  typeCell: 'editable_table_cell',
  typeRow: 'editable_table_row',
  typeTable: 'editable_table',
  typeContent: 'editable_table_content',
  selectionColor: '#B9D3FC',
  minimumCellWidth: 100,
  tableStyle: {
    borderSpacing: 0,
    Layout: 'fixed',
    wordBreak: 'break-word',
  } as CSSProperties,
  defaultColumnWidth: 100,
};

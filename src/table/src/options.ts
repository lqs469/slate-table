import { CSSProperties } from 'react';

export const defaultOptions = {
  typeCell: 'editable_table_cell' as string,
  typeRow: 'editable_table_row' as string,
  typeTable: 'editable_table' as string,
  typeContent: 'editable_table_content' as string,
  selectionColor: '#B9D3FC' as string,
  minimumCellWidth: 100 as number,
  defaultColumnWidth: 100 as number,
  tableStyle: {
    borderSpacing: 0,
    Layout: 'fixed',
    wordBreak: 'break-word',
  } as CSSProperties,
};

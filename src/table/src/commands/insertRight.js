import { Editor, Transforms } from 'slate';
// import { TableLayout } from '../layout';

import { createCell } from '../create-cell';
import { defaultOptions } from '../option';

export default function insertRight(editor, opts) {
  // const table = TableLayout.create(editor, opts);
  // if (!table) return editor;
  // const columnIndex = typeof at !== 'undefined' ? at : table.columnIndex;

  // const added = {};
  // if (table.table[0].length === columnIndex) {
  //   table.table.forEach((row, i) => {
  //     const cell = row[columnIndex];
  //     const rowKey = table.currentTable.nodes.get(i).key;
  //     const newCell = createCell(opts, '');
  //     editor.insertNodeByKey(rowKey, cell.nodeIndex + 1, newCell);
  //   });
  // } else {
  //   table.table.forEach(row => {
  //     const cell = row[columnIndex];
  //     if (cell.colspan === 1 || table.table.length === 1) {
  //       if (added[cell.rowKey]) return;
  //       const newCell = createCell(opts, '', { rowspan: `${cell.rowspan}` });
  //       editor.insertNodeByKey(cell.rowKey, cell.nodeIndex + 1, newCell);
  //       added[cell.rowKey] = true;
  //     } else {
  //       editor.setNodeByKey(cell.key, {
  //         type: cell.block.type,
  //         data: { ...cell.block.data.toObject(), colspan: cell.colspan + 1 },
  //       });
  //     }
  //   });
  // }

  const allPath = editor.selection.anchor.path;

  const matchRows = [...Editor.nodes(editor, {
    at: [],
    match: n => n.type === defaultOptions.typeRow,
  })];
  
  matchRows.forEach(([, rowPath]) => {
    const at = allPath.map((item, index) =>
      typeof rowPath[index] === 'number'
        ? rowPath[index]
        : item
    );

    const [[matchCell, path]] = Editor.nodes(editor, {
      at,
      match: n => n.type === defaultOptions.typeCell,
    });

    path[path.length - 1]++;

    const newCell = createCell(opts, '');
    Transforms.insertNodes(editor, newCell, {
      at: path,
      match: n => n.key === matchCell.key,
    });
  });
}



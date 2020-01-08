import { Editor, Transforms } from 'slate';
import { defaultOptions } from '../option';
import removeTable from './removeTable';

export default function removeColumn(editor) {
  // const table = TableLayout.create(editor, opts);
  // if (!table) return editor;
  // const columnIndex = typeof at === 'undefined' ? table.columnIndex : at;

  // editor.withoutNormalizing(() => {
  //   table.filterHorizontalMergedCellsBy(columnIndex).forEach(cell => {
  //     editor.setNodeByKey(cell.key, {
  //       type: cell.block.type,
  //       data: { ...cell.block.data.toObject(), colspan: cell.colspan - 1 },
  //     });
  //   });

  //   // Remove the cell from every row
  //   if (table.width > 1) {
  //     table.table.forEach((row, index) => {
  //       const cell = row[columnIndex];
  //       if (cell.colspan === 1) {
  //         editor.removeNodeByKey(cell.key);
  //       }
  //       if (cell.rowBlock.nodes.size === 1 && cell.colspan === 1) {
  //         table.getRows(index).forEach(cell => {
  //           if (cell.rowspan > 1) {
  //             editor.setNodeByKey(cell.key, {
  //               type: cell.block.type,
  //               data: { ...cell.block.data.toObject(), rowspan: cell.rowspan - 1 },
  //             });
  //           }
  //         });
  //         editor.removeNodeByKey(cell.rowBlock.key);
  //       }
  //     });
  //   } else {
  //     // If last column, clear text in cells instead
  //     editor.removeNodeByKey(table.currentTable.key);
  //   }
  // });

  const allPath = editor.selection.anchor.path;

  const matchRows = [...Editor.nodes(editor, {
    at: [editor.selection.anchor.path[0]],
    match: n => n.type === defaultOptions.typeRow,
  })];

  const [[matchRow]] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeRow,
  })];


  if (matchRow.children.length < 2) {
    removeTable(editor);
    return;
  }
  
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
    
    Transforms.removeNodes(editor, {
      at: path,
      match: n => n.key === matchCell.key,
    });
  });
}
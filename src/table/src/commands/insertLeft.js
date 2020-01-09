import { Editor, Transforms } from 'slate';
import { createCell } from '../create-cell';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';

export default function insertLeft(editor) {
  const { selection } = editor;
  if (!selection) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;

  const [targetHead] = [...Editor.nodes(editor, {
    at: editor.selection.anchor.path,
    match: n => n.type === defaultOptions.typeCell,
  })];
  if (!targetHead) return;

  const {
    gridTable,
    insertPosition,
    getCell,
  } = splitedTable(editor, table, targetHead);

  const x = insertPosition.path[insertPosition.path.length - 1];

  const insertCells = new Map();
  let checkInsertable = true;

  gridTable.forEach(row => {
    const col = row[x];
    if (col.isReal) {
      insertCells.set(col.cell.key, col);
    } else {
      const [originCell] = getCell(n =>
        (n.cell.key === col.cell.key && n.isReal)
      );
      const { cell, path } = originCell;

      if (path[path.length - 1] === x) {
        insertCells.set(cell.key, originCell);
      } else {
        checkInsertable = false;
        return;
      }
    }
  });

  if (!checkInsertable) {
    return;
  }

  insertCells.forEach(({ cell, isReal }) => {
    if (isReal) {
      const [targetCell] = [...Editor.nodes(editor, {
        at: table[1],
        match: n => n.key === cell.key,
      })];
  
      const newCell = createCell({
        rowspan: cell.rowspan || 1,
      });

      Transforms.insertNodes(editor, newCell, {
        at: targetCell[1],
      });
    }
  });
}



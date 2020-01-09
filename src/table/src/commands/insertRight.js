import { Editor, Transforms, Path } from 'slate';
import { createCell } from '../create-cell';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';

export default function insertRight(editor) {
  const { selection } = editor;
  if (!selection) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;
  const xPosition = table[1].length + 1;

  const [targetHead] = [...Editor.nodes(editor, {
    at: editor.selection.anchor.path,
    match: n => n.type === defaultOptions.typeCell,
  })];
  if (!targetHead) return;

  const {
    gridTable,
    insertPosition: iP,
    getCell,
  } = splitedTable(editor, table, targetHead);
  
  const x = iP.path[xPosition] + (iP.cell.colspan || 1) - 1;
  
  const insertCellsMap = new Map();
  let checkInsertable = true;

  gridTable.forEach(row => {
    const col = row[x];

    const [originCell] = getCell(n =>
      (n.cell.key === col.cell.key && n.isReal)
    );
    const { cell, path } = originCell;

    if (
      (col.isReal && (!col.cell.colspan || col.cell.colspan === 1))
      || !row[x + 1]
    ) {
      insertCellsMap.set(cell.key, originCell);
    } else {
      if (
        path[xPosition] + (cell.colspan || 1) - 1 === x
      ) {
        insertCellsMap.set(cell.key, originCell);
      } else {
        checkInsertable = false;
        return;
      }
    }
  });

  if (!checkInsertable) {
    return;
  }

  insertCellsMap.forEach(({ cell, isReal }) => {
    if (isReal) {
      const [targetCell] = [...Editor.nodes(editor, {
        at: table[1],
        match: n => n.key === cell.key,
      })];
  
      const newCell = createCell({
        rowspan: cell.rowspan || 1,
      });

      Transforms.insertNodes(editor, newCell, {
        at: Path.next(targetCell[1]),
      });
    }
  });
}



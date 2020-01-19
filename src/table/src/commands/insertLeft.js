import { Editor, Transforms } from 'slate';
import { createCell } from '../creator';
import { splitedTable } from '../selection';

export default function insertLeft(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const xPosition = table[1].length + 1;

  const { gridTable, getCell } = splitedTable(editor, table);
  
  const [startCell] = getCell(n => n.cell.key === startKey);
  const [endCell] = getCell(n => n.cell.key === endKey);
  
  const insertPosition = startCell.path[xPosition] < endCell.path[xPosition]
    ? startCell
    : endCell;

  const x = insertPosition.path[xPosition];

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

      if (path[xPosition] === x) {
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



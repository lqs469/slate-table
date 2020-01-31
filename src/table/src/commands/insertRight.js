import { Editor, Transforms, Path } from 'slate';
import { createCell } from '../creator';
import { splitedTable } from '../selection';

export default function insertRight(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const xPosition = table[1].length + 1;

  const { gridTable, getCell } = splitedTable(editor, table);

  const [startCell] = getCell(n => n.cell.key === startKey);
  const [endCell] = getCell(n => n.cell.key === endKey);

  const iP =
    startCell.path[xPosition] > endCell.path[xPosition] ? startCell : endCell;

  const x = iP.path[xPosition] + (iP.cell.colspan || 1) - 1;

  const insertCellsMap = new Map();
  let checkInsertable = true;

  gridTable.forEach(row => {
    const col = row[x];

    const [originCell] = getCell(n => n.cell.key === col.cell.key && n.isReal);
    const { cell, path } = originCell;

    if (
      (col.isReal && (!col.cell.colspan || col.cell.colspan === 1)) ||
      !row[x + 1]
    ) {
      insertCellsMap.set(cell.key, originCell);
    } else {
      if (path[xPosition] + (cell.colspan || 1) - 1 === x) {
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
      const [targetCell] = [
        ...Editor.nodes(editor, {
          at: table[1],
          match: n => n.key === cell.key,
        }),
      ];

      const newCell = createCell({
        rowspan: cell.rowspan || 1,
      });

      Transforms.insertNodes(editor, newCell, {
        at: Path.next(targetCell[1]),
      });
    }
  });
}

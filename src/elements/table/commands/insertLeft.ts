import { Editor, Transforms, NodeEntry } from 'slate';
import { splitedTable, Col } from '../selection';
import { createCell } from '../creator';

export function insertLeft(table: NodeEntry, editor: Editor) {
  const { selection } = editor;
  if (!selection || !table) return;

  const xIndex = table[1].length + 1;

  const { gridTable, getCol } = splitedTable(editor, table);

  const [startCell] = Editor.nodes(editor, {
    match: n => n.type === 'table-cell',
  });

  const [insertPositionCol] = getCol(
    (c: Col) => c.cell.key === startCell[0].key && c.isReal
  );

  const x = insertPositionCol.path[xIndex];

  const insertCols = new Map<string, Col>();
  let checkInsertable = true;

  gridTable.forEach((row: Col[]) => {
    const col = row[x];

    if (col.isReal) {
      insertCols.set(col.cell.key, col);
    } else {
      const [originCol] = getCol(
        (n: Col) => n.cell.key === col.cell.key && n.isReal
      );
      const { cell, path } = originCol;

      if (path[xIndex] === x) {
        insertCols.set(cell.key, originCol);
      } else {
        checkInsertable = false;
        return;
      }
    }
  });

  if (!checkInsertable) {
    return;
  }

  insertCols.forEach((col: Col) => {
    const newCell = createCell({
      rowspan: col.cell.rowspan || 1,
    });

    Transforms.insertNodes(editor, newCell, {
      at: col.originPath,
    });
  });
}

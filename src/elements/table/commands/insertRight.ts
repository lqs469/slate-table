import { Editor, Transforms, Path, NodeEntry } from 'slate';
import { splitedTable, Col } from '../selection';
import { createCell } from '../creator';

export function insertRight(table: NodeEntry, editor: Editor) {
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

  const x =
    insertPositionCol.path[xIndex] + (insertPositionCol.cell.colspan || 1) - 1;

  const insertCols = new Map<string, Col>();
  let checkInsertable = true;

  gridTable.forEach((row: Col[]) => {
    const col = row[x];

    const [originCol] = getCol(
      (n: Col) => n.cell.key === col.cell.key && n.isReal
    );

    const { cell, path } = originCol;

    if (
      !row[x + 1] ||
      (col.isReal && (!col.cell.colspan || col.cell.colspan === 1))
    ) {
      insertCols.set(cell.key, originCol);
    } else {
      if (path[xIndex] + (cell.colspan || 1) - 1 === x) {
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
      at: Path.next(col.originPath),
    });
  });
}

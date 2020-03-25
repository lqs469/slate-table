import { Editor, Transforms, NodeEntry } from 'slate';
import { splitedTable, Col } from '../selection';
import { createRow } from '../creator';

export function insertAbove(table: NodeEntry, editor: Editor) {
  const { selection } = editor;
  if (!selection || !table) return;

  const yIndex = table[1].length;

  const { gridTable, getCol } = splitedTable(editor, table);

  const [startCell] = Editor.nodes(editor, {
    match: n => n.type === 'table-cell',
  });

  const [insertPositionCol] = getCol(
    (c: Col) => c.cell.key === startCell[0].key && c.isReal
  );

  let checkInsertEnable = true;
  const insertYIndex = insertPositionCol.path[yIndex];
  const insertCols = new Map<string, Col>();

  gridTable[insertYIndex].forEach((col: Col) => {
    if (!col.isReal) {
      const [originCol] = getCol(
        (c: Col) => c.isReal && c.cell.key === col.cell.key
      );

      if (originCol.path[yIndex] === insertYIndex) {
        insertCols.set(originCol.cell.key, originCol);
      } else {
        checkInsertEnable = false;
        return;
      }
    } else {
      insertCols.set(col.cell.key, col);
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  const newRow = createRow(insertCols.size);

  [...insertCols.values()].forEach((col, index) => {
    newRow.children[index].colspan = col.cell.colspan || 1;
  });

  const [[, path]] = Editor.nodes(editor, {
    match: n => n.type === 'table-row',
  });

  Transforms.insertNodes(editor, newRow, {
    at: path,
  });
}

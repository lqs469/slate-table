import { Editor, Transforms } from 'slate';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';
import { createRow } from '../creator';

export default function insertAbove(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const yPosition = table[1].length;

  const { gridTable, getCell } = splitedTable(editor, table);
  
  const [startCell] = getCell(n => n.cell.key === startKey);
  const [endCell] = getCell(n => n.cell.key === endKey);
  
  const insertPosition = startCell.path[yPosition] < endCell.path[yPosition]
    ? startCell
    : endCell;

  let checkInsertEnable = true;
  const insertCells = new Map();

  gridTable[insertPosition.path[yPosition]].forEach(col => {
    if (!col.isReal) {
      const [originCol] = getCell(n => n.isReal && n.cell.key === col.cell.key);

      if (originCol.path[yPosition] === insertPosition.path[yPosition]) {
        insertCells.set(originCol.cell.key, originCol);
      } else {
        checkInsertEnable = false;
        return;
      }
    } else {
      insertCells.set(col.cell.key, col);
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  const newRow = createRow(insertCells.size);
  [...insertCells.values()].forEach((value, index) => {
    newRow.children[index].colspan = value.cell.colspan || 1;
  });
  
  const [[, path]] = Editor.nodes(editor, {
    at: insertPosition.originPath,
    match: n => n.type === defaultOptions.typeRow,
  });
  
  
  Transforms.insertNodes(editor, newRow, {
    at: path,
  });
}
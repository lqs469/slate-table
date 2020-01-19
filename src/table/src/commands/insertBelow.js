import { Editor, Transforms, Path } from 'slate';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';
import { createRow } from '../create-row';

export default function insertBelow(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const yPosition = table[1].length;

  const { gridTable, getCell } = splitedTable(editor, table);
  
  const [startCell] = getCell(n => n.cell.key === startKey);
  const [endCell] = getCell(n => n.cell.key === endKey);
  if (!startCell || !endCell) return;
  
  const iP = startCell.path[yPosition] > endCell.path[yPosition]
    ? startCell
    : endCell;

  let checkInsertEnable = true;
  const insertCells = new Map();

  
  const y = iP.path[yPosition] + (iP.cell.rowspan || 1) - 1;

  gridTable[y].forEach(col => {
    const [originCell] = getCell(n => n.isReal && n.cell.key === col.cell.key);
    const { cell, path } = originCell;

    if (!gridTable[y + 1]) {
      insertCells.set(cell.key, originCell);
    } else if ((path[yPosition] + (cell.rowspan || 1) - 1) === y) {
      insertCells.set(cell.key, originCell);
    } else {
      checkInsertEnable = false;
      return;
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  let foundRealCell = null;
  const newRow = createRow(insertCells.size);
  [...insertCells.values()].forEach((value, index) => {
    newRow.children[index].colspan = value.cell.colspan || 1;

    if (
      !foundRealCell
      && (!value.cell.rowspan || value.cell.rowspan === 1)
    ) {
      foundRealCell = value;
    }
  });
  
  const [[, path]] = Editor.nodes(editor, {
    at: foundRealCell.originPath,
    match: n => n.type === defaultOptions.typeRow,
  });
  
  Transforms.insertNodes(editor, newRow, {
    at: Path.next(path),
  });
}
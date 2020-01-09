import { Editor, Transforms } from 'slate';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';
import { createRow } from '../create-row';

export default function insertAbove(editor) {
  const { selection } = editor;
  if (!selection) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;
  const yPosition = table[1].length;

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
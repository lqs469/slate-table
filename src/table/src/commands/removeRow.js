import { Transforms } from 'slate';
import { defaultOptions } from '../options';
import { splitedTable } from '../selection';
import splitCell from './splitCell';

export default function removeRow(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;
  
  const { gridTable } = splitedTable(editor, table);
  const yPosition = table[1].length;

  let yStart = gridTable.length;
  let yEnd = 0;
  gridTable.forEach(row => {
    row.forEach(col => {
      if (col.cell.key === startKey || col.cell.key === endKey) {
        yStart = Math.min(yStart, col.path[yPosition]);
        yEnd = Math.max(yEnd, col.path[yPosition]);
      }
    });
  });

  const splitStartKey = gridTable[yStart][0].cell.key;
  const splitEndKey = gridTable[yEnd][gridTable[0].length - 1].cell.key;

  splitCell.call({ table }, editor, splitStartKey, splitEndKey);

  const { gridTable: splitedGridTable } = splitedTable(editor, table);
  
  const removedCells = splitedGridTable
    .slice(yStart, yEnd + 1)
    .reduce((p, c) => [...p, ...c], []);

  removedCells.forEach(cell => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.cell.key,
    });
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== defaultOptions.typeRow) {
        return false;
      }
      
      if (!n.children) {
        return true;
      }

      const found = n.children.findIndex(col => col.type === defaultOptions.typeCell);
      if (found === -1) {
        return true;
      }
    }
  });
}
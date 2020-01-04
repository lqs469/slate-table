import { Editor, Transforms } from 'slate';
import { createCell } from '../create-cell';
import { defaultOptions } from '../option';

// import { mergeCells } from './merge';
// import { ComponentStore } from '../store';

export default function mergeSelection(editor) {
  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;

  const tableDepth = table[1].length;
  let selectedCells = [...Editor.nodes(editor, {
    at: table[1],
    match: n => !!n.selectionColor,
  })];

  if (!selectedCells || selectedCells.length < 2) return;

  console.log(selectedCells);

  const head = selectedCells[0];
  // const tail = selectedCells[selectedCells.length - 1];

  const tmpContent = [];

  

  selectedCells.forEach(cell => {
    const [currContent] = [...Editor.nodes(editor, {
      at: cell[1],
      match: n => n.type === defaultOptions.typeContent,
    })];
    
    if (
      currContent
      && currContent[0].children
      && currContent[0].children.length
    ) {
      tmpContent.push(...currContent[0].children);
    }
  });

  let rowCount = 0;
  let colCount = 0;
  let widthCount = 0;
  const baseRow = head[1].slice(tableDepth)[0];
  const baseCol = head[1].slice(tableDepth)[1];

  const _table = [];
  selectedCells.forEach(([cell, path]) => {
    let [y, x] = path.slice(tableDepth);
    y = y - baseRow;
    x = x - baseCol;

    if (!_table[y]) {
      _table[y] = [];
    }
    _table[y][x] = [cell, path];
  });

  _table.forEach(row => {
    let currCol = 0;
    let currRow = 0;
    row.forEach(([col]) => {
      currCol += (+col.data.colspan || 1);
      currRow = Math.max(currRow, +col.data.rowspan || 1);
      widthCount += +col.data.width;
    });
    colCount = Math.max(colCount, currCol);
    rowCount += currRow;
  })

  selectedCells.forEach(([cell]) => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.key,
    });
  });

  const newCell = createCell(tmpContent, {
    colspan: colCount,
    rowspan: rowCount,
    width: widthCount,
  });

  Transforms.insertNodes(editor, newCell, {
    at: head[1],
    match: n => n.key === head[0].key,
  });
}
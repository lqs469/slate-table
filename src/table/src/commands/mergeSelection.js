import { Editor, Transforms } from 'slate';
import { createCell } from '../create-cell';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';

// import { mergeCells } from './merge';
// import { ComponentStore } from '../store';

export default function mergeSelection(editor) {
  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];

  if (!table) return;
  const tableDepth = table[1].length;

  const { cells, cellMap, cellReMap, cellWidth } = splitedTable(editor, table);

  console.log(cells, cellMap, cellReMap);

  let selectedCells = [...Editor.nodes(editor, {
    at: table[1],
    match: n => !!n.selectionColor,
  })];

  if (!selectedCells || selectedCells.length < 2) return;

  const head = Object.assign({}, selectedCells[0]);
  console.log(selectedCells);

  selectedCells.forEach(([, path], index) => {
    if (cellMap[path.join('')]) {
      selectedCells[index][1] = cellMap[path.join('')].split('').map(item => parseInt(item, 10));
    }
  });
  
  console.log('🔥', selectedCells);

  

  const tmpContent = [];

  selectedCells.forEach(cell => {
    let at = cell[1];
    if (cellReMap[at.join('')]) {
      at = cellReMap[at.join('')].split('').map(item => parseInt(item, 10));
    }

    const [currContent] = [...Editor.nodes(editor, {
      at,
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

  let widthCount = 0;
  const baseRow = selectedCells[0][1].slice(tableDepth)[0];
  const baseCol = selectedCells[0][1].slice(tableDepth)[1];

  const _table = [];
  selectedCells.forEach(([cell, path]) => {
    let [y, x] = path.slice(tableDepth);
    y = y - baseRow;
    x = x - baseCol;

    const h = cell.data && +cell.data.rowspan > 1 ? +cell.data.rowspan : 1;
    const w = cell.data && +cell.data.colspan > 1 ? +cell.data.colspan : 1;

    for (let i = y; i < y + h; i++) {
      for (let j = x; j < x + w; j++) {
        if (!_table[i]) {
          _table[i] = [];
        }

        _table[i][j] = [cell, path];
      }
    }
  });

  console.log('🎩', _table);
  
  let shouldMerge = true;
  let rowCount = _table.length;
  let colCount = _table[0].length;
  _table.forEach((row, index) => {
    if (row.length !== colCount) {
      shouldMerge = false;
      return;
    }

    if (index !== 0 && row.length === cellWidth) {
      rowCount--;
    }
  });

  if (!shouldMerge) {
    alert('无法合并');
    return;
  }

  selectedCells.forEach(([cell, path]) => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.key,
    });

    let at = path;
    if (cellReMap[at.join('')]) {
      at = cellReMap[at.join('')].split('').map(item => parseInt(item, 10));
    }
    console.log(at);
    const td = [...Editor.nodes(editor, {
      at: at.slice(0, at.length - 1),
      match: n => n.type === defaultOptions.typeCell,
    })];

    if (td.length === 0 && path[tableDepth] !== head[1][tableDepth]) {
      Transforms.removeNodes(editor, {
        at: path.slice(0, path.length - 1),
        match: n => n.type === defaultOptions.typeRow,
      });
    }
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
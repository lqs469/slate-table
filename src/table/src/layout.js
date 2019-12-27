import { defaultOptions } from './option';

const isBlock = (block) => {
  console.log('[layout.js]🤯[isBlock]', block);
  return true;
}

// INFO: Deprecated.
//       Use createLayout and create new function to create cell's Dictionary
function buildTableLayout(nodes) {
  const layout = createLayout(nodes);
  const keyDict = layout.reduce(
    (acc, row) => {
      row.forEach(cell => {
        if (acc[cell.key]) return;
        acc[cell.key] = cell;
      });
      return acc;
    },
    {},
  );
  return { layout, keyDict };
}

export function createLayout(rows) {
  const rowLength = rows.length;
  const colLength = Math.max(
    ...Array.from(rows).map(node => {
      // if (!isBlock(node)) return 0;
      return node.children.reduce((acc = 0, n) => {
        // if (!isBlock(n)) return acc;
        return acc + ((n.data && +n.data.colspan) || 1);
      }, 0);
    }),
  );

  const layout = [];
  for (let row = 0, cellY = 0; row < rowLength; row++, cellY++) {
    let nodeIndex = 0;
    let cellX = 0;
    for (let col = 0; col < colLength; col++) {
      if (layout[row] && layout[row][col]) {
        continue;
      }
      if (!layout[row]) {
        layout[row] = [];
      }
      const rowBlock = rows[cellY];
      // if (!isBlock(rowBlock)) continue;
      const cell = rowBlock && rowBlock.children[nodeIndex];
      const rowKey = rowBlock.key;
      if (!cell) {
        throw new Error('[slate-editable-table-plugin]: Should cell exist');
      }
      const key = cell.key;
      const colspan = Number((cell && cell.data.colspan) || 1);
      const rowspan = Number((cell && cell.data.rowspan) || 1);
      
      layout[row][col] = {
        key,
        row,
        col,
        colspan,
        rowspan,
        block: cell,
        rowKey,
        rowBlock,
        nodeIndex,
        isLeftOfMergedCell: cellX === 0,
        isTopOfMergedCell: rowspan > 1,
      };

      if (rowspan > 1) {
        for (let r = 0; r < rowspan - 1; r++) {
          if (!layout[row + r + 1]) {
            layout[row + r + 1] = [];
          }
          layout[row + r + 1][col] = {
            key,
            row: row + r + 1,
            col,
            colspan,
            rowspan,
            block: cell,
            rowKey,
            nodeIndex,
            rowBlock: rowBlock,
            isLeftOfMergedCell: cellX === 0,
            isTopOfMergedCell: false,
          };
        }
      }

      if (cellX === colspan - 1) {
        cellX = 0;
        nodeIndex++;
      } else {
        cellX++;
      }
    }
  }

  return layout;
}

// Deprecated
export class TableLayout {
  constructor(TableLayout, dict, table, row, cell) {
    this.table = TableLayout;
    this.keyDict = dict;
    this.currentTable = table;
    this.row = row;
    this.cell = cell;
  }

  get col() {
    return this.table[0].length;
  }

  get firstRow() {
    return this.table[0];
  }

  get firstColumn() {
    return this.table.map(row => {
      return row[0];
    });
  }

  get lastRow() {
    return this.table[this.table.length - 1];
  }

  get lastColumn() {
    return this.table.map(row => {
      return row[row.length - 1];
    });
  }

  get rowIndex() {
    const { currentTable, row } = this;
    const rows = currentTable.nodes;
    return rows.findIndex(x => x === row);
  }

  get width() {
    const { table } = this;
    return table[0].length;
  }

  get height() {
    const { currentTable } = this;
    const rows = currentTable.nodes;

    return rows.size;
  }

  get columnIndex() {
    const { row, cell } = this;
    const cells = row.nodes;
    const r = cells.reduce(
      (acc = { has: false, pos: 0, prevColspan: 0 }, x) => {
        if (!isBlock(x)) return acc;
        const colspan = Number(x.data.get('colspan') || 1);
        const pos = acc.has ? acc.pos : acc.pos + acc.prevColspan;
        return {
          has: acc.has || x === cell,
          pos,
          prevColspan: colspan,
        };
      },
      { has: false, pos: 0, prevColspan: 0 },
    );
    return r.has ? r.pos : -1;
  }

  isTopOfMergedCell() {}

  findCellBy(key) {
    for (let row of this.table) {
      for (let cell of row) {
        if (cell.key === key) return cell;
      }
    }
  }

  findNextRowKey() {
    const next = this.table[this.rowIndex + 1];
    return next[0].rowKey;
  }

  filterHorizontalMergedCellsBy(columnIndex) {
    const cells = [];
    this.table.forEach(row => {
      const cell = row[columnIndex];
      if (cell.colspan > 1) {
        cells.push(cell);
      }
    });

    return cells;
  }

  filterVerticalMergedCellsBy(rowIndex) {
    return this.table[rowIndex].filter(cell => cell.rowspan > 1);
  }

  getRows(rowIndex) {
    return this.table[rowIndex];
  }

  findBelow(key) {
    const cell = this.findCellBy(key);
    if (!cell) return;
    let y = 0;
    let t = this.table[cell.row][cell.col];
    while (t && t.key === key) {
      y++;
      if (!this.table[cell.row + y] || !this.table[cell.row + y][cell.col]) return;
      t = this.table[cell.row + y][cell.col];
    }
    return t;
  }

  getNextRowSize(key) {
    const cell = this.findCellBy(key);
    if (!cell) return 0;
    let y = 0;
    let l = 0;
    let t = this.table[cell.row][cell.col];
    while (t && t.key === key) {
      y++;
      l = this.table[cell.row + y].length;
      t = this.table[cell.row + y][cell.col];
    }
    return l;
  }

  getRight(key) {
    const cell = this.findCellBy(key);
    if (!cell) return;
    let x = 0;
    let t = this.table[cell.row][cell.col + x];
    while (t && t.key === key) {
      x++;
      t = this.table[cell.row][cell.col + x];
    }
    return t;
  }

  isLastColumn(key) {
    return this.lastColumn.some(c => c.key === key);
  }

  isLastRow(key) {
    return this.lastRow.some(r => r.key === key);
  }

  static create(editor, opts) {
    if (!editor) return null;
    
    const table = findCurrentTable(editor, opts);
    if (!table) return null;

    const nodes = table.children;

    // const nodes = table && ((table).getNode(table.key).nodes);
    if (!nodes) return null;
    
    const { layout, keyDict } = buildTableLayout(nodes);

    debugger
    const currentCell = TableLayout.currentCell(editor, opts);
    const currentRow = TableLayout.currentRow(editor, opts);
    const currentTable = TableLayout.currentTable(editor, opts);

    if (!currentCell) return null;

    return new TableLayout(layout, keyDict, currentTable, currentRow, currentCell);
  }

  static currentCell(editor, opts) {
    return findStartCell(editor, opts);
  }

  static findBlock(editor, type) {
    const { value } = editor;
    return value.document.getClosest(value.startBlock.key, p => {
      if (!isBlock(p)) return false;
      return p.type === type;
    });
  }

  static findRowBlock(editor, index, opts) {
    const table = TableLayout.currentTable(editor, opts);
    if (!table) return;
    const block = table.nodes.get(index);
    return isBlock(block) ? block : undefined;
  }

  static currentRow(editor, opts) {
    return TableLayout.findBlock(editor, opts.typeRow);
  }

  static currentTable(editor, opts) {
    return TableLayout.findBlock(editor, opts.typeTable);
  }

  static isInCell(editor, opts = defaultOptions) {
    const { value } = editor;
    const { startBlock } = value;
    return startBlock.type === opts.typeCell ||
      value.document.getClosest(startBlock.key, p => {
        if (!isBlock(p)) return false;
        return p.type === opts.typeCell;
      })
      ? true
      : false;
  }
}

export function findCurrentTable(editor, opts = defaultOptions) {
  if (!editor) return null;

  return editor.children.find(item => item.type === opts.typeTable);

  // const { value } = editor;
  // const { startBlock } = value;
  // if (!startBlock) return null;
  // const table = value.document.getClosest(startBlock.key, (p) => (p).type === opts.typeTable);
  // if (!table) return null;
  // if (!isBlock(table)) return null;
  // return table;
}

export function findCurrentRow(editor, opts = defaultOptions) {
  const { value } = editor;
  return (
    (value.document.getClosest(value.startBlock.key, p => {
      if (!isBlock(p)) return false;
      return p.type === opts.typeRow;
    })) || null
  );
}

export function findBlock(editor, type) {
  const { value } = editor;
  const b = value.document.getClosest(value.startBlock.key, p => {
    if (!isBlock(p)) return false;
    return p.type === type;
  });
  return b ? b : null;
}

// INFO: We can not get expected block with Value.focusBlock.
//       We need to do some investigation about it.
//       For now find focus cell with window.getSelection.
export function findFocusCell(editor, opts = defaultOptions) {
  const selection = window.getSelection();
  if (!selection) return null;
  const focused = selection.focusNode;
  if (!focused) return null;
  return findCellBlockByElement(editor, focused, opts);
}

// INFO: We can not get expected block with Value.anchorBlock.
//       We need to do some investigation about it.
//       For now find anchor cell with window.getSelection.
export function findAnchorCell(editor, opts) {
  const selection = window.getSelection();
  if (!selection) return null;
  const anchored = selection.anchorNode;
  if (!anchored) return null;
  return findCellBlockByElement(editor, anchored, opts);
}

export function findStartCell(editor, opts) {
  const { startBlock } = editor.value;
  return startBlock.type === opts.typeCell
    ? startBlock
    : TableLayout.findBlock(editor, opts.typeCell);
}

export function findClosestKey(el) {
  if (el.dataset && el.dataset.key) {
    return el.dataset.key;
  }
  if (!el.parentElement) {
    return null;
  }
  return findClosestKey(el.parentElement);
}

export function findCellBlockByElement(editor, el, opts = defaultOptions) {
  // const { value } = editor;
  const key = findClosestKey(el);
  if (typeof key === 'undefined' || key === null) {
    return null;
  }

  return key;

  // const found = value.document.getClosest(key, p => {
  //   if (!isBlock(p)) return false;
  //   if (p.type === opts.typeRow) {
  //     return true;
  //   }
  //   return p.type === opts.typeCell;
  // });

  // if (found.type === opts.typeCell) {
  //   return found;
  // }

  // if (found.type === opts.typeRow) {
  //   return found.nodes.find(cell => {
  //     if (!isBlock(cell)) return false;
  //     return cell.key === key;
  //   });
  // }
  // return null;
}

export function findLeftTopPosition(anchor, focus) {
  return [Math.min(anchor.row, focus.row), Math.min(anchor.col, focus.col)];
}

export function createSelectedCellRange(anchor, focus) {
  const start = {
    row: Math.min(anchor.row, focus.row),
    col: Math.min(anchor.col, focus.col),
  };
  const end = {
    row: Math.max(anchor.row, focus.row),
    col: Math.max(anchor.col, focus.col),
  };
  return { start, end };
}

export function calculateSelectedCellSize(anchor, focus) {
  const height = Math.abs(anchor.row - focus.row) + (anchor.row < focus.row ? focus.rowspan : anchor.rowspan);
  const width = Math.abs(anchor.col - focus.col) + (anchor.col < focus.col ? focus.colspan : anchor.colspan);
  return { width, height };
}

export function createSelectedBlockMap(
  editor,
  anchorKey,
  focusKey,
  opts,
) {
  const t = TableLayout.create(editor, opts);
  if (!t) return {};
  const anchor = t.keyDict[anchorKey];
  const focus = t.keyDict[focusKey];
  if (!anchor || !focus) return {};
  const { start, end } = createSelectedCellRange(anchor, focus);
  return t.table.reduce(
    (acc, row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (rowIndex >= start.row && rowIndex <= end.row && columnIndex >= start.col && columnIndex <= end.col) {
          acc[cell.key] = cell;
        }
      });
      return acc;
    },
    {},
  );
}

export function getRowIndex(editor, opts) {
  const t = findCurrentTable(editor, opts);
  const row = findCurrentRow(editor, opts);
  if (!t) return null;
  const rows = t.nodes;
  const i = rows.findIndex(x => x === row);
  if (i < 0) return null;
  return i;
}

export function collectSelectionBlocks(
  editor,
  anchorKey,
  focusKey,
  opts,
) {
  const t = TableLayout.create(editor, opts);
  if (!t) return [];
  const anchor = t.keyDict[anchorKey];
  const focus = t.keyDict[focusKey];
  const { start, end } = createSelectedCellRange(anchor, focus);
  return t.table
    .map((row, rowIndex) => {
      const newRow = row.filter((cell, columnIndex) => {
        return rowIndex >= start.row && rowIndex <= end.row && columnIndex >= start.col && columnIndex <= end.col;
      });
      return newRow.length ? newRow : null;
    })
    .filter(notNull);
}

function notNull(item) {
  return item !== null;
}

export function isInCell(editor, block, opts = defaultOptions) {
  return block.type === opts.typeCell ||
    editor.value.document.getClosest(block.key, p => {
      if (!isBlock(p)) return false;
      return p.type === opts.typeCell;
    })
    ? true
    : false;
}
import { Editor, Transforms, NodeEntry } from 'slate';
import { splitedTable, Col } from '../selection';
import { splitCell } from './splitCell';
import { Cell } from '../creator';

export function removeColumn(table: NodeEntry, editor: Editor) {
  const { selection } = editor;
  if (!selection || !table) return;

  const { gridTable, getCol } = splitedTable(editor, table);
  const xIndex = table[1].length + 1;

  const [start, end] = Editor.edges(editor, selection);
  const [startNode] = Editor.nodes(editor, {
    match: n => n.type === 'table-cell',
    at: start,
  });

  const [endNode] = Editor.nodes(editor, {
    match: n => n.type === 'table-cell',
    at: end,
  });

  const [startCol] = getCol((col: Col) => col.cell.key === startNode[0].key);
  const [endCol] = getCol((col: Col) => col.cell.key === endNode[0].key);

  const xLeft = startCol.path[xIndex];
  const xRight = endCol.path[xIndex];

  const topLeftCol = gridTable[0][xLeft];
  const bottomRight = gridTable[gridTable.length - 1][xRight];

  Transforms.setSelection(editor, {
    anchor: Editor.point(editor, topLeftCol.originPath),
    focus: Editor.point(editor, bottomRight.originPath),
  });

  splitCell(table, editor);

  const { gridTable: splitedGridTable } = splitedTable(editor, table);

  const removedCells = splitedGridTable.reduce((p: Col[], c: Col[]) => {
    const cells = c.slice(xLeft, xRight + 1);
    return [...p, ...cells];
  }, []) as Col[];

  removedCells.forEach((cell: { cell: { key: any } }) => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.cell.key,
    });
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== 'table-row') {
        return false;
      }

      if (
        !n.children ||
        n.children.findIndex((cell: Cell) => cell.type === 'table-cell') < 0
      ) {
        return true;
      }

      return false;
    },
  });

  const rows = Editor.nodes(editor, {
    at: table[1],
    match: n => n.type === 'table-row',
  });

  for (const row of rows) {
    let minRowHeight = Infinity;
    row[0].children.forEach((cell: Cell) => {
      const { rowspan = 1 } = cell;
      if (rowspan < minRowHeight) {
        minRowHeight = rowspan;
      }
    });

    if (minRowHeight > 1 && minRowHeight < Infinity) {
      row[0].children.forEach((cell: Cell) => {
        Transforms.setNodes(
          editor,
          {
            rowspan: (cell.rowspan || 1) - minRowHeight + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          }
        );
      });
    }
  }

  const { gridTable: removedGridTable } = splitedTable(editor, table);

  if (!removedGridTable.length) {
    const contentAfterRemove = Editor.string(editor, table[1]);

    if (!contentAfterRemove) {
      Transforms.removeNodes(editor, {
        at: table[1],
      });
    }

    return;
  }

  for (let idx = 0; idx < removedGridTable[0].length; idx++) {
    let allColumnIsReal = true;
    let minColWidth = Infinity;

    for (let j = 0; j < removedGridTable.length; j++) {
      if (!removedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        const { colspan = 1 } = removedGridTable[j][idx].cell;
        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      for (let j = 0; j < removedGridTable.length; j++) {
        const { cell } = removedGridTable[j][idx];
        Transforms.setNodes(
          editor,
          {
            colspan: (cell.colspan || 1) - minColWidth + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          }
        );
      }
    }
  }
}

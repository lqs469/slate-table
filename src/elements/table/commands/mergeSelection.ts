import { Node, Editor, Transforms, NodeEntry } from 'slate';
import { splitedTable, Col } from '../selection';
import { Cell } from '../creator';

export function mergeSelection(table: NodeEntry, editor: Editor) {
  if (!table || !editor.selection) return;

  const startPoint = Editor.start(editor, editor.selection);
  const [startCell] = Editor.nodes(editor, {
    match: n => n.selectedCell,
    at: startPoint,
  });

  if (!startCell) return;

  const { gridTable } = splitedTable(editor, table, startCell[0].key);

  const selectedTable = checkMerge(gridTable);
  if (!selectedTable) return;

  const insertPositionCol = selectedTable[0][0];
  const tmpContent: { [key: string]: Node[] } = {};

  gridTable.forEach((row: Col[]) => {
    row.forEach((col: Col) => {
      if (
        col.cell.selectedCell &&
        col.cell.key !== insertPositionCol.cell.key &&
        col.isReal
      ) {
        const [node] = Editor.nodes(editor, {
          match: n => n.key === col.cell.key,
        });

        if (node) {
          if (Editor.string(editor, node[1])) {
            tmpContent[col.cell.key] = node[0].children;
          }

          Transforms.removeNodes(editor, {
            at: table[1],
            match: n => n.key === col.cell.key,
          });
        }
      }
    });
  });

  Transforms.setNodes(
    editor,
    {
      height: 0,
      width: 0,
      colspan: selectedTable[0].length,
      rowspan: selectedTable.length,
    },
    {
      at: table[1],
      match: n => n.key === insertPositionCol.cell.key,
    },
  );

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
            height: 0,
            width: 0,
            rowspan: (cell.rowspan || 1) - minRowHeight + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          },
        );
      });
    }
  }

  const { gridTable: mergedGridTable } = splitedTable(editor, table);
  for (let idx = 0; idx < mergedGridTable[0].length; idx++) {
    let allColumnIsReal = true;
    let minColWidth = Infinity;

    for (let j = 0; j < mergedGridTable.length; j++) {
      if (!mergedGridTable[j][idx]) continue;

      if (!mergedGridTable[j][idx].isReal) {
        allColumnIsReal = false;
      } else {
        const { colspan = 1 } = mergedGridTable[j][idx].cell;
        if (colspan < minColWidth) {
          minColWidth = colspan;
        }
      }
    }

    if (allColumnIsReal && minColWidth < Infinity && minColWidth > 1) {
      for (let j = 0; j < mergedGridTable.length; j++) {
        const { cell } = mergedGridTable[j][idx];
        Transforms.setNodes(
          editor,
          {
            height: 0,
            width: 0,
            colspan: (cell.colspan || 1) - minColWidth + 1,
          },
          {
            at: table[1],
            match: n => n.key === cell.key,
          },
        );
      }
    }
  }

  const [insertContents] = Editor.nodes(editor, {
    at: insertPositionCol.originPath,
    match: n => n.type === 'table-content',
  });

  Object.values(tmpContent).forEach(content => {
    if (content[0] && content[0].children) {
      Transforms.insertNodes(editor, content[0].children, {
        at: Editor.end(editor, insertContents[1]),
      });
    }
  });
}

function checkMerge(table: Col[][]): Col[][] | undefined {
  let selectedCount = 0;

  const selectedTable = table.reduce((t: Col[][], row: Col[]) => {
    const currRow = row.filter((col: Col) => col.cell.selectedCell);
    if (currRow.length) {
      t.push(currRow);
      selectedCount += currRow.length;
    }
    return t;
  }, []);

  if (selectedCount < 2) {
    return;
  }

  const selectedWidth = selectedTable[0].length;
  let couldMerge = true;

  selectedTable.forEach((row: Col[]) => {
    if (row.length !== selectedWidth) {
      couldMerge = false;
    }
  });

  if (!couldMerge) {
    return;
  }

  return selectedTable;
}

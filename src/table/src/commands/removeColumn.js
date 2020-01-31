import { Editor, Transforms } from 'slate';
import { defaultOptions } from '../options';
import { splitedTable } from '../selection';
import splitCell from './splitCell';

export default function removeColumn(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const { gridTable } = splitedTable(editor, table);
  const xPosition = table[1].length + 1;

  let xStart = gridTable[0].length;
  let xEnd = 0;
  gridTable.forEach(row => {
    row.forEach(col => {
      if (col.cell.key === startKey || col.cell.key === endKey) {
        xStart = Math.min(xStart, col.path[xPosition]);
        xEnd = Math.max(xEnd, col.path[xPosition]);
      }
    });
  });

  const splitStartKey = gridTable[0][xStart].cell.key;
  const splitEndKey = gridTable[gridTable.length - 1][xEnd].cell.key;

  splitCell.call({ table }, editor, splitStartKey, splitEndKey);

  const { gridTable: splitedGridTable } = splitedTable(editor, table);

  const removedCells = splitedGridTable.reduce((p, c) => {
    const cells = c.slice(xStart, xEnd + 1);
    return [...p, ...cells];
  }, []);

  removedCells.forEach(cell => {
    Transforms.removeNodes(editor, {
      at: table[1],
      match: n => n.key === cell.cell.key
    });
  });

  const { gridTable: removedGridTable = [] } = splitedTable(editor, table);

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== defaultOptions.typeRow) {
        return false;
      }

      if (!n.children) {
        return true;
      }

      const found = n.children.findIndex(
        col => col.type === defaultOptions.typeCell
      );
      if (found === -1) {
        checkSpan();
        return true;
      }
    }
  });

  function checkSpan() {
    removedGridTable.forEach(row => {
      const isFakeRow = row.reduce((p, c) => p && !c.isReal, true);
      if (isFakeRow) {
        const originCell = new Map();
        row.forEach(col => {
          const cell = col.targetCell || col.cell;
          originCell.set(cell.key, cell);
        });

        originCell.forEach(cell => {
          const [node] = [
            ...Editor.nodes(editor, {
              at: table[1],
              match: n => n.key === cell.key
            })
          ];

          if (node && node[0]) {
            Transforms.setNodes(
              editor,
              {
                rowspan: node[0].rowspan ? Math.max(node[0].rowspan - 1, 1) : 1
              },
              {
                at: table[1],
                match: n => n.key === node[0].key
              }
            );
          }
        });
      }
    });
  }
}

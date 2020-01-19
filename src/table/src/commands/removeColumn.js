import { Editor, Transforms, Path } from 'slate';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';
import { createCell } from '../create-cell';

export default function removeColumn(editor, startKey, endKey) {
  const { selection } = editor;
  if (!selection || !startKey || !endKey) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;
  const xPosition = table[1].length + 1;

  const { gridTable, getCell } = splitedTable(editor, table);
  
  const [startCell] = getCell(n => n.cell.key === startKey);
  const [endCell] = getCell(n => n.cell.key === endKey);
  
  const [xStart, xEnd] = [
    startCell.path[xPosition],
    endCell.path[xPosition]
  ].sort((a, b) => a - b);

  console.log(startCell, endCell, xStart, xEnd);

  const removeNodesMap = new Map();
  gridTable.forEach(row => {
    for (let i = xStart; i <= xEnd; i++) {
      const { isReal, cell, path, originPath } = row[i];
      const { key, colspan = 1, rowspan = 1 } = cell;

      if (isReal) {
        if (colspan + path[xPosition] - 1 > xEnd) {
          const newCell = createCell({
            rowspan,
            colspan: colspan + path[xPosition] - 1 - xEnd
          });

          Transforms.insertNodes(editor, newCell, {
            at: Path.next(originPath),
          });
        }

        // Transforms.delete(editor, {
        //   at: originPath,
        // });
        Transforms.setNodes(editor, {
          colspan: xEnd - xStart,
        }, {
          at: table[1],
          match: n => n.key === key,
        });
      } else {
        if (colspan + path[xPosition] - 1 > xStart) {
          const originCell = getCell(n => n.isReal && n.cell.key === key);
          
          Transforms.setNodes(editor, {
            colspan: xStart - originCell.path[xPosition],
          }, {
            at: table[1],
            match: n => n.key === key,
          });
        }

        const newCell = createCell({
          rowspan,
          colspan: colspan + path[xPosition] - 1 - xEnd
        });

        Transforms.insertNodes(editor, newCell, {
          at: Path.next(originPath),
        });
      }
    }
  });

  removeNodesMap.forEach(node => {
    console.log(node)
    Transforms.delete(
      editor,
      {
        at: node.originPath,
      }
    );
  });
}
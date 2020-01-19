import { Editor, Transforms } from 'slate';
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
  const yPosition = table[1].length;

  const { getCell } = splitedTable(editor, table);
  
  const selectedCols = getCell(n => n.cell.selectionColor);
  
  selectedCols.forEach(col => {
    const { cell, isReal, originPath } = col;
    const { rowspan = 1, colspan = 1, children } = cell;

    if (isReal && (rowspan !== 1 || colspan !== 1)) {
      Transforms.delete(editor, {
        at: originPath,
      });

      for (let i = 0; i < rowspan; i++) {
        for (let j = 0; j < colspan; j++) {
          const newPath = [...originPath];
          newPath[yPosition] += i;

          const newCell = createCell({
            elements: (i === 0 && j === colspan - 1)
              ? children[0].children
              : null
          });

          Transforms.insertNodes(editor, newCell, {
            at: newPath,
          });
        }
      }
    }
  });
}
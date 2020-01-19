import { Editor, Transforms } from 'slate';
import { splitedTable } from '../selection';
import { createCell } from '../creator';

export default function removeColumn(editor, startKey, endKey) {
  const { table } = this;
  const { selection } = editor;
  if (!selection || !startKey || !endKey || !table) return;

  const yPosition = table[1].length;
  const xPosition = table[1].length + 1;

  const { gridTable, getCell } = splitedTable(editor, table);

  const [startCell] = getCell(n => n.cell.key === startKey && n.isReal);
  const [endCell] = getCell(n => n.cell.key === endKey && n.isReal);
  const [yStart, yEnd] = [
    startCell.path[yPosition],
    endCell.path[yPosition],
  ].sort((a, b) => a - b);

  const [xStart, xEnd] = [
    startCell.path[xPosition],
    endCell.path[xPosition],
  ].sort((a, b) => a - b);

  const sourceCells = new Map();
  const selectedCols = getCell(n => {
    if (n.cell.selectionColor) {
      return true;
    }

    const [y, x] = n.path.slice(table[1].length, table[1].length + 2);
    if (y >= yStart && y <= yEnd && x >= xStart && x <= xEnd) {
      if (!n.isReal) {
        const [sourceCell] = getCell(s =>
          s.isReal && s.cell.key === n.cell.key
        );
        sourceCells.set(n.cell.key, sourceCell);
      }
      return true;
    }

    return false;
  });

  sourceCells.forEach(c => {
    const [y, x] = c.path.slice(table[1].length, table[1].length + 2);

    if (y < yStart || y > yEnd || x < xStart || x > xEnd) {
      selectedCols.push(c);
    }
  });

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
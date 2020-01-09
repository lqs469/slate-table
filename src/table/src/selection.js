// import { HistoryEditor } from 'slate-history';
import { Transforms, Editor } from "slate";
import { defaultOptions } from "./option";

const insertStyleId = '__slate__table__id';

export const splitedTable = (editor, table, head) => {
  const tableDepth = table[1].length;

  const cells = [...Editor.nodes(editor, {
    at: table[1],
    match: n => n.type === defaultOptions.typeCell,
  })].map(([cell, path]) => ({
    cell,
    path,
    realPath: [...path],
  }));
  if (!cells.length) return {};

  // let cellWidth = 0;
  const cellMap = {};
  const cellReMap = {};
  const gridTable = [];
  let insertPosition = null;

  for (let i = 0; i < cells.length; i++) {
    const { cell, path, realPath } = cells[i];
    const { rowspan = 1, colspan = 1 } = cell;
    let y = path[tableDepth];
    let x = path[tableDepth + 1];

    if (!gridTable[y]) {
      gridTable[y] = [];
    }

    while (gridTable[y][x]) {
      x++;
    }

    for (let j = 0; j < rowspan; j++) {
      for (let k = 0; k < colspan; k++) {
        let _y = y + j;
        let _x = x + k;

        if (!gridTable[_y]) {
          gridTable[_y] = [];
        }

        gridTable[_y][_x] = {
          cell,
          path: [...realPath.slice(0, tableDepth), _y, _x],
          isReal: (rowspan === 1 && colspan === 1)
            || (_y === y && _x === x),
          // isSelected: !!cell.selectionColor,
          originPath: path,
        };

        if (!insertPosition && head[0].key === cell.key) {
          insertPosition = gridTable[_y][_x];
          gridTable[_y][_x].isInsertPosition = true;
        }
      }
    }

    // cellWidth = Math.max(
    //   cellWidth,
    //   (path[tableDepth + 1] + 1)
    //   + ((cell.data && cell.data.colspan) ? cell.data.colspan : 0),
    // );
  };

  // console.log(cells);

  // cells.forEach(([cell, path]) => {
  //   const { realPath = path } = cell;
  //   let [y, x] = realPath.slice(tableDepth);
  //   const { rowspan = 0, colspan = 0 } = cell;

  //   const h = rowspan || 1;
  //   const w = colspan || 1;

  //   for (let i = y; i < y + h; i++) {
  //     for (let j = x; j < x + w; j++) {
  //       if (!gridTable[i]) {
  //         gridTable[i] = [];
  //       }

  //       gridTable[i][j] = {
  //         cell,
  //         path: realPath,
  //         isReal: (h === 1 && w === 1) || (i === y && j === x),
  //         isSelected: !!cell.selectionColor,
  //         originPath: path,
  //       };

  //       if (!insertPosition && cell.selectionColor) {
  //         insertPosition = gridTable[i][j];
  //         gridTable[i][j].isInsertPosition = true;
  //       }
  //     }
  //   }
  // });

  const getCell = match => {
    const result = [];
    gridTable.forEach(row => {
      row.forEach(col => {
        if (match(col)) {
          result.push(col);
        }
      });
    });

    return result;
  }

  return {
    insertPosition,
    gridTable,
    tableDepth,
    cells,
    cellMap,
    cellReMap,
    getCell,
    // cellWidth,
  }
}

export function addSelection(editor, targetKey) {
  removeSelection(editor);
  addSelectionStyle();
  
  const { selection } = editor;
  if (!selection) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;

  const [targetHead] = [...Editor.nodes(editor, {
    at: selection.anchor.path,
    match: n => n.type === defaultOptions.typeCell,
  })];
  if (!targetHead) return;

  const { gridTable, getCell } = splitedTable(editor, table, targetHead);

  const [head] = getCell(n => n.cell.key === targetHead[0].key);
  const [tail] = getCell(n => n.cell.key === targetKey);
  if (!tail || !head) return;
  
  const { path: tailPath } = tail;
  const { path: headPath } = head;

  headPath.forEach((item, index) => {
    headPath[index] = Math.min(item, tailPath[index]);
    tailPath[index] = Math.max(item, tailPath[index]);
  });

  const coverCellsPath = [];

  gridTable.forEach(row => {
    row.forEach(col => {
      const { path } = col;

      const isOver = path.findIndex((item, index) => {
        if (item < headPath[index] || item > tailPath[index]) {
          return true;
        }
        return false;
      });
  
      if (isOver < 0) {
        coverCellsPath.push(col);
      }
    });
  });

  coverCellsPath.forEach(({ originPath }) => {
    Transforms.setNodes(editor, {
      selectionColor: defaultOptions.selectionColor,
    }, {
      at: originPath,
      match: n => n.type === defaultOptions.typeCell,
    });
  });

  return coverCellsPath;
}

export function removeSelection(editor) {
  Transforms.unsetNodes(editor, 'selectionColor', {
    at: [],
    match: n => !!n.selectionColor,
  });

  removeSelectionStyle();
}

export function removeSelectionStyle() {
  const style = document.querySelector(`style#${insertStyleId}`);
  if (style) {
    const head = document.getElementsByTagName('head');
    const first = head && head.item(0);
    first && first.removeChild(style);
  }
}

export function addSelectionStyle() {
  // HACK: Add ::selection style when greater than 1 cells selected.
  if (!document.querySelector(`style#${insertStyleId}`)) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = insertStyleId;
    const head = document.getElementsByTagName('head');
    const first = head && head.item(0);

    if (first) {
      first.appendChild(style);
      const stylesheet = style.sheet;

      if (stylesheet) {
        stylesheet.insertRule(`table *::selection { background: none; }`, stylesheet.cssRules.length);
      }
    }
  }
}
import { Editor, Transforms, Path } from 'slate';
import { createCell } from '../create-cell';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';

// import { mergeCells } from './merge';
// import { ComponentStore } from '../store';

function checkMerge(table) {
  let selectedCount = 0;
  const selectedTable = table.reduce((t, row) => {
    const currRow = row.filter(cell => cell.isSelected);
    if (currRow.length) {
      t.push(currRow);
      selectedCount += currRow.length;
    }
    return t;
  }, []);

  console.log('🔥', selectedTable);
  if (selectedCount < 2) {
    return false;
  }
  
  const selectedWidth = selectedTable[0].length;
  let couldMerge = true;
  selectedTable.forEach(row => {
    if (row.length !== selectedWidth) {
      alert('无法合并');
      couldMerge = false;
    }
  });

  if (!couldMerge) {
    return false;
  }

  return selectedTable;
}


export default function mergeSelection(editor) {
  console.log('start', editor);
  let insertPosition = null;
  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];

  if (!table) return;
  const tableDepth = table[1].length;

  let { cells, cellMap, cellReMap, cellWidth } = splitedTable(editor, table);
  console.log(cells, cellMap, cellReMap);

  const _table = [];
  cells.forEach(([cell, path]) => {
    let [y, x] = path.slice(tableDepth);
    const { rowspan = 0, colspan = 0 } = cell;

    const h = rowspan || 1;
    const w = colspan || 1;

    for (let i = y; i < y + h; i++) {
      for (let j = x; j < x + w; j++) {
        if (!_table[i]) {
          _table[i] = [];
        }

        _table[i][j] = {
          cell,
          path,
          isReal: (h === 1 && w === 1) || (i === y && j === x),
          isSelected: !!cell.selectionColor,
        };

        if (!insertPosition && cell.selectionColor) {
          insertPosition = _table[i][j];
          _table[i][j].isInsertPosition = true;
        }
      }
    }
  });

  const selectedTable = checkMerge(_table);
  
  console.log('🎅', _table, insertPosition, selectedTable);
  if (!selectedTable || !insertPosition) {
    return;
  }

  const tmpContent = [];

  _table.forEach(row => {
    row.forEach(col => {
      if (col.isSelected && !col.isInsertPosition) {
        col.isReal = false;
        col.targetCell = insertPosition.cell;
      }
    });
  });

  console.log('😎', _table);
  _table.forEach(row => {
    row.forEach(col => {
      if (col.targetCell && col.cell.key !== col.targetCell.key) {
        console.log('❌', col)
        const currContent = col.cell.children[0];

        if (
          currContent
          && currContent.children
          && currContent.children.length
        ) {
          tmpContent.push(...currContent.children);
        }

        Transforms.removeNodes(editor, {
          at: table[1],
          match: n => n.key === col.cell.key,
        });
      }
    });
  });

  console.log('tmpContent', tmpContent);
  Transforms.setNodes(editor, {
    colspan: selectedTable[0].length,
    rowspan: selectedTable.length,
  }, {
    at: table[1],
    match: n => n.key === insertPosition.cell.key,
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => {
      if (n.type !== defaultOptions.typeRow) {
        return false;
      }
      
      if (!n.children) {
        return true;
      }

      const found = n.children.findIndex(col => col.type === defaultOptions.typeCell);
      if (found === -1) {
        console.log('❌空tr，整行删除', n);
        checkSpan();
        return true;
      }
    }
  });

  function checkSpan() {
    _table.forEach(row => {
      const isFakeRow = row.reduce((p, c) => p && !c.isReal, true);
  
      if (isFakeRow) {
        const originCol = new Map();
        row.forEach(col => {
          const cell = col.targetCell || col.cell;
          originCol.set(cell.key, cell);
        });
        
        originCol.forEach(col => {
          const [node] = [...Editor.nodes(editor, {
            at: table[1],
            match: n => n.key === col.key,
          })];
          if (node && node[0]) {
            Transforms.setNodes(editor, {
              rowspan: node[0].rowspan
                ? Math.max(node[0].rowspan - 1, 1)
                : 1,
            }, {
              at: table[1],
              match: n => n.key === col.key,
            });
          }
        });
      }
    });
  }

  

  
  tmpContent.forEach((content, index) => {
    const nodes = [...Editor.nodes(editor, {
      at: insertPosition.path,
      match: n => n.type === defaultOptions.typeContent,
    })];
    const [, targetPath] = nodes[nodes.length - 1];

    Transforms.insertNodes(
      editor,
      {
        type: defaultOptions.typeContent,
        children: [content],
      },
      {
        at: Path.next(targetPath),
      },
    );
  });
}
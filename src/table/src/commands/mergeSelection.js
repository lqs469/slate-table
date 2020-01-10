import { Editor, Transforms, Path } from 'slate';
import { defaultOptions } from '../option';
import { splitedTable } from '../selection';

export default function mergeSelection(editor, startKey) {
  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;

  const { gridTable } = splitedTable(editor, table, startKey);

  const selectedTable = checkMerge(gridTable);
  if (!selectedTable) return;

  const insertPosition = selectedTable[0][0];
  const tmpContent = {};

  gridTable.forEach(row => {
    row.forEach(col => {
      if (
        col.cell.selectionColor
        && col.cell.key !== insertPosition.cell.key
      ) {
        if (col.isReal) {
          const currContent = col.cell.children;
          if (currContent && currContent.length) {
            tmpContent[col.cell.key] = currContent;
          }
          
          Transforms.removeNodes(editor, {
            at: table[1],
            match: n => n.key === col.cell.key,
          });
        }
        
        col.targetCell = insertPosition.cell;
        col.isReal = false;
      }
    });
  });

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
        checkSpan();
        return true;
      }
    }
  });

  function checkSpan() {
    gridTable.forEach(row => {
      const isFakeRow = row.reduce((p, c) => p && !c.isReal, true);
  
      if (isFakeRow) {
        const originCell = new Map();
        row.forEach(col => {
          const cell = col.targetCell || col.cell;
          originCell.set(cell.key, cell);
        });
        
        originCell.forEach(cell => {
          const [node] = [...Editor.nodes(editor, {
            at: table[1],
            match: n => n.key === cell.key,
          })];

          if (node && node[0]) {
            Transforms.setNodes(editor, {
              rowspan: node[0].rowspan
                ? Math.max(node[0].rowspan - 1, 1)
                : 1,
            }, {
              at: table[1],
              match: n => n.key === node[0].key,
            });
          }
        });
      }
    });
  }

  const [insertCell] = [...Editor.nodes(editor, {
    at: table[1],
    match: n => n.key === insertPosition.cell.key,
  })];
  if (!insertCell) return;

  Object.values(tmpContent).forEach(content => {
    const insertContents = [...Editor.nodes(editor, {
      at: insertCell[1],
      match: n => n.type === defaultOptions.typeContent,
    })];

    if (insertContents.length) {
      const targetPath = insertContents[insertContents.length - 1][1];
      
      Transforms.insertNodes(editor, content, {
        at: Path.next(targetPath),
      });
    }
  });
}

function checkMerge(table) {
  let selectedCount = 0;
  const selectedTable = table.reduce((t, row) => {
    const currRow = row.filter(col => col.cell.selectionColor);
    if (currRow.length) {
      t.push(currRow);
      selectedCount += currRow.length;
    }
    return t;
  }, []);

  if (selectedCount < 2) {
    return false;
  }
  
  const selectedWidth = selectedTable[0].length;
  let couldMerge = true;
  selectedTable.forEach(row => {
    if (row.length !== selectedWidth) {
      couldMerge = false;
    }
  });

  if (!couldMerge) {
    return false;
  }

  return selectedTable;
}

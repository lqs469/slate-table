import { Editor, Transforms } from 'slate';
// import { TableLayout, getRowIndex } from '../layout';
import { defaultOptions } from '../option';
import { createRow } from '../create-row';

export default function insertBelow(editor, opts) {
  // const rowIndex = getRowIndex(editor, opts);
  
  // if (rowIndex === null) return editor;
  // const table = TableLayout.create(editor, opts);
  
  // if (!table) return editor;
  
  // if (rowIndex + 1 === table.table.length) {
  //   const newRow = createRow(opts, table.table[0].length);
  //   return editor
  //     .insertNodeByKey(table.currentTable.key, rowIndex + 1, newRow)
  //     .moveToEndOfNode(newRow.nodes.get(table.columnIndex));
  // } else {
  //   table.table[rowIndex + 1]
  //     .filter(cell => cell.rowspan > 1 && !cell.isTopOfMergedCell)
  //     .forEach(cell => {
  //       editor.setNodeByKey(cell.key, {
  //         type: cell.block.type,
  //         data: { ...cell.block.data.toObject(), rowspan: cell.rowspan + 1 },
  //       });
  //     });
  //   const newRowLength = table.table[rowIndex + 1].filter(cell => {
  //     return cell.rowspan === 1 || cell.isTopOfMergedCell;
  //   }).length;
  //   const newRow = createRow(opts, newRowLength);

  //   return editor
  //     .insertNodeByKey(table.currentTable.key, rowIndex + 1, newRow)
  //     .moveToEndOfNode(newRow.nodes.get(table.columnIndex));
  // }

  const [[matchRow, path]] = Editor.nodes(editor, {    
    match: n =>  n.type === defaultOptions.typeRow,
  });
  const newRow = createRow(matchRow.children.length);
  
  path[path.length - 1]++;
  
  Transforms.insertNodes(editor, newRow, {
    at: path,
    match: n => n.key === matchRow.key,
  });
}
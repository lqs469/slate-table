import { Editor, Transforms } from 'slate';
// import { TableLayout } from '../layout';
import { defaultOptions } from '../option';
import removeTable from './removeTable';

export default function removeRow(editor, at) {
  // const table = TableLayout.create(editor, opts);
  // if (!table) return editor;
  // const below = table.findBelow(table.cell.key);
  // const { rowIndex, row } = table;
  // const index = typeof at === 'undefined' ? table.rowIndex : at;
  
  // editor.withoutNormalizing(() => {
  //   if (table.height === 1 || !below) {
  //     table.getRows(index).forEach(cell => {
  //       if (cell.rowspan === 1) return;
  //       editor.setNodeByKey(cell.key, {
  //         type: cell.block.type,
  //         data: { ...cell.block.data.toObject(), rowspan: cell.rowspan - 1 },
  //       });
  //     });
  //     editor.removeNodeByKey(row.key);
  //     if (table.height === 1) {
  //       editor.removeNodeByKey(table.currentTable.key);
  //     }
  //   } else {
  //     const newNodes = below.rowBlock.nodes.toArray().map((b) => {
  //       if (!Block.isBlock(b)) return null;
  //       return b.toJSON();
  //     });

  //     const inserted = {};
  //     // const inserted: { [key: string]: boolean } = {};

  //     table.getRows(index).forEach(cell => {
  //       if (cell.rowspan === 1) return;
  //       if (cell.isTopOfMergedCell) {
  //         const newBlock = Block.create({
  //           type: cell.block.type,
  //           data: { ...cell.block.data.toObject(), rowspan: cell.rowspan - 1 },
  //           nodes: cell.block.nodes,
  //         });
  //         if (inserted[cell.key]) return;
  //         newNodes.splice(cell.nodeIndex, 0, newBlock.toJSON());
  //         inserted[cell.key] = true;
  //       } else {
  //         editor.setNodeByKey(cell.key, {
  //           type: cell.block.type,
  //           data: { ...cell.block.data.toObject(), rowspan: cell.rowspan - 1 },
  //         });
  //       }
  //     });
  //     const newBlock = Block.fromJSON({
  //       ...below.rowBlock.toJSON(),
  //       nodes: newNodes,
  //     });
  //     editor.removeNodeByKey(row.key);
  //     editor.replaceNodeByKey(below.rowBlock.key, newBlock);
  //   }

  //   const newRow = TableLayout.findRowBlock(editor, rowIndex, opts);
  //   if (!newRow) {
  //     // TODO: find table when unfocused from table.
  //     return;
  //   }
  //   editor.moveTo(newRow.key);
  // });

  const matchRow = [...Editor.nodes(editor, {
    at: [editor.selection.anchor.path[0]],
    match: n => n.type === defaultOptions.typeRow,
  })];


  if (matchRow.length < 2) {
    removeTable(editor);
    return;
  }

  Transforms.removeNodes(editor, {
    match: n => n.type === defaultOptions.typeRow,
  });
}
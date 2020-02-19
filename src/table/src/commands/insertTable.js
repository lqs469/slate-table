import { Transforms } from 'slate';
import { createTable } from '../creator';

function insertTable(editor) {
  const columns = 3;
  const rows = 3;
  const table = createTable(columns, rows);
  const p = {
    type: 'paragraph',
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, [table, p]);
}

export default insertTable;

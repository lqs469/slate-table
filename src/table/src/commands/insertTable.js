import { Transforms } from 'slate';
import { createTable } from '../create-table';

function insertTable(editor, columns = 3, rows = 3) {
  const table = createTable(columns, rows);
  Transforms.insertNodes(editor, table);
}

export default insertTable;
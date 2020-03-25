import { Transforms, Editor, Range } from 'slate';
import { createTable } from '../creator';

export function insertTable(editor: Editor) {
  if (!editor.selection) return;

  const node = Editor.above(editor, {
    match: n => n.type === 'table',
  });

  const isCollapsed = Range.isCollapsed(editor.selection);

  if (!node && isCollapsed) {
    const table = createTable(3, 3);
    Transforms.insertNodes(editor, table);
  }
}

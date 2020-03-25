import { Editor, Transforms, NodeEntry } from 'slate';

export function removeTable(table: NodeEntry, editor: Editor) {
  if (editor && table) {
    Transforms.removeNodes(editor, {
      match: n => n.type === 'table',
      at: table[1],
    });
  }
}

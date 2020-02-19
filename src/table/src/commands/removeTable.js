import { Editor, Transforms } from 'slate';
import { defaultOptions } from '../options';

export default function removeTable(editor) {
  let { table } = this;

  if (!table) {
    [table] = [
      ...Editor.nodes(editor, {
        match: n => n.type === defaultOptions.typeTable,
      }),
    ];
  }

  if (!table) return;

  Transforms.removeNodes(editor, {
    at: table[1],
    match: n => n.type === defaultOptions.typeTable,
  });
}

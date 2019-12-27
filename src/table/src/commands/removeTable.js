import { Transforms } from 'slate';
// import { TableLayout } from '../layout';
import { defaultOptions } from '../option';

export default function removeTable(editor) {
  // editor.deselect();

  Transforms.removeNodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  });
}
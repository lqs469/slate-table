import { Editor, NodeEntry, Path } from 'slate';

export function checkTableIsExist(editor: Editor, table: NodeEntry) {
  const cells = Array.from(
    Editor.nodes(editor, {
      at: table[1],
      match: n => n.type === 'table-cell',
    })
  );

  return !!cells.length;
}

export function isTableElement(type: string) {
  return (
    type === 'table' ||
    type === 'table-row' ||
    type === 'table-cell' ||
    type === 'table-content'
  );
}

export function isInSameTable(editor: Editor): boolean {
  if (!editor.selection) return false;

  const [start, end] = Editor.edges(editor, editor.selection);
  const [startTable] = Editor.nodes(editor, {
    at: start,
    match: n => n.type === 'table',
  });

  const [endTable] = Editor.nodes(editor, {
    at: end,
    match: n => n.type === 'table',
  });

  if (startTable && endTable) {
    const [, startPath]: [any, Path] = startTable;
    const [, endPath]: [any, Path] = endTable;

    if (Path.equals(startPath, endPath)) {
      return true;
    }
  }

  return false;
}

import React from 'react';
import { Editor, NodeEntry, Path, Point, Transforms } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { Table, withTable } from './table';
import 'antd/dist/antd.css';

export const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'table':
    case 'table-row':
    case 'table-cell':
    case 'table-content':
      return <Table {...props} />;
    default:
      return <span {...props.attributes}>{props.children}</span>;
  }
};

export const renderLeaf = (props: RenderLeafProps) => (
  <span {...props.attributes}>{props.children}</span>
);

export const withSchema = (editor: Editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = entry => {
    if (maybePreserveSpace(editor, entry)) return;

    normalizeNode(entry);
  };

  return withTable(editor);
};

export const PreserveSpaceAfter = new Set(['table']);
export const PreserveSpaceBefore = new Set(['table']);

export const insertParagraph = (
  editor: Editor,
  at: Path | Point,
  text = '',
) => {
  Transforms.insertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text }],
    },
    {
      at,
    },
  );
};

const maybePreserveSpace = (
  editor: Editor,
  entry: NodeEntry,
): boolean | void => {
  const [node, path] = entry;
  const { type } = node;
  let preserved = false;

  if (PreserveSpaceAfter.has(type)) {
    const next = Editor.next(editor, { at: path });
    if (!next || PreserveSpaceBefore.has(next[0].type)) {
      insertParagraph(editor, Path.next(path));
      preserved = true;
    }
  }

  if (PreserveSpaceBefore.has(type)) {
    if (path[path.length - 1] === 0) {
      insertParagraph(editor, path);
      preserved = true;
    } else {
      const prev = Editor.previous(editor, { at: path });
      if (!prev || PreserveSpaceAfter.has(prev[0].type)) {
        insertParagraph(editor, path);
        preserved = true;
      }
    }
  }

  return preserved;
};

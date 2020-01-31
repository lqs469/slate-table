import React from 'react';
import { Editor, Range, Point, Transforms, Text } from 'slate';
import { useEditor } from 'slate-react';
import { defaultOptions } from './options';
import { TableElement } from './renderers';
import { ComponentStore } from './store';
import commands from './commands';
import removeTable from './commands/removeTable';

const TABLE_HANDLER = 'table_handler';
const store = new ComponentStore();

const withTable = editor => {
  const { exec, deleteBackward, deleteFragment } = editor;

  editor.exec = command => {
    if (command.type === TABLE_HANDLER) {
      const [table] = [
        ...Editor.nodes(editor, {
          match: n => n.type === defaultOptions.typeTable
        })
      ];

      commands[command.method].call(
        {
          table
        },
        editor,
        store.getAnchorCellBlock(),
        store.getFocusCellBlock()
      );

      const tables = [
        ...Editor.nodes(editor, {
          at: [],
          match: n => n.type === defaultOptions.typeTable
        })
      ];

      tables.forEach(t => {
        if (!checkTableIsExist(editor, t)) {
          removeTable.call({ table }, editor);
        }
      });
    } else {
      exec(command);
    }
  };

  editor.deleteFragment = (...args) => {
    const { selection } = editor;
    const [fragment] = Editor.fragment(editor, selection);

    if (fragment.type === defaultOptions.typeTable) {
      const selectedCells = [
        ...Editor.nodes(editor, {
          match: n => n.selectionColor
        })
      ];

      selectedCells.forEach(([cell, path]) => {
        const [content] = [
          ...Editor.nodes(editor, {
            at: path,
            match: n => Text.isText(n)
          })
        ];

        Transforms.delete(editor, {
          at: content[1]
        });
      });

      return;
    }
    deleteFragment(...args);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n =>
          n.type === defaultOptions.typeTable ||
          n.type === defaultOptions.typeRow ||
          n.type === defaultOptions.typeCell ||
          n.type === defaultOptions.typeContent
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          return;
        }
      } else {
        const beforeLocation = Editor.before(editor, selection);
        const isAfterTable = Editor.above(editor, {
          at: beforeLocation,
          match: n =>
            n.type === defaultOptions.typeTable ||
            n.type === defaultOptions.typeRow ||
            n.type === defaultOptions.typeCell ||
            n.type === defaultOptions.typeContent
        });

        if (isAfterTable) {
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};

const TableToolbar = () => {
  const editor = useEditor();
  const TableToolbarBtn = ({ method, children }) => {
    return (
      <button
        onMouseDown={event => {
          event.preventDefault();
          editor.exec({ type: TABLE_HANDLER, method });
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <TableToolbarBtn method="insertTable">Insert Table</TableToolbarBtn>
      <TableToolbarBtn method="insertAbove">Insert Above</TableToolbarBtn>
      <TableToolbarBtn method="insertBelow">Insert Below</TableToolbarBtn>
      <TableToolbarBtn method="insertLeft">Insert Left</TableToolbarBtn>
      <TableToolbarBtn method="insertRight">Insert Right</TableToolbarBtn>
      <TableToolbarBtn method="mergeSelection">merge selection</TableToolbarBtn>
      <TableToolbarBtn method="splitCell">split cell</TableToolbarBtn>
      <TableToolbarBtn method="removeColumn">Remove Column</TableToolbarBtn>
      <TableToolbarBtn method="removeRow">Remove Row</TableToolbarBtn>
      <TableToolbarBtn method="removeTable">Remove Table</TableToolbarBtn>
    </>
  );
};

const Table = props => <TableElement {...props} store={store} />;

function checkTableIsExist(editor, table) {
  const cells = [
    ...Editor.nodes(editor, {
      at: table[1],
      match: n => n.type === defaultOptions.typeCell
    })
  ];

  return !!cells.length;
}

export { withTable, TableToolbar, defaultOptions, Table };

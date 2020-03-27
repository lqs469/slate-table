import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  RenderElementProps,
  useSelected,
  useEditor,
  useSlate,
} from 'slate-react';
import { Editor, NodeEntry, Transforms, Range, Path } from 'slate';
import { removeSelection, addSelection } from './selection';
import { options } from './options';
import { createContent } from './creator';
import { TableCardbar, HorizontalToolbar, VerticalToolbar } from './ui';
import cx from 'classnames';
import { isInSameTable } from './utils';
import './table.css';

export const withTable = (editor: Editor) => {
  const { addMark, removeMark, deleteBackward, deleteFragment } = editor;

  editor.addMark = (key, value) => {
    if (editor.selection) {
      const lastSelection = editor.selection;

      const selectedCells = Editor.nodes(editor, {
        match: n => n.selectedCell,
        at: [],
      });

      let isTable = false;

      for (let cell of selectedCells) {
        if (!isTable) {
          isTable = true;
        }

        const [content] = Editor.nodes(editor, {
          match: n => n.type === 'table-content',
          at: cell[1],
        });

        if (Editor.string(editor, content[1]) !== '') {
          Transforms.setSelection(editor, Editor.range(editor, cell[1]));
          addMark(key, value);
        }
      }

      if (isTable) {
        Transforms.select(editor, lastSelection);
        return;
      }
    }

    addMark(key, value);
  };

  editor.removeMark = key => {
    if (editor.selection) {
      const lastSelection = editor.selection;
      const selectedCells = Editor.nodes(editor, {
        match: n => {
          return n.selectedCell;
        },
        at: [],
      });

      let isTable = false;
      for (let cell of selectedCells) {
        if (!isTable) {
          isTable = true;
        }

        const [content] = Editor.nodes(editor, {
          match: n => n.type === 'table-content',
          at: cell[1],
        });

        if (Editor.string(editor, content[1]) !== '') {
          Transforms.setSelection(editor, Editor.range(editor, cell[1]));
          removeMark(key);
        }
      }

      if (isTable) {
        Transforms.select(editor, lastSelection);
        return;
      }
    }
    removeMark(key);
  };

  editor.deleteFragment = (...args) => {
    if (editor.selection && isInSameTable(editor)) {
      const selectedCells = Editor.nodes(editor, {
        match: n => {
          return n.selectedCell;
        },
      });

      for (let cell of selectedCells) {
        Transforms.setSelection(editor, Editor.range(editor, cell[1]));

        const [content] = Editor.nodes(editor, {
          match: n => n.type === 'table-content',
        });

        Transforms.insertNodes(editor, createContent(), { at: content[1] });
        Transforms.removeNodes(editor, { at: Path.next(content[1]) });
      }

      return;
    }

    Transforms.removeNodes(editor, {
      match: n => n.type === 'table',
    });

    deleteFragment(...args);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const isInTable = Editor.above(editor, {
        match: n => n.type === 'table',
      });

      if (isInTable) {
        const start = Editor.start(editor, selection);
        const isStart = Editor.isStart(editor, start, selection);

        const currCell = Editor.above(editor, {
          match: n => n.type === 'table-cell',
        });

        if (isStart && currCell && !Editor.string(editor, currCell[1])) {
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};

export const Table: React.FC<RenderElementProps> = props => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const editor = useEditor();

  switch (element.type) {
    case 'table': {
      let existSelectedCell = false;
      let table: NodeEntry | null = null;

      if (selected && editor.selection) {
        [table] = Editor.nodes(editor, {
          match: n => n.type === 'table',
          at: Editor.path(editor, editor.selection),
        });

        if (table) {
          const [selectedCell] = Editor.nodes(editor, {
            at: Editor.range(editor, table[1]),
            match: n => n.selectedCell,
          });

          if (selectedCell) {
            existSelectedCell = true;
          }
        }
      }

      return (
        <div style={{ position: 'relative' }}>
          <TableCardbar
            className={cx({ selected: selected || existSelectedCell })}
          />
          <TableComponent {...props} table={table}>
            {children}
          </TableComponent>
        </div>
      );
    }

    case 'table-row': {
      return (
        <tr
          {...attributes}
          className="table-tr"
          slate-table-element="tr"
          data-key={element.key}
          onDrag={e => e.preventDefault()}
        >
          {children}
        </tr>
      );
    }

    case 'table-cell': {
      return (
        <CellComponent
          {...props}
          dataKey={element.key}
          node={children.props.node}
        >
          {children}
        </CellComponent>
      );
    }

    case 'table-content': {
      return (
        <div slate-table-element="content" className="table-content">
          {children}
        </div>
      );
    }

    default:
      return <p {...props} />;
  }
};

const TableComponent: React.FC<{
  table: NodeEntry | null;
} & RenderElementProps> = props => {
  const { table, children } = props;
  const editor = useSlate();
  const selected = useSelected();
  const ref = useRef<HTMLTableElement>(null);

  const resizeTable = useCallback(() => {
    if (ref.current) {
      ref.current.querySelectorAll('td').forEach(cell => {
        Transforms.setNodes(
          editor,
          {
            width: cell.offsetWidth,
            height: cell.offsetHeight,
          },
          {
            at: [],
            match: n => n.key === cell.dataset.key,
          },
        );
      });
    }
  }, [editor]);

  useEffect(() => {
    resizeTable();
  }, [resizeTable, selected, editor.selection]);

  useEffect(() => {
    if (!selected) removeSelection(editor);
  }, [selected, editor]);

  const [startKey, setStartKey] = useState<string>('');

  const startNode = useMemo(() => {
    const [node] = Editor.nodes(editor, {
      match: n => n.key === startKey,
      at: [],
    });

    return node;
  }, [startKey, editor]);

  const ResizeToolbar = useMemo(() => {
    return (
      selected &&
      ref.current &&
      table && (
        <>
          <HorizontalToolbar table={ref.current} tableNode={table} />
          <VerticalToolbar table={ref.current} tableNode={table} />
        </>
      )
    );
  }, [selected, table]);

  return (
    <>
      {ResizeToolbar}
      <table
        className="table"
        slate-table-element="table"
        ref={ref}
        style={options.tableStyle}
        onDragStart={e => e.preventDefault()}
        onMouseDown={e => {
          const cell = (e.target as HTMLBaseElement).closest('td');
          const key = cell?.getAttribute('data-key') || '';
          setStartKey(key);
        }}
        onMouseMove={e => {
          const cell = (e.target as HTMLBaseElement).closest('td');
          if (cell && startKey) {
            const endKey = cell.getAttribute('data-key');

            const [endNode] = Editor.nodes(editor, {
              match: n => n.key === endKey,
              at: [],
            });

            addSelection(
              editor,
              table,
              Editor.path(editor, startNode[1]),
              Editor.path(editor, endNode[1]),
            );
          }
        }}
        onMouseUp={() => {
          setStartKey('');
          resizeTable();
        }}
        onMouseLeave={() => {
          setStartKey('');
        }}
      >
        <tbody slate-table-element="tbody">{children}</tbody>
      </table>
    </>
  );
};

const CellComponent: React.FC<{
  node: {
    width: number;
    height: number;
    selectedCell?: boolean;
    colspan?: number;
    rowspan?: number;
  };
  dataKey: string;
} & RenderElementProps> = ({ attributes, node, dataKey, children }) => {
  const { selectedCell } = node;

  return (
    <td
      {...attributes}
      className={cx('table-td', { selectedCell })}
      slate-table-element="td"
      data-key={dataKey}
      colSpan={node.colspan}
      rowSpan={node.rowspan}
      onDragStart={e => e.preventDefault()}
      style={{
        position: 'relative',
        minWidth: '50px',
        width: node.width ? `${node.width}px` : 'auto',
        height: node.width ? `${node.height}px` : 'auto',
      }}
    >
      {/* <span
        contentEditable={false}
        style={{
          userSelect: 'none',
          position: 'absolute',
          right: 0,
          color: 'red',
          fontSize: 5,
        }}
      >
        {node.width}, {node.height}
      </span> */}
      {children}
    </td>
  );
};

import React, { useState, useCallback, useEffect } from 'react';
import { Editor, Transforms } from 'slate';
import { useEditor } from 'slate-react';
import { removeSelection, addSelection } from './selection';
import { useResizableTable } from './use-resizable';
import { defaultOptions } from './options';

const updateWidth = (editor, value) => {
  Object.keys(value).forEach(k => {
    const [block] = [
      ...Editor.nodes(editor, {
        at: [],
        match: n => n.key === k
      })
    ];
    if (!block) return;

    const selectedData = block[0].data;

    Transforms.setNodes(
      editor,
      {
        data: {
          ...selectedData,
          width: value[k]
        }
      },
      {
        at: [],
        match: n => n.key === k
      }
    );
  });
};

const Table = ({ onUpdate, store, children }) => {
  const editor = useEditor();

  const onInit = useCallback(
    values => {
      onUpdate(editor, values);
    },
    [editor, onUpdate]
  );

  const onResizeStart = useCallback(
    e => {
      e.stopPropagation();
      // editor.blur && editor.blur();
      removeSelection(editor);
    },
    [editor]
  );

  const onResizeStop = useCallback(
    (e, values) => {
      console.log('onResizeStop');
      // editor.blur && editor.blur();
      onUpdate(editor, values);
    },
    [editor, onUpdate]
  );

  const { ref } = useResizableTable({
    minimumCellWidth: defaultOptions.minimumCellWidth,
    onResizeStart,
    onResizeStop,
    onInit
  });

  const onClearSelection = useCallback(
    e => {
      removeSelection(editor);
    },
    [editor]
  );

  useEffect(() => {
    window.addEventListener('mousedown', onClearSelection);
    return () => {
      window.removeEventListener('mousedown', onClearSelection);
    };
  }, [onClearSelection]);

  const [holding, setHolding] = useState(false);
  const [startKey, setStartKey] = useState(null);

  const onSelected = useCallback(
    ({ target }) => {
      if (holding) {
        setHolding(false);
        setStartKey(null);
        if (target) {
          const cell = target.closest('td');
          if (cell) {
            const key = cell.getAttribute('data-key');
            store.setFocusCellBlock(key);
          }
        }
      }
    },
    [holding, setHolding, store]
  );

  return (
    <table
      slate-table-element="table"
      ref={ref}
      style={defaultOptions.tableStyle}
      onDragStart={e => e.preventDefault()}
      onMouseDown={({ target }) => {
        if (target) {
          setHolding(true);
          const cell = target.closest('td');
          if (cell) {
            const startKey = cell.getAttribute('data-key');
            setStartKey(startKey);
            store.setAnchorCellBlock(startKey);
          }
        }
      }}
      onMouseMove={({ target }) => {
        if (holding && target) {
          const cell = target.closest('td');
          if (cell) {
            const endKey = cell.getAttribute('data-key');
            addSelection(editor, startKey, endKey);
          }
        }
      }}
      onMouseUp={onSelected}
      onMouseLeave={onSelected}
    >
      <tbody slate-table-element="tbody">{children}</tbody>
    </table>
  );
};

const Cell = ({ node, dataKey, children }) => {
  const tdStyles = {
    width: `${node.data.width}px` || 'auto',
    ...(node.data.style || {})
  };

  if (node.selectionColor) {
    tdStyles.backgroundColor = node.selectionColor;
  }

  return (
    <td
      slate-table-element="td"
      data-key={dataKey}
      colSpan={node.colspan}
      rowSpan={node.rowspan}
      style={tdStyles}
    >
      {children}
    </td>
  );
};

export const TableElement = props => {
  const { store, children, element } = props;
  const editor = useEditor();

  switch (element.type) {
    case defaultOptions.typeTable: {
      return (
        <div style={{ overflowX: 'scroll' }}>
          <div>
            <Table editor={editor} store={store} onUpdate={updateWidth}>
              {children}
            </Table>
          </div>
        </div>
      );
    }

    case defaultOptions.typeRow: {
      return (
        <tr data-key={element.key} onDrag={e => e.preventDefault()}>
          {children}
        </tr>
      );
    }

    case defaultOptions.typeCell: {
      return (
        <Cell
          dataKey={element.key}
          editor={editor}
          store={store}
          node={children.props.node}
        >
          {children}
        </Cell>
      );
    }

    case defaultOptions.typeContent: {
      return <span slate-table-element="span">{children}</span>;
    }

    default:
      return;
  }
};

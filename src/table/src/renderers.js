import React, { memo, useState, useCallback, useEffect } from 'react';
import { Editor, Transforms } from "slate";
import { useEditor } from "slate-react";
import { removeSelection, addSelection } from './selection';
import { useResizableTable } from './use-resizable';
import { defaultOptions } from './option';
// import { HistoryEditor } from 'slate-history';
// import * as table from './layout';


// 表格组件
const Table = props => {
  const [disableResizing, forceUpdate] = useState(false);
  const maxWidth = typeof props.maxWidth === 'undefined' ? 'auto' : props.maxWidth + 'px';
  const editor = useEditor();
  const { onUpdate: update } = props;

  const onInit = useCallback((values) => {
    update(editor, values);
  }, [editor, update]);

  

  const onResizeStart = useCallback((e) => {
    e.stopPropagation();
    console.log('onResizeStart')
    // editor.blur && editor.blur();
    removeSelection(editor);
    // props.store.setAnchorCellBlock(null);
    // props.store.setFocusCellBlock(null);
  }, [editor]);

  const onResizeStop = useCallback((e, values) => {
    console.log('onResizeStop')
    // editor.blur && editor.blur();
    props.onResizeStop(editor, values);
  }, [editor, props]);

  // 执行 useResizeableTable.update 时触发 
  // const onUpdate = useCallback((values) => {
  //   update(editor, values);
  // }, [editor, update]);

  const {
    ref,
    // update,
  } = useResizableTable({
    disableResizing,
    maxWidth: props.maxWidth,
    minimumCellWidth: props.minimumCellWidth,
    onResizeStart,
    onResizeStop,
    // onResize,
    onInit,
    // onUpdate,
    onHandleHover: props.onHandleMouseOver,
  });

  // useEffect(() => {
  //   if (!ref.current) {
  //     ref.current = props.attributes && props.attributes.ref && props.attributes.ref.current;
  //   }
  //   update();
  // }, [props.attributes, ref, update]);

  useEffect(() => {
    props.store.subscribeDisableResizing(editor, v => {
      forceUpdate(v);
    });
  }, [editor, props.store]);

  // React.useImperativeHandle(tableRef, () => ({
  //   update: () => {
  //     update();
  //   },
  // }));

  const onClearSelection = useCallback(e => {
    removeSelection(editor);
  }, [editor]);

  useEffect(() => {
    window.addEventListener('mousedown', onClearSelection);
    return () => {
      window.removeEventListener('mousedown', onClearSelection);
    }
  }, [onClearSelection]);

  // useEffect(() => {
  //   addSelection(editor);
  // }, [editor, editor.selection]);

  const [holding, setHolding] = useState(false);
  const [startKey, setStartKey] = useState(null);

  const onSelected = useCallback(({ target }) => {
    if (holding) {
      setHolding(false);
      setStartKey(null);
      if (target) {
        const cell = target.closest('td');
        if (cell) {
          const key = cell.getAttribute('data-key');
          props.store.setFocusCellBlock(key);
        }
      }
    }
  }, [holding, setHolding, props.store]);

  return (
    <table
      ref={ref}
      style={{ ...props.style, maxWidth }}
      slate-table-element="table"
      // {...props.attributes}
      // type={props.type}
      onDragStart={e => {
        e.preventDefault();
      }}
      onMouseDown={({ target }) => {
        if (target) {
          setHolding(true);
          const cell = target.closest('td');
          if (cell) {
            const startKey = cell.getAttribute('data-key');
            setStartKey(startKey);
            props.store.setAnchorCellBlock(startKey);
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
      {props.children}
    </table>
  );
};






// 表格单元
const Cell = props => {
  // const editor = useEditor()

  // const onMouseUp = useCallback(e => {
  //   props.store.clearCellSelecting(props.editor);
  //   window.removeEventListener('mouseup', onMouseUp);
  // }, []);

  // const onWindowClick = useCallback(e => {
  //     if (!table.findCurrentTable(props.editor, props.opts)) {
  //       removeSelection(props.editor);
  //       props.store.setAnchorCellBlock(null);
  //       props.store.setFocusCellBlock(null);
  //       window.removeEventListener('click', onWindowClick);
  //     }
  //   },
  //   [props.editor, props.opts],
  // );

  // React.useEffect(() => {
  //   return () => {
  //     window.removeEventListener('mouseup', onMouseUp);
  //     window.removeEventListener('click', onWindowClick);
  //   };
  // }, [onMouseUp, onWindowClick]);

  const tdStyles = {
    width: `${props.node.data.width}px` || 'auto',
    ...(props.node.data.style || {}),
  };

  if (props.node.selectionColor) {
    tdStyles.backgroundColor = props.node.selectionColor;
  }

  return (
    <td
      // onMouseDown={e => {
      //   if (!(e.target instanceof HTMLElement)) return;
      //   props.store.setAnchorCellBlock(null);
      //   props.store.setFocusCellBlock(null);
      //   removeSelection(props.editor);
      //   props.store.setCellSelecting(props.editor);
      //   const anchorCellBlock = table.findCellBlockByElement(props.editor, e.target, props.opts);
      //   props.store.setAnchorCellBlock(anchorCellBlock);
      //   window.addEventListener('mouseup', onMouseUp);
      //   window.addEventListener('click', onWindowClick);
      // }}
      // onMouseOver={e => {
      //   e.stopPropagation();
      //   const anchorCellBlock = props.store.getAnchorCellBlock();
      //   if (anchorCellBlock === null) return;
      //   if (!(e.target instanceof HTMLElement)) return;
      //   if (!props.store.getCellSelecting()) return;
      //   const focusCellBlock = table.findCellBlockByElement(props.editor, e.target, props.opts);
      //   if (!focusCellBlock) return;
      //   const prevFocusBlock = props.store.getFocusCellBlock();

      //   if (focusCellBlock === prevFocusBlock) return;
      //   if (focusCellBlock.key === (prevFocusBlock && prevFocusBlock.key)) return;


      //   const t = table.TableLayout.create(props.editor, props.opts);
      //   if (!t) {
      //     removeSelection(props.editor);
      //     props.store.setAnchorCellBlock(null);
      //     props.store.setFocusCellBlock(null);
      //     return;
      //   }
      //   props.store.setFocusCellBlock(focusCellBlock);
      //   // HACK: Add ::selection style when greater than 1 cells selected.
      //   addSelectionStyle(props.editor);

      //   const blocks = table.createSelectedBlockMap(props.editor, anchorCellBlock.key, focusCellBlock.key, props.opts);

      //   HistoryEditor.withoutSaving(editor, () => {
      //     t.table.forEach(row => {
      //       row.forEach(cell => {
      //         if (blocks[cell.key]) {
      //           props.editor.setNodeByKey(cell.key, {
      //             type: cell.block.type,
      //             data: {
      //               ...cell.block.data.toObject(),
      //               selectionColor: props.opts.selectionColor,
      //             },
      //           });
      //         } else {
      //           props.editor.setNodeByKey(cell.key, {
      //             type: cell.block.type,
      //             data: {
      //               ...cell.block.data.toObject(),
      //               selectionColor: null,
      //             },
      //           });
      //         }
      //       });
      //     });
      //   });
      // }}

      // type={props.type}
      {...props.attributes}
      data-key={props['data-key']}
      colSpan={props.node.colspan}
      rowSpan={props.node.rowspan}
      style={tdStyles}
      slate-table-element="td"
    >
      {props.children}
    </td>
  );
};




// 表格文本内容
const Content = memo(({ attributes, children, type }) => {
  return (
    <span
      style={{ margin: 0 }}
      {...attributes}
      type={type}
      slate-table-element="span"
    >{children}</span>
  );
});






const updateWidth = (editor, value) => {
  Object.keys(value).forEach(k => {
    const [block] = Editor.nodes(editor, {
      at: editor.selection ? null : [],
      match: n => n.key === k,
    })
    if (!block || !block[0]) return;

    const selectedType = block[0].type;
    const selectedData = block[0].data;

    Transforms.setNodes(editor, {
      type: selectedType,
      data: { ...selectedData, width: value[k] },
    }, {
      at: editor.selection ? null : [],
      match: n => n.key === k,
    });
  });
}



// Table
export const TableElement = (props) => {
  const { store, attributes, children, element } = props;
  const editor = useEditor();

  switch (element.type) {
    case defaultOptions.typeTable: {
      return (
        <Table
          // ref={ref}
          // type={element.type}
          editor={editor}
          store={store}
          // onInit={updateWidth}
          onUpdate={updateWidth}
          onResizeStop={updateWidth}
          // maxWidth={null}
          minimumCellWidth={defaultOptions.minimumCellWidth}
          style={defaultOptions.tableStyle}
          attributes={attributes}
        >
          <tbody slate-table-element="tbody">{children}</tbody>
        </Table>
      )
    }

    case defaultOptions.typeRow: {
      return (
        <tr
          {...attributes}
          data-key={element.key}
          style={defaultOptions.rowStyle}
          onDrag={e => e.preventDefault()}
          // type={element.type}
        >
          {children}
        </tr>
      );
    }

    case defaultOptions.typeCell: {
      return (
        <Cell
          // type={element.type}
          data-key={element.key}
          editor={editor}
          store={store}
          node={children.props.node}
          attributes={attributes}
        >
          {children}
        </Cell>
      );
    }

    case defaultOptions.typeContent: {
      return (
        <Content
          // type={element.type}
          attributes={attributes}
        >
          {children}
        </Content>
      );
    }

    default:
      return;
  }
}
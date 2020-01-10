import React from 'react';
import { useEditor } from "slate-react";
import { defaultOptions } from './option';
import { TableElement } from './renderers';
import { ComponentStore } from './store';
import commands from './commands';

const TABLE_HANDLER = 'table_handler';
const store = new ComponentStore();

const withTable = editor => {
  const { exec } = editor
  editor.exec = command => {
    if (command.type === TABLE_HANDLER) {
      commands[command.method](
        editor,
        store.getAnchorCellBlock(),
        store.getFocusCellBlock(),
      );
    } else {
      exec(command)
    }
  }

  return editor
}

const TableToolbar = () => {
  const editor = useEditor();
  const TableToolbarBtn = ({ method, children }) => {
    return (
      <button onMouseDown={event => {
        event.preventDefault();
        editor.exec({ type: TABLE_HANDLER, method });
      }}>{children}</button>
    )
  }

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
      <TableToolbarBtn method="disableResizing">disable resizing</TableToolbarBtn>
      <TableToolbarBtn method="enableResizing">enable resizing</TableToolbarBtn>
    </>
  )
}

const Table = props => <TableElement {...props} store={store} />

export {
  withTable,
  TableToolbar,
  defaultOptions,
  Table,
}
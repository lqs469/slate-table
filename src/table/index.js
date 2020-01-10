import React, { useCallback, useMemo, useState } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import {
  Table,
  withTable,
  TableToolbar,
  defaultOptions,
} from './src/slate-table';

import initialValue from './initialValue';
import './index.css';

import * as _slate from 'slate';
import * as _react_slate from 'slate-react';
console.log(_slate, _react_slate);

export default function CustomEditor() {
  const [value, setValue] = useState(initialValue);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withTable(withHistory(withReact(createEditor()))),
    [],
  );

  return (
    <div style={{ width: '700px', margin: '20px auto' }}>
      <Slate
        editor={editor}
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      >
        <TableToolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="在这里输入..."
          spellCheck
          autoFocus
        />
      </Slate>
    </div>
  );
};

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    case defaultOptions.typeTable:
    case defaultOptions.typeRow:
    case defaultOptions.typeCell:
    case defaultOptions.typeContent:
      return <Table {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({
  attributes,
  children,
  // leaf,
}) => (<span {...attributes}>{children}</span>);


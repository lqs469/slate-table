import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Table,
  withTable,
  TableToolbar,
  defaultOptions,
} from './src/slate-table';

import initialValue from './initialValue';
import './index.css';

const Element = (props: RenderElementProps) => {
  const { attributes, children, element } = props;

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

const Leaf = (props: RenderElementProps) => (
  <span {...props.attributes}>{props.children}</span>
);

export default function CustomEditor() {
  const [value, setValue] = useState<Node[]>(initialValue);

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
        onChange={value => {
          setValue(value);
        }}
      >
        <TableToolbar />
        <hr />
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
}

import ReactDOM from 'react-dom';
import React, { useState, useMemo } from 'react';
import { Node, createEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { renderElement, renderLeaf, withSchema } from './elements';
import { withHistory } from 'slate-history';
import './index.css';

import initialValue from './initialValue';
import { Button } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import { insertTable } from './elements/table';

const Editor = () => {
  const [value, setValue] = useState<Node[]>(initialValue);

  const editor = useMemo(
    () => withSchema(withHistory(withReact(createEditor()))),
    [],
  ) as ReactEditor;

  return (
    <div className="editor-box">
      <Slate editor={editor} value={value} onChange={setValue}>
        <div className="toolbar">
          <Button
            icon={<TableOutlined />}
            onMouseDown={() => {
              insertTable(editor);
            }}
          />
        </div>
        <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
      </Slate>
    </div>
  );
};

ReactDOM.render(<Editor />, document.getElementById('root'));

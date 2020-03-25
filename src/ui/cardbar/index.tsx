import React, { HTMLAttributes } from 'react';
import cx from 'classnames';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './index.css';

interface CardbarProps extends HTMLAttributes<HTMLDivElement> {
  delete?: () => void;
}

const exec = (func: Function, ...args: any[]) => (e?: React.MouseEvent) => {
  e && e.preventDefault();
  return func(...args);
};

export const Cardbar: React.FC<CardbarProps> = props => {
  return (
    <div className={cx('cardbar', props.className)}>
      <Button.Group>
        {props.children}
        {props.delete && (
          <Button icon={<DeleteOutlined />} onMouseDown={exec(props.delete)} />
        )}
      </Button.Group>
    </div>
  );
};

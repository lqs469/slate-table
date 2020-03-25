import React, {
  HTMLAttributes,
  useCallback,
  useMemo,
  useEffect,
  useState,
  useRef,
} from 'react';
import { useSlate, useEditor } from 'slate-react';
import { Editor, Transforms, NodeEntry } from 'slate';
import { Button } from 'antd';
import {
  InsertRowAboveOutlined,
  InsertRowBelowOutlined,
  InsertRowLeftOutlined,
  InsertRowRightOutlined,
  MergeCellsOutlined,
  DeleteColumnOutlined,
  DeleteRowOutlined,
  SplitCellsOutlined,
} from '@ant-design/icons';
import { Cardbar } from '../../ui';
import { removeTable } from '../table';
import {
  insertAbove,
  insertBelow,
  insertLeft,
  insertRight,
  mergeSelection,
  removeColumn,
  splitCell,
  removeRow,
} from './commands';
import cx from 'classnames';
import { splitedTable } from './selection';
import { options } from './options';
import './ui.css';

interface TableCardbarProps extends HTMLAttributes<HTMLDivElement> {}

export const TableCardbar: React.FC<TableCardbarProps> = props => {
  const editor = useSlate();

  const [table] = Array.from(
    Editor.nodes(editor, {
      match: n => n.type === 'table',
    }),
  );

  const run = (action: (table: any, editor: Editor) => any) => () =>
    action(table, editor);

  return (
    <Cardbar
      className={cx(props.className, 'table-cardbar')}
      delete={run(removeTable)}
    >
      <Button
        icon={<InsertRowAboveOutlined />}
        onMouseDown={run(insertAbove)}
      />
      <Button
        icon={<InsertRowBelowOutlined />}
        onMouseDown={run(insertBelow)}
      />
      <Button icon={<InsertRowLeftOutlined />} onMouseDown={run(insertLeft)} />
      <Button
        icon={<InsertRowRightOutlined />}
        onMouseDown={run(insertRight)}
      />
      <Button icon={<MergeCellsOutlined />} onMouseDown={run(mergeSelection)} />
      <Button icon={<DeleteColumnOutlined />} onMouseDown={run(removeColumn)} />
      <Button icon={<DeleteRowOutlined />} onMouseDown={run(removeRow)} />
      <Button icon={<SplitCellsOutlined />} onMouseDown={run(splitCell)} />
    </Cardbar>
  );
};

export const HorizontalToolbar: React.FC<{
  table: HTMLElement;
  tableNode: NodeEntry;
}> = ({ table, tableNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useEditor();
  const [cols, setCols] = useState<{ width: number; el: HTMLElement[] }[]>([]);

  useEffect(() => {
    const { gridTable = [] } = splitedTable(editor, tableNode);
    if (!gridTable.length) return;

    const colsArray = [] as { width: number; el: HTMLElement[] }[];
    for (let i = 0; i < gridTable[0].length; i++) {
      for (let j = 0; j < gridTable.length; j++) {
        const currCol = gridTable[j][i];
        const td = table.querySelector(
          `[data-key=${currCol.cell.key}]`,
        ) as HTMLElement;

        if (!td) continue;

        if (!colsArray[i]) {
          colsArray[i] = {
            width: 0,
            el: [],
          };
        }

        if (currCol.isReal) {
          colsArray[i].width = !colsArray[i].width
            ? td.offsetWidth
            : Math.min(colsArray[i].width, td.offsetWidth);
        }

        if (
          colsArray[i].el.findIndex(
            ({ dataset }) => dataset.key === td.dataset.key,
          ) < 0
        ) {
          colsArray[i].el.push(td);
        }
      }
    }

    setCols(() => colsArray);
  }, [editor, table, tableNode]);

  const maxWidth = useMemo(() => table.closest('div')?.offsetWidth, [table]);

  const [startFromX, setStartFromX] = useState<number>(0);

  const onHandleDragStart = useCallback((e: React.MouseEvent) => {
    setStartFromX(e.clientX);
  }, []);

  const onHandleDrag = useCallback(
    (item: { width: number; el: HTMLElement[] }, index: number) => (
      e: React.MouseEvent,
    ) => {
      const changedWidth = e.clientX - startFromX;

      if (!changedWidth || !e.clientX) {
        return;
      }

      const tableWidthAfterChanged = table.offsetWidth + changedWidth;

      if (item.el && maxWidth && tableWidthAfterChanged < maxWidth) {
        const dragger = ref.current?.querySelector(
          `#horizontal-dragger-item-${index}`,
        ) as HTMLElement;
        const draggerWidth = dragger.offsetWidth;

        if (draggerWidth + changedWidth > options.defaultWidth) {
          dragger.style.width = `${draggerWidth + changedWidth}px`;
        }

        const savedChangedWidth = [];
        let moreThanMinWidth = true;
        for (const cell of item.el) {
          if (cell.offsetWidth + changedWidth <= options.defaultWidth) {
            moreThanMinWidth = false;
            break;
          }
          savedChangedWidth.push({
            target: cell,
            width: cell.offsetWidth + changedWidth,
          });
        }

        if (moreThanMinWidth) {
          savedChangedWidth.forEach(item => {
            item.target.style.width = `${item.width}px`;
          });
        }
      }

      setStartFromX(e.clientX);
    },
    [startFromX, maxWidth, table],
  );

  const onHandleDragEnd = useCallback(
    (item: { width: number; el: HTMLElement[] }, index: number) => () => {
      if (item.el) {
        for (const cell of item.el) {
          Transforms.setNodes(
            editor,
            {
              width: cell.offsetWidth,
            },
            {
              at: tableNode[1],
              match: n => n.key === cell.dataset.key,
            },
          );
        }

        const dragger = ref.current?.querySelector(
          `#horizontal-dragger-item-${index}`,
        ) as HTMLElement;
        const draggerWidth = dragger.offsetWidth;

        const newCols = Array.from(cols);
        newCols[index] = {
          width: draggerWidth,
          el: item.el,
        };
        setCols(() => newCols);
      }
    },
    [cols, editor, tableNode],
  );

  return (
    <div contentEditable={false} className="table-horizontal-toolbar" ref={ref}>
      {cols.map((item, index) => (
        <div
          key={index}
          className="table-dragger-item"
          style={{ width: `${item.width}px` }}
          id={`horizontal-dragger-item-${index}`}
        >
          <div
            className="table-trigger"
            draggable
            onDragStart={onHandleDragStart}
            onDrag={onHandleDrag(item, index)}
            onDragEnd={onHandleDragEnd(item, index)}
          ></div>
        </div>
      ))}
    </div>
  );
};

export const VerticalToolbar: React.FC<{
  table: HTMLElement;
  tableNode: NodeEntry;
}> = ({ table, tableNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useEditor();
  const [rows, setRows] = useState<{ height: number; el: HTMLElement[] }[]>([]);

  useEffect(() => {
    const { gridTable = [] } = splitedTable(editor, tableNode);
    if (!gridTable.length) return;

    const rowsArray = [] as { height: number; el: HTMLElement[] }[];

    for (let i = 0; i < gridTable.length; i++) {
      for (let j = 0; j < gridTable[i].length; j++) {
        const currCell = gridTable[i][j];
        const td = table.querySelector(
          `[data-key=${currCell.cell.key}]`,
        ) as HTMLElement;

        if (!td) continue;

        if (!rowsArray[i]) {
          rowsArray[i] = {
            height: 0,
            el: [],
          };
        }

        if (currCell.isReal) {
          rowsArray[i].height = !rowsArray[i].height
            ? td.offsetHeight
            : Math.min(rowsArray[i].height, td.offsetHeight);
        }

        if (
          rowsArray[i].el.findIndex(
            ({ dataset }) => dataset.key === td.dataset.key,
          ) < 0
        ) {
          rowsArray[i].el.push(td);
        }
      }
    }

    setRows(() => rowsArray);
  }, [editor, table, tableNode]);

  const [startFromY, setStartFromY] = useState<number>(0);

  const onHandleDragStart = useCallback((e: React.MouseEvent) => {
    setStartFromY(e.clientY);
  }, []);

  const onHandleDrag = useCallback(
    (item: { height: number; el: HTMLElement[] }, index: number) => (
      e: React.MouseEvent,
    ) => {
      const changedHeight = e.clientY - startFromY;

      if (!changedHeight || !e.clientY) {
        return;
      }

      if (item.el) {
        const minHeight = options.defaultHeight;

        const dragger = ref.current?.querySelector(
          `#vertical-dragger-item-${index}`,
        ) as HTMLElement;
        const draggerHeight = dragger.offsetHeight;

        if (draggerHeight + changedHeight > minHeight) {
          dragger.style.height = `${draggerHeight + changedHeight}px`;
        }

        const savedChangedHeight = [];
        let moreThanMinHeight = true;
        for (const cell of item.el) {
          if (cell.offsetHeight + changedHeight < minHeight) {
            moreThanMinHeight = false;
            break;
          }

          savedChangedHeight.push({
            td: cell,
            height: cell.offsetHeight + changedHeight,
          });
        }

        if (moreThanMinHeight) {
          savedChangedHeight.forEach(item => {
            item.td.style.height = `${item.height}px`;
          });
        }
      }

      setStartFromY(e.clientY);
    },
    [startFromY],
  );

  const onHandleDragEnd = useCallback(
    (item: { height: number; el: HTMLElement[] }, index: number) => () => {
      if (item.el) {
        for (const cell of item.el) {
          Transforms.setNodes(
            editor,
            {
              height: cell.offsetHeight,
            },
            {
              at: tableNode[1],
              match: n => n.key === cell.dataset.key,
            },
          );
        }

        const dragger = ref.current?.querySelector(
          `#vertical-dragger-item-${index}`,
        ) as HTMLElement;
        const draggerHeight = dragger.offsetHeight;

        const newRows = Array.from(rows);
        newRows[index] = {
          height: draggerHeight,
          el: item.el,
        };
        setRows(() => newRows);
      }
    },
    [rows, editor, tableNode],
  );

  return (
    <div contentEditable={false} className="table-vertical-toolbar" ref={ref}>
      {rows.map((item, index) => (
        <div
          key={index}
          className="table-dragger-item"
          style={{ height: `${item.height}px` }}
          id={`vertical-dragger-item-${index}`}
        >
          <div
            className="table-trigger"
            draggable
            onDragStart={onHandleDragStart}
            onDrag={onHandleDrag(item, index)}
            onDragEnd={onHandleDragEnd(item, index)}
          ></div>
        </div>
      ))}
    </div>
  );
};

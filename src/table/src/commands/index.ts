import insertTable from './insertTable';
import insertBelow from './insertBelow';
import insertAbove from './insertAbove';
import insertRight from './insertRight';
import insertLeft from './insertLeft';
import removeTable from './removeTable';
import removeColumn from './removeColumn';
import removeRow from './removeRow';
import mergeSelection from './mergeSelection';
import splitCell from './splitCell';
import { Editor } from 'slate';

const commands: {
  [key: string]: (
    editor: Editor,
    startKey?: string | null,
    endKey?: string | null,
  ) => any;
} = {
  insertTable,
  insertAbove,
  insertBelow,
  insertRight,
  insertLeft,
  removeTable,
  removeColumn,
  removeRow,
  mergeSelection,
  splitCell,
};

export default commands;

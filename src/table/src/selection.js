// import { HistoryEditor } from 'slate-history';
import { Transforms, Editor } from "slate";
import { defaultOptions } from "./option";

const insertStyleId = '__slate__table__id';

// const isBlock = (block) => {
//   console.log('[selection.js]🤯[isBlock]', block);
//   return true;
// }

export function removeSelection(editor) {
  Transforms.unsetNodes(editor, 'selectionColor', {
    at: {},
    match: n => !!n.selectionColor,
  });

  // removeSelectionStyle();
  // HistoryEditor.withoutSaving(editor, () => {
  //   const editors = document.querySelectorAll('[data-slate-editor]');
  //   Array.from(editors).forEach(e => {
  //     const tables = e.querySelectorAll('table');
  //     tables.forEach(table => {
  //       const { key } = table.dataset;
  //       if (!key) return;
  //       const tableBlock = editor.value.document.getNode(key);

  //       if (!isBlock(tableBlock)) return;

  //       tableBlock.nodes.forEach(row => {
  //         if (!isBlock(row)) return;

  //         row.nodes.forEach(cell => {
  //           if (!isBlock(cell)) return;

  //           editor.setNodeByKey(cell.key, {
  //             type: cell.type,
  //             data: { ...cell.data.toObject(), selectionColor: null },
  //           });
  //         });
  //       });
  //     });
  //   });
  //   removeSelectionStyle();
  // });
}

export function removeSelectionStyle() {
  const style = document.querySelector(`style#${insertStyleId}`);
  if (style) {
    const head = document.getElementsByTagName('head');
    const first = head && head.item(0);
    first && first.removeChild(style);
  }
}

export function addSelectionStyle(editor) {
  // HACK: Add ::selection style when greater than 1 cells selected.
  if (!document.querySelector(`style#${insertStyleId}`)) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = insertStyleId;
    const head = document.getElementsByTagName('head');
    const first = head && head.item(0);

    if (first) {
      first.appendChild(style);
      const stylesheet = style.sheet;

      if (stylesheet) {
        stylesheet.insertRule(`table *::selection { background: none; }`, stylesheet.cssRules.length);
      }
    }
  }

  const { selection } = editor;
  if (!selection) return;

  const [table] = [...Editor.nodes(editor, {
    match: n => n.type === defaultOptions.typeTable,
  })];
  if (!table) return;
  const tableDepth = table[1].length;

  let cells = [...Editor.nodes(editor, {
    at: table[1],
    match: n => n.type === defaultOptions.typeCell,
  })];
  
  if (!cells || !cells.length) return;

  cells = cells.map(([cell, path]) => ([cell, path.slice(tableDepth)]));

  let headPath = [];
  let tailPath = [];
  selection.anchor.path.forEach((item, index) => {
    headPath.push(Math.min(item, selection.focus.path[index]));
    tailPath.push(Math.max(item, selection.focus.path[index]));
  });
  headPath = headPath.slice(tableDepth);
  tailPath = tailPath.slice(tableDepth);

  const coverCellsPath = [];
  cells.forEach(([cell, path]) => {
    const isOver = path.findIndex((item, index) => {
      if (item < headPath[index] || item > tailPath[index]) {
        return true;
      }
      return false;
    });

    if (isOver < 0) {
      coverCellsPath.push([cell, path]);
    }
  })

  coverCellsPath.forEach(([, path]) => {
    const at = table[1].concat(path);
    Transforms.setNodes(editor, {
      selectionColor: 'rgb(185, 211, 252)',
    }, {
      at,
      match: n => n.type === defaultOptions.typeCell,
    });
  });
}
// import { Block, BlockJSON, Text } from 'slate';
import { defaultOptions } from './option';

export function createCell(elements, data) {
  const { typeCell, typeContent, defaultColumnWidth } = defaultOptions;

  return {
    type: typeCell,
    key: `cell_${new Date().getTime()}`,
    children: [
      {
        type: typeContent,
        children: elements || [{ text: 'P' }],
      },
    ],
    data: {
      width: defaultColumnWidth,
      ...data,
    },
  };
}
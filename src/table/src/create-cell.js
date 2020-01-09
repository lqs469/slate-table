import { defaultOptions } from './option';
import uuidv4 from 'uuid/v4';

export function createCell({ elements, data = {}, colspan, rowspan } = {}) {
  const { typeCell, typeContent, defaultColumnWidth } = defaultOptions;

  return {
    type: typeCell,
    key: `cell_${uuidv4()}`,
    children: [
      {
        type: typeContent,
        children: elements || [{ text: '' }],
      },
    ],
    data: {
      width: defaultColumnWidth,
      ...data,
    },
    colspan,
    rowspan,
  };
}

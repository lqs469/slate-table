export default [
  {
    type: 'paragraph',
    children: [{ text: 'Lorem ipsum...' }],
  },
  {
    type: 'editable_table',
    data: {},
    children: [
      {
        type: 'editable_table_row',
        key: 'row_0',
        children: [
          {
            type: 'editable_table_cell',
            key: 'cell_0',
            data: {
              width: 200,
            },
            rowspan: 2,
            colspan: 2,
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a1' }],
                  },
                ],
              },
            ],
          },
          // {
          //   "type": "editable_table_cell",
          //   key: 'cell_1',
          //   // rowspan: 2,
          //   "children": [
          //     {
          //       "type": "editable_table_content",
          //       "children": [
          //         { text: 'a1' },
          //       ]
          //     }
          //   ],
          //   "data": {
          //     "width": 15
          //   }
          // },
          {
            type: 'editable_table_cell',
            key: 'cell_2',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a2' }],
                  },
                ],
              },
            ],
            data: {
              width: 15,
            },
          },
        ],
        data: {},
      },
      {
        type: 'editable_table_row',
        key: 'row_1',
        children: [
          // {
          //   "type": "editable_table_cell",
          //   key: 'cell_3',
          //   "children": [
          //     {
          //       "type": "editable_table_content",
          //       "children": [
          //         {
          //           type: 'paragraph',
          //           children: [
          //             { text: 'a3' },
          //           ],
          //         },
          //       ]
          //     }
          //   ],
          //   "data": {
          //     "width": 15
          //   }
          // },
          // {
          //   "type": "editable_table_cell",
          //   key: 'cell_4',
          //   // colspan: 2,
          //   "children": [
          //     {
          //       "type": "editable_table_content",
          //       "children": [
          //         {
          //           type: 'paragraph',
          //           children: [
          //             { text: 'a4' },
          //           ],
          //         },
          //       ]
          //     }
          //   ],
          //   "data": {
          //     "width": 200
          //   }
          // },
          {
            type: 'editable_table_cell',
            key: 'cell_5',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a5' }],
                  },
                ],
              },
            ],
            data: {
              width: 200,
            },
          },
        ],
        data: {},
      },
      {
        type: 'editable_table_row',
        key: 'row_2',
        children: [
          {
            type: 'editable_table_cell',
            key: 'cell_6',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a6' }],
                  },
                ],
              },
            ],
            data: {
              width: 100,
            },
          },
          {
            type: 'editable_table_cell',
            key: 'cell_7',
            colspan: 2,
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a7' }],
                  },
                ],
              },
            ],
            data: {
              width: 200,
            },
          },
          // {
          //   "type": "editable_table_cell",
          //   key: 'cell_8',
          //   "children": [
          //     {
          //       "type": "editable_table_content",
          //       "children": [
          //         {
          //           type: 'paragraph',
          //           children: [
          //             { text: 'a8' },
          //           ],
          //         },
          //       ]
          //     }
          //   ],
          //   "data": {
          //     "width": 200
          //   }
          // }
        ],
        data: {},
      },
      {
        type: 'editable_table_row',
        key: 'row_3',
        children: [
          {
            type: 'editable_table_cell',
            key: 'cell_9',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a9' }],
                  },
                ],
              },
            ],
            data: {
              width: 15,
            },
          },
          {
            type: 'editable_table_cell',
            key: 'cell_10',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a10' }],
                  },
                ],
              },
            ],
            data: {
              width: 200,
            },
          },
          {
            type: 'editable_table_cell',
            key: 'cell_11',
            children: [
              {
                type: 'editable_table_content',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'a11' }],
                  },
                ],
              },
            ],
            data: {
              width: 200,
            },
          },
        ],
        data: {},
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

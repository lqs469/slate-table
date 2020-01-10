export class ComponentStore {
  // INFO: Use MAP with editor as key
  //       This is needed to support multi editor and singleton plugin.
  resizeDisableMap = new Map();
  resizeDisableEmitterMap = new Map();
  isCellSelecting = false;

  subscribeDisableResizing = (editor, f) => {
    const emitters = this.resizeDisableEmitterMap.get(editor) || [];
    this.resizeDisableEmitterMap.set(editor, [...emitters, f]);
    f(this.resizeDisableMap.get(editor) || false);
  };

  setDisableResizing = (editor, v) => {
    this.resizeDisableMap.set(editor, v);
    const emitters = this.resizeDisableEmitterMap.get(editor) || [];
    emitters.forEach(e => {
      e(v);
    });
  };

  setAnchorCellBlock = (b) => (this.anchorCellBlock = b);
  getAnchorCellBlock = () => this.anchorCellBlock;

  setFocusCellBlock = (b) => (this.focusCellBlock = b);
  getFocusCellBlock = () => this.focusCellBlock;
  
  setCellSelecting = (editor) => {
    this.isCellSelecting = true;
    // Disable resizing when cell selection started
    const emitters = this.resizeDisableEmitterMap.get(editor) || [];
    emitters.forEach(e => {
      e(true);
    });
  };
  clearCellSelecting = (editor) => {
    this.isCellSelecting = false;
    const v = this.resizeDisableMap.get(editor);
    const emitters = this.resizeDisableEmitterMap.get(editor) || [];
    emitters.forEach(e => {
      e(!!v);
    });
  };
  getCellSelecting = () => this.isCellSelecting;

  dispose = () => {
    this.resizeDisableMap.clear();
    this.resizeDisableEmitterMap.clear();
  };
}
/** Layout command types — all mutations go through commands (Program 2.2) */

export const LayoutCommandTypes = Object.freeze({
  ADD_COMPONENT: "layout/command/addComponent",
  DELETE_COMPONENT: "layout/command/deleteComponent",
  MOVE_COMPONENT: "layout/command/moveComponent",
  RESIZE_COMPONENT: "layout/command/resizeComponent",
  DUPLICATE_COMPONENT: "layout/command/duplicateComponent",
  REORDER_COMPONENT: "layout/command/reorderComponent",
  UPDATE_PROPERTY: "layout/command/updateProperty",
  UPDATE_BINDING: "layout/command/updateBinding",
  UPDATE_STYLE: "layout/command/updateStyle",
});

export default LayoutCommandTypes;

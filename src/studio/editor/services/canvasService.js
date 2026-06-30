/** Canvas Service — canvas editing surface coordination (Program 2.2.7) */

export function createCanvasService(deps = {}) {
  const { hub } = deps;

  const selectObject = ({ designerId, objectId, objectKind, metadata = {} }) => {
    hub?.publish?.("editor.canvas.select", { designerId, objectId, objectKind, metadata });
    return Object.freeze({ objectId, objectKind, metadata });
  };

  const configure = ({ designerId, renderCanvas }) =>
    Object.freeze({ designerId, renderCanvas });

  return Object.freeze({ selectObject, configure });
}

export default createCanvasService;

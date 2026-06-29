import { LayoutCommandTypes } from "./layoutCommandTypes.js";

function cloneDocument(doc) {
  return JSON.parse(JSON.stringify(doc));
}

function findComponentPath(pages, componentId) {
  for (let pi = 0; pi < pages.length; pi += 1) {
    const page = pages[pi];
    for (let si = 0; si < (page.sections ?? []).length; si += 1) {
      const section = page.sections[si];
      for (let ci = 0; ci < (section.containers ?? []).length; ci += 1) {
        const container = section.containers[ci];
        const idx = (container.components ?? []).findIndex((c) => c.componentId === componentId);
        if (idx >= 0) return { pi, si, ci, idx };
      }
    }
  }
  return null;
}

function applyCommand(doc, command) {
  const next = cloneDocument(doc);
  const pages = next.pages?.length ? next.pages : [{ pageId: "page.main", label: "Principal", sections: [] }];
  next.pages = pages;

  switch (command.type) {
    case LayoutCommandTypes.ADD_COMPONENT: {
      const { sectionId, component } = command.payload;
      const page = pages[0];
      let section = page.sections?.find((s) => s.sectionId === sectionId);
      if (!section) {
        section = { sectionId, label: sectionId, containers: [], bindings: [], rules: [] };
        page.sections = [...(page.sections ?? []), section];
      }
      let container = section.containers?.[0];
      if (!container) {
        container = { containerId: `container.${sectionId}`, type: "panel", components: [], styles: {}, bindings: [] };
        section.containers = [container];
      }
      container.components = [...(container.components ?? []), component];
      break;
    }
    case LayoutCommandTypes.DELETE_COMPONENT: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const container = pages[path.pi].sections[path.si].containers[path.ci];
      container.components = container.components.filter((_, i) => i !== path.idx);
      break;
    }
    case LayoutCommandTypes.MOVE_COMPONENT: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const container = pages[path.pi].sections[path.si].containers[path.ci];
      const component = container.components[path.idx];
      component.frame = { ...component.frame, ...command.payload.frame };
      break;
    }
    case LayoutCommandTypes.RESIZE_COMPONENT: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const component = pages[path.pi].sections[path.si].containers[path.ci].components[path.idx];
      component.frame = { ...component.frame, ...command.payload.frame };
      break;
    }
    case LayoutCommandTypes.DUPLICATE_COMPONENT: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const container = pages[path.pi].sections[path.si].containers[path.ci];
      const source = container.components[path.idx];
      const duplicate = {
        ...cloneDocument({ c: source }).c,
        componentId: `${source.componentId}.copy.${Date.now()}`,
        frame: {
          ...source.frame,
          x: (source.frame?.x ?? 0) + 16,
          y: (source.frame?.y ?? 0) + 16,
        },
      };
      container.components = [...container.components, duplicate];
      break;
    }
    case LayoutCommandTypes.REORDER_COMPONENT: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const container = pages[path.pi].sections[path.si].containers[path.ci];
      const list = [...container.components];
      const [item] = list.splice(path.idx, 1);
      list.splice(command.payload.toIndex, 0, item);
      container.components = list;
      break;
    }
    case LayoutCommandTypes.UPDATE_PROPERTY: {
      const path = findComponentPath(pages, command.payload.componentId);
      if (!path) break;
      const component = pages[path.pi].sections[path.si].containers[path.ci].components[path.idx];
      component.props = { ...component.props, [command.payload.propertyId]: command.payload.value };
      break;
    }
    case LayoutCommandTypes.UPDATE_BINDING: {
      if (command.payload.componentId) {
        const path = findComponentPath(pages, command.payload.componentId);
        if (path) {
          const component = pages[path.pi].sections[path.si].containers[path.ci].components[path.idx];
          component.bindings = command.payload.bindings;
        }
      } else {
        next.bindings = command.payload.bindings;
      }
      break;
    }
    case LayoutCommandTypes.UPDATE_STYLE: {
      if (command.payload.componentId) {
        const path = findComponentPath(pages, command.payload.componentId);
        if (path) {
          const component = pages[path.pi].sections[path.si].containers[path.ci].components[path.idx];
          component.styles = { ...component.styles, ...command.payload.styles };
        }
      } else {
        next.styles = { ...next.styles, ...command.payload.styles };
      }
      break;
    }
    default:
      break;
  }

  return next;
}

/**
 * Creates layout command bus — wraps SDK history; no direct state mutation.
 * @param {{ store: ReturnType<import("../document/layoutDocumentStore.js").createLayoutDocumentStore>, history: object, onAfterExecute?: Function }} deps
 */
export function createLayoutCommandBus(deps) {
  const { store, history, onAfterExecute } = deps;

  const run = async (command) => {
    const before = store.getState();
    const after = applyCommand(before, command);
    return history.pushCommand({
      id: command.id ?? command.type,
      label: command.label ?? command.type,
      execute: async () => {
        store._replaceDocument(after);
        await onAfterExecute?.(store.getState());
      },
      undo: async () => {
        store._replaceDocument(before);
        await onAfterExecute?.(store.getState());
      },
    });
  };

  return Object.freeze({
    addComponent(sectionId, component, label = "Adicionar componente") {
      return run({
        type: LayoutCommandTypes.ADD_COMPONENT,
        id: `add.${component.componentId}`,
        label,
        payload: { sectionId, component },
      });
    },
    deleteComponent(componentId, label = "Remover componente") {
      return run({
        type: LayoutCommandTypes.DELETE_COMPONENT,
        id: `delete.${componentId}`,
        label,
        payload: { componentId },
      });
    },
    moveComponent(componentId, frame, label = "Mover componente") {
      return run({
        type: LayoutCommandTypes.MOVE_COMPONENT,
        id: `move.${componentId}`,
        label,
        payload: { componentId, frame },
      });
    },
    resizeComponent(componentId, frame, label = "Redimensionar componente") {
      return run({
        type: LayoutCommandTypes.RESIZE_COMPONENT,
        id: `resize.${componentId}`,
        label,
        payload: { componentId, frame },
      });
    },
    duplicateComponent(componentId, label = "Duplicar componente") {
      return run({
        type: LayoutCommandTypes.DUPLICATE_COMPONENT,
        id: `duplicate.${componentId}`,
        label,
        payload: { componentId },
      });
    },
    reorderComponent(componentId, toIndex, label = "Reordenar componente") {
      return run({
        type: LayoutCommandTypes.REORDER_COMPONENT,
        id: `reorder.${componentId}`,
        label,
        payload: { componentId, toIndex },
      });
    },
    updateProperty(componentId, propertyId, value, label = "Editar propriedade") {
      return run({
        type: LayoutCommandTypes.UPDATE_PROPERTY,
        id: `prop.${componentId}.${propertyId}`,
        label,
        payload: { componentId, propertyId, value },
      });
    },
    updateBinding(bindings, componentId = null, label = "Editar binding") {
      return run({
        type: LayoutCommandTypes.UPDATE_BINDING,
        id: `binding.${componentId ?? "document"}`,
        label,
        payload: { bindings, componentId },
      });
    },
    updateStyle(styles, componentId = null, label = "Editar estilo") {
      return run({
        type: LayoutCommandTypes.UPDATE_STYLE,
        id: `style.${componentId ?? "document"}`,
        label,
        payload: { styles, componentId },
      });
    },
  });
}

export default createLayoutCommandBus;

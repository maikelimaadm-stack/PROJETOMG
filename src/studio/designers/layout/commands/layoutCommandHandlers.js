import { LayoutCommandTypes } from "./layoutCommandTypes.js";

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

/** Layout-specific command apply handler — used by Studio Core Command Engine */
export function applyLayoutCommand(doc, command) {
  const next = doc;
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
    case LayoutCommandTypes.MOVE_COMPONENT:
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
        ...JSON.parse(JSON.stringify(source)),
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

export default applyLayoutCommand;

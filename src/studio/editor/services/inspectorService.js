/** Inspector Service — reusable Inspector panel (Program 2.2.7) */

export function createInspectorService() {
  const configure = ({ fields = [], emptyState = "Selecione uma entrada" }) =>
    Object.freeze({ fields, emptyState });

  const field = (label, value) => Object.freeze({ label, value });

  return Object.freeze({ configure, field });
}

export default createInspectorService;

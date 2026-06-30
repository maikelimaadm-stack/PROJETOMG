/** Binding Engine — field, expression, relationship, formula, dataset, api, ai bindings (Program 2.2.6) */

export const BINDING_ENGINE_VERSION = "mak-som-binding-v1";

export function createBindingEngine() {
  /** @type {Map<string, { kind: string, validate?: Function, resolve?: Function }>} */
  const kinds = new Map();

  const registerBindingKind = ({ kind, validate, resolve }) => {
    if (!kind) throw new Error("Binding kind registration requires kind.");
    kinds.set(kind, { kind, validate, resolve });
    return kind;
  };

  const normalizeBinding = (binding) => {
    const kind = binding.bindingKind ?? binding.binding_kind ?? "entry";
    const normalized = Object.freeze({
      bindingKind: kind,
      targetId: binding.targetId ?? binding.target_id ?? "",
      sourceId: binding.sourceId ?? binding.source_id ?? null,
      expression: binding.expression ?? null,
      metadata: Object.freeze({ ...(binding.metadata ?? {}) }),
    });
    const handler = kinds.get(kind);
    return handler?.resolve ? handler.resolve(normalized) : normalized;
  };

  const normalizeAll = (bindings = []) =>
    Object.freeze((bindings ?? []).map((b) => normalizeBinding(b)));

  const createBinding = ({ kind, targetId, sourceId = null, expression = null, metadata = {} }) =>
    normalizeBinding({ bindingKind: kind, targetId, sourceId, expression, metadata });

  const validateBinding = (binding) => {
    const normalized = normalizeBinding(binding);
    const handler = kinds.get(normalized.bindingKind);
    if (!handler?.validate) return { ok: true, errors: [] };
    const errors = handler.validate(normalized) ?? [];
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  };

  const validateAll = (bindings = []) => {
    const errors = [];
    (bindings ?? []).forEach((b) => {
      const result = validateBinding(b);
      if (!result.ok) errors.push(...result.errors);
    });
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
  };

  const resolveBindings = (object) => {
    const bindings = normalizeAll(object.bindings ?? []);
    return Object.freeze({ ...object, bindings });
  };

  return Object.freeze({
    version: BINDING_ENGINE_VERSION,
    registerBindingKind,
    normalizeBinding,
    normalizeAll,
    createBinding,
    validateBinding,
    validateAll,
    resolveBindings,
    listKinds: () => [...kinds.keys()],
  });
}

export default createBindingEngine;

/**
 * Metadata declarativa de histórico por módulo.
 */
export function buildMakHistoryMetadata(overrides = {}) {
  return {
    enabled: overrides.enabled ?? true,
    pageSize: overrides.pageSize ?? 50,
    actions: overrides.actions ?? ["create", "update", "delete"],
    ...overrides,
  };
}

export default buildMakHistoryMetadata;

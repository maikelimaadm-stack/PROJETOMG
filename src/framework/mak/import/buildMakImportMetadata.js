/**
 * Metadata declarativa de importação por módulo.
 */
export function buildMakImportMetadata(overrides = {}) {
  return {
    enabled: overrides.enabled ?? true,
    acceptedFormats: overrides.acceptedFormats ?? [".csv", ".xlsx"],
    maxFileSizeMb: overrides.maxFileSizeMb ?? 10,
    columnMappings: overrides.columnMappings ?? [],
    requiredColumns: overrides.requiredColumns ?? [],
    batchSize: overrides.batchSize ?? 100,
    ...overrides,
  };
}

export default buildMakImportMetadata;

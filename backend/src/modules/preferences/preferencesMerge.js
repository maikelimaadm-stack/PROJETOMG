const isPlainObject = (value) =>
  value != null && typeof value === "object" && !Array.isArray(value);

export const deepMergePreferenceObjects = (currentValue, patchValue) => {
  if (patchValue === undefined) return currentValue;
  if (patchValue === null) return undefined;

  if (Array.isArray(patchValue)) return [...patchValue];
  if (!isPlainObject(patchValue)) return patchValue;

  const currentObject = isPlainObject(currentValue) ? currentValue : {};
  const merged = { ...currentObject };

  Object.entries(patchValue).forEach(([key, value]) => {
    const next = deepMergePreferenceObjects(currentObject[key], value);
    if (next === undefined) {
      delete merged[key];
      return;
    }
    merged[key] = next;
  });

  return merged;
};

export const getPreferenceRevision = (config) => {
  const revision = Number(config?.meta?.revision);
  if (!Number.isFinite(revision) || revision < 0) return 0;
  return Math.floor(revision);
};

export const stampPreferenceMetadata = (config, { revision, updatedAt } = {}) => {
  const base = isPlainObject(config) ? config : {};
  const safeRevision = Number.isFinite(Number(revision)) ? Math.max(0, Number(revision)) : 0;
  const safeUpdatedAt = String(updatedAt || new Date().toISOString());
  return {
    ...base,
    meta: {
      ...(isPlainObject(base.meta) ? base.meta : {}),
      revision: safeRevision,
      updatedAt: safeUpdatedAt,
    },
  };
};

export const buildSectionPatch = ({ section, patch }) => {
  const normalizedSection = String(section || "").trim();
  if (!normalizedSection) return {};
  return { [normalizedSection]: isPlainObject(patch) ? patch : {} };
};

export const toObjectOrEmpty = (value) => (isPlainObject(value) ? value : {});

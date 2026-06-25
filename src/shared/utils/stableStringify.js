const toObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};

const normalizeForStableCompare = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeForStableCompare(item));
  if (value && typeof value === "object") {
    return Object.keys(toObject(value))
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeForStableCompare(value[key]);
        return acc;
      }, {});
  }
  return value;
};

export const stableStringify = (value) => {
  try {
    return JSON.stringify(normalizeForStableCompare(value ?? null));
  } catch {
    return "";
  }
};

export const stableJsonEqual = (left, right) => stableStringify(left) === stableStringify(right);

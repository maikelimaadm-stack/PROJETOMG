import { rowToEnvelope } from "../mmmEnvelopeMapper.js";

const sortKeysDeep = (value) => {
  if (value == null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortKeysDeep(value[key]);
      return acc;
    }, {});
};

export const normalizePublishGraph = (rows) => {
  const envelopes = rows
    .map(rowToEnvelope)
    .map((envelope) => sortKeysDeep(envelope))
    .sort((a, b) => a.objectId.localeCompare(b.objectId));

  return {
    envelopes,
    objectCount: envelopes.length,
    fieldCount: envelopes.filter((item) => item.objectType === "field").length,
    screenCount: envelopes.filter((item) => ["layout", "view", "form"].includes(item.objectType)).length,
  };
};
